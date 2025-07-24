import WebSocket from 'ws';
import { config } from 'dotenv';

config();

console.log('Testing Gemini Live API connection...');

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey || apiKey === 'placeholder_key_here') {
  console.error('❌ Please set a valid GEMINI_API_KEY in .env file');
  process.exit(1);
}

const endpoint = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${apiKey}`;

const ws = new WebSocket(endpoint);

ws.on('open', () => {
  console.log('✅ Connected to Gemini Live API');
  
  // Send setup message
  const setupMessage = {
    setup: {
      model: 'models/gemini-2.5-flash-preview-native-audio-dialog',
      generationConfig: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: 'Aoede'
            }
          }
        }
      },
      systemInstruction: {
        parts: [{ text: 'You are a helpful assistant. Say hello!' }]
      }
    }
  };
  
  ws.send(JSON.stringify(setupMessage));
  console.log('📤 Sent setup message');
  
  // Send a test text input
  setTimeout(() => {
    const textMessage = {
      clientContent: {
        turns: [{
          parts: [{ text: 'Hello! Can you hear me?' }]
        }]
      }
    };
    ws.send(JSON.stringify(textMessage));
    console.log('📤 Sent test message');
  }, 1000);
});

ws.on('message', (data) => {
  const response = JSON.parse(data.toString());
  console.log('📥 Received:', JSON.stringify(response, null, 2));
  
  if (response.candidates?.[0]?.content?.parts?.[0]?.inlineData) {
    console.log('🎵 Received audio response!');
  }
});

ws.on('error', (error) => {
  console.error('❌ WebSocket error:', error.message);
});

ws.on('close', (code, reason) => {
  console.log(`🔌 Connection closed: ${code} - ${reason}`);
});

// Close after 10 seconds
setTimeout(() => {
  console.log('Closing test connection...');
  ws.close();
  process.exit(0);
}, 10000);