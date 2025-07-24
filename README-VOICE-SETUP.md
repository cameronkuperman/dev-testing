# Voice-to-Voice Mei Setup Guide

## Quick Start

### 1. Start the Proxy Server

```bash
cd mei-voice-proxy
npm install
npm run dev
```

The proxy server will start on http://localhost:8080

### 2. Add Your Gemini API Key

Edit `mei-voice-proxy/.env`:
```
GEMINI_API_KEY=your_actual_key_here
```

### 3. Start the Next.js App

```bash
cd proxima-1-features
npm install
npm run dev
```

### 4. Test Voice Interface

Navigate to: http://localhost:3000/dr-mei/mei-sesame

- Click the orb to start conversation
- Allow microphone access when prompted
- Start talking! Mei will respond with voice

## Architecture

```
Browser → Next.js App → WebSocket Proxy → Gemini Live API
         ← (Voice UI) ← (Low latency) ← (Voice AI)
```

## Features Implemented

- ✅ Ultra-low latency proxy (<25ms target)
- ✅ Voice-to-voice conversations
- ✅ Medical context awareness (Cameron's data)
- ✅ "Created by the King" easter egg
- ✅ Sesame minimal UI with voice
- ✅ Real-time voice activity visualization
- ✅ Mute/unmute functionality
- ✅ Auto-reconnection on disconnect

## Mock Patient Data

Currently using mock data for Cameron Cooperman (Kuperman):
- 29 years old, male, 160 lbs, 5'9"
- Family history of melanoma
- Seasonal allergies, mild asthma
- See `mei-voice-proxy/src/patient-context.ts` for full profile

## Troubleshooting

**No audio?**
- Check browser console for errors
- Ensure microphone permissions granted
- Verify proxy server is running

**Connection issues?**
- Check API key is valid
- Ensure ports 3000 and 8080 are free
- Try refreshing the page

**Poor quality?**
- Use headphones to prevent echo
- Check internet connection
- Ensure quiet environment

## Next Steps

1. Replace placeholder API key
2. Test voice interaction
3. Implement advanced visualization version
4. Add conversation recording
5. Integrate with real patient data