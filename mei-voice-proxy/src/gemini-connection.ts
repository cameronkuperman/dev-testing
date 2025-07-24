import { WebSocket } from 'ws';
import { EventEmitter } from 'events';
import { logger } from './logger.js';
import { config } from './config.js';
import { buildSystemPrompt, mockPatientData } from './patient-context.js';

interface GeminiMessage {
  setup?: {
    model: string;
    generationConfig?: {
      responseModalities: string[];
      speechConfig?: {
        voiceConfig?: {
          prebuiltVoiceConfig?: {
            voiceName: string;
          };
        };
      };
    };
    systemInstruction?: {
      parts: Array<{ text: string }>;
    };
  };
  realtimeInput?: {
    mediaChunks?: Array<{
      mimeType: string;
      data: string;
    }>;
  };
}

interface GeminiResponse {
  setupComplete?: {};
  serverContent?: {
    modelTurn?: {
      parts?: Array<{
        inlineData?: {
          mimeType: string;
          data: string;
        };
        text?: string;
      }>;
    };
  };
  candidates?: Array<{
    content?: {
      parts?: Array<{
        inlineData?: {
          mimeType: string;
          data: string;
        };
        text?: string;
      }>;
    };
  }>;
  audio?: string;
  usageMetadata?: any;
  modelVersion?: string;
}

export class GeminiConnection extends EventEmitter {
  private ws?: WebSocket;
  private connectionId: string;
  private apiKey: string;
  private model: string;
  private assistantType: 'mei' | 'varys';
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 3;

  constructor(connectionId: string, apiKey: string, model: string, assistantType: 'mei' | 'varys' = 'mei') {
    super();
    this.connectionId = connectionId;
    this.apiKey = apiKey;
    this.model = model;
    this.assistantType = assistantType;
  }

  connect(): void {
    if (this.isConnected) return;
    
    const endpoint = `${config.geminiEndpoint}?key=${this.apiKey}`;
    
    try {
      this.ws = new WebSocket(endpoint, {
        perMessageDeflate: false, // Disable compression for lower latency
        highWaterMark: config.highWaterMark,
      });
      
      this.setupEventHandlers();
    } catch (error) {
      logger.error({ connectionId: this.connectionId, error }, 'Failed to create WebSocket');
      this.emit('error', error);
    }
  }

  private setupEventHandlers(): void {
    if (!this.ws) return;

    this.ws.on('open', () => {
      logger.info({ connectionId: this.connectionId }, 'Connected to Gemini');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit('status', 'connected');
      
      // Send setup message
      this.sendSetupMessage();
    });

    this.ws.on('message', (data: Buffer) => {
      try {
        const responseText = data.toString();
        logger.debug({ connectionId: this.connectionId, response: responseText.substring(0, 200) }, 'Raw Gemini response');
        
        const response = JSON.parse(responseText);
        
        // Check for setup complete
        if (response.setupComplete) {
          logger.info({ connectionId: this.connectionId }, 'Setup complete');
          this.emit('status', 'ready');
          
          // Don't send initial greeting - wait for user to speak
          return;
        }
        
        // Check different possible response formats
        if (response.candidates && response.candidates.length > 0) {
          const candidate = response.candidates[0];
          if (candidate.content?.parts) {
            for (const part of candidate.content.parts) {
              // Handle audio response
              if (part.inlineData?.mimeType && part.inlineData.data) {
                logger.info({ 
                  connectionId: this.connectionId, 
                  mimeType: part.inlineData.mimeType,
                  dataLength: part.inlineData.data.length 
                }, 'Received audio from Gemini');
                
                const audioBuffer = Buffer.from(part.inlineData.data, 'base64');
                this.emit('audio', audioBuffer.buffer.slice(
                  audioBuffer.byteOffset,
                  audioBuffer.byteOffset + audioBuffer.byteLength
                ));
              }
              
              // Handle text response
              if (part.text) {
                logger.info({ connectionId: this.connectionId, text: part.text }, 'Received text from Gemini');
              }
            }
          }
        } else if (response.audio) {
          // Direct audio response format
          logger.info({ connectionId: this.connectionId }, 'Received direct audio response');
          const audioBuffer = Buffer.from(response.audio, 'base64');
          this.emit('audio', audioBuffer.buffer.slice(
            audioBuffer.byteOffset,
            audioBuffer.byteOffset + audioBuffer.byteLength
          ));
        } else if (response.serverContent?.modelTurn?.parts) {
          // This is the actual format used by Gemini Live API
          logger.info({ connectionId: this.connectionId }, 'Received serverContent format');
          
          for (const part of response.serverContent.modelTurn.parts) {
            if (part.inlineData?.mimeType && part.inlineData.data) {
              logger.info({ 
                connectionId: this.connectionId, 
                mimeType: part.inlineData.mimeType,
                dataLength: part.inlineData.data.length 
              }, 'Received audio in serverContent format');
              
              const audioBuffer = Buffer.from(part.inlineData.data, 'base64');
              this.emit('audio', audioBuffer.buffer.slice(
                audioBuffer.byteOffset,
                audioBuffer.byteOffset + audioBuffer.byteLength
              ));
            }
            
            if (part.text) {
              logger.info({ connectionId: this.connectionId, text: part.text }, 'Received text in serverContent format');
            }
          }
        }
      } catch (error) {
        logger.error({ connectionId: this.connectionId, error, data: data.toString().substring(0, 200) }, 'Failed to parse Gemini response');
      }
    });

    this.ws.on('close', (code, reason) => {
      logger.info({ connectionId: this.connectionId, code, reason: reason.toString() }, 'Gemini connection closed');
      this.isConnected = false;
      this.emit('status', 'disconnected');
      
      // Attempt reconnection for recoverable errors
      if (code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        setTimeout(() => this.connect(), 1000 * this.reconnectAttempts);
      } else {
        this.emit('close');
      }
    });

    this.ws.on('error', (error) => {
      logger.error({ connectionId: this.connectionId, error }, 'Gemini WebSocket error');
      this.emit('error', error);
    });
  }

  private sendSetupMessage(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    // Build the system instruction with patient context
    const systemPrompt = buildSystemPrompt(mockPatientData);
    
    // Choose model based on assistant type
    const modelName = this.assistantType === 'mei' 
      ? 'models/gemini-2.0-flash-live-001'  // Testing with 2.0 for audio quality
      : 'models/gemini-2.5-flash-exp-native-audio-thinking-dialog';
    
    // Use the correct format for Gemini Live API
    const setupMessage = {
      setup: {
        model: modelName,
        generation_config: {
          response_modalities: ['AUDIO'],
          speech_config: {
            voice_config: {
              prebuilt_voice_config: {
                voice_name: this.assistantType === 'mei' ? 'Aoede' : 'Charon' // Different voices
              }
            }
          }
        },
        system_instruction: {
          parts: [{
            text: this.assistantType === 'mei' 
              ? systemPrompt + `\n\nINTELLIGENT DOCTOR APPROACH:
1. NEVER repeat what they said - acknowledge and investigate
2. Think like a skilled physician - gather info naturally
3. Ask multiple follow-ups if needed to understand properly
4. Show your medical reasoning without being condescending
5. Give confident advice once you have enough information

EXAMPLE INTERACTIONS:
Patient: "I have a headache"
You: "Okay, where exactly is the pain? Front, back, one side?"
Patient: "Right side, behind my eye"
You: "Hmm, and how long has this been going on? Is it throbbing or more constant?"
Patient: "Started this morning, throbbing"
You: "Any nausea or sensitivity to light with it?"
(Gathering info for differential - migraine vs cluster vs tension)

Patient: "My stomach hurts"
You: "What kind of pain are you feeling - cramping, burning, sharp?"
Patient: "Burning, especially after I eat"
You: "Interesting. Have you been under more stress lately? And are you taking any NSAIDs?"
(Thinking reflux vs gastritis vs ulcer, considering their med list)

Patient: "I've been feeling really tired"
You: "How's your sleep been? Getting your usual hours?"
Patient: "Yeah, 8 hours but still exhausted"
You: "Okay, and any other symptoms - headaches, feeling cold, changes in weight?"
Patient: "Actually yeah, I've been pretty cold"
You: "Let me think... with your vitamin D being borderline and these symptoms, could be worth checking your thyroid and iron levels too. Fatigue with cold intolerance often points that direction."

Patient: "Hi Mei"
You: "Hey Cameron, what's going on?"
(Simple, ready to help with whatever they bring up)`
              : systemPrompt + `\n\nINTELLIGENT DOCTOR APPROACH (VARYS):
You are Varys, an intelligent medical assistant like Mei, but with enhanced reasoning capabilities. You handle the same medical questions but with deeper analytical thinking.

1. NEVER repeat what they said - acknowledge and investigate
2. Think deeply - you have more reasoning power, use it
3. Ask multiple follow-ups if needed to understand properly
4. Show your analytical process when it helps
5. Give confident, well-reasoned advice

SAME PURPOSE AS MEI BUT WITH REASONING MODE:
- Handle all the same medical questions
- More thoughtful analysis of complex cases
- Better at connecting subtle patterns
- Can reason through differential diagnoses more thoroughly
- Still conversational and helpful

EXAMPLE INTERACTIONS:
Patient: "I have a headache"
You: "Where exactly is the pain, and what type - sharp, throbbing, pressure?"
(Using reasoning to consider migraine vs cluster vs tension vs secondary causes)

Patient: "My stomach hurts"
You: "What kind of pain - burning, cramping, sharp? And when does it happen in relation to meals?"
(Reasoning through GERD vs gastritis vs functional dyspepsia vs ulcer)

Patient: "I've been feeling really tired"
You: "How long has this been going on? And is your sleep quality good even though you're getting enough hours?"
(Thinking through anemia vs thyroid vs sleep apnea vs depression vs chronic fatigue)

Patient: "Hi Varys"
You: "Hey Cameron, what's going on?"
(Same friendly approach as Mei, just with better reasoning when needed)`
          }]
        }
      }
    };

    this.ws.send(JSON.stringify(setupMessage), (error) => {
      if (error) {
        logger.error({ connectionId: this.connectionId, error }, 'Failed to send setup message');
      } else {
        logger.info({ connectionId: this.connectionId, model: setupMessage.setup.model }, 'Setup message sent');
        // Don't emit ready here - wait for setupComplete response
      }
    });
  }

  sendAudio(data: ArrayBuffer): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    // Use realtime_input for live audio streaming
    const audioMessage = {
      realtime_input: {
        media_chunks: [{
          mime_type: 'audio/pcm;rate=16000',
          data: Buffer.from(data).toString('base64'),
        }],
      },
    };

    this.ws.send(JSON.stringify(audioMessage), (error) => {
      if (error) {
        logger.error({ connectionId: this.connectionId, error }, 'Failed to send audio');
      }
    });
  }
  
  sendText(text: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      logger.warn({ connectionId: this.connectionId }, 'Cannot send text - WebSocket not open');
      return;
    }

    // Use the correct format for client content
    const textMessage = {
      client_content: {
        turns: [{
          role: 'user',
          parts: [{
            text: text
          }]
        }],
        turn_complete: true
      }
    };

    this.ws.send(JSON.stringify(textMessage), (error) => {
      if (error) {
        logger.error({ connectionId: this.connectionId, error }, 'Failed to send text');
      } else {
        logger.info({ connectionId: this.connectionId, text: text.substring(0, 100) }, 'Sent text to Gemini');
      }
    });
  }

  disconnect(): void {
    this.isConnected = false;
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = undefined;
    }
  }
}