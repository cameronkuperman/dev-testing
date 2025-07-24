const WebSocket = require('ws');
require('dotenv').config();

console.log('Testing Gemini Live API with proper format...');

const apiKey = process.env.GEMINI_API_KEY;
const endpoint = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${apiKey}`;

const ws = new WebSocket(endpoint);

ws.on('open', () => {
  console.log('✅ Connected');
  
  // Send setup with correct format
  const setup = {
    setup: {
      model: 'models/gemini-2.0-flash-live-001',
      generation_config: {
        response_modalities: ['AUDIO'],
        speech_config: {
          voice_config: {
            prebuilt_voice_config: {
              voice_name: 'Aoede'
            }
          }
        }
      }
    }
  };
  
  ws.send(JSON.stringify(setup));
  console.log('📤 Sent setup');
});

ws.on('message', (data) => {
  const response = JSON.parse(data.toString());
  console.log('📥 Response:', JSON.stringify(response, null, 2));
  
  if (response.setupComplete) {
    console.log('✅ Setup complete, sending message...');
    
    // Send a client message
    const message = {
      client_content: {
        turns: [{
          role: 'user',
          parts: [{
            text: 'Hello Mei, please introduce yourself.'
          }]
        }],
        turn_complete: true
      }
    };
    
    ws.send(JSON.stringify(message));
    console.log('📤 Sent message');
  }
  
  if (response.serverContent?.modelTurn?.parts) {
    console.log('🎵 Received response parts');
  }
});

ws.on('error', (error) => {
  console.error('❌ Error:', error);
});

// Close after 15 seconds
setTimeout(() => {
  ws.close();
  process.exit(0);
}, 15000);