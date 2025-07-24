# Mei Voice Proxy Server

Ultra-low latency WebSocket proxy for Gemini Live API voice streaming.

## Architecture

```
Browser <--WebSocket--> Proxy Server <--WebSocket--> Gemini Live API
         JSON+Base64                    JSON+Base64
         16kHz→24kHz                    Native Protocol
```

## Features

- **Ultra-low latency**: Optimized for <25ms added latency
  - No compression (disabled deflate)
  - Small buffer sizes (4KB default)
  - Direct memory passing
  - Minimal JSON parsing

- **Automatic reconnection**: Handles network interruptions
- **Health monitoring**: WebSocket heartbeat/ping-pong
- **Structured logging**: Using Pino for performance

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
# Edit .env with your Gemini API key
```

3. Run development server:
```bash
npm run dev
```

## WebSocket Protocol

### Client → Server Messages

```typescript
// Audio data
{
  "type": "audio",
  "data": "base64_encoded_pcm_16khz"
}

// Control commands
{
  "type": "control",
  "action": "start" | "stop" | "mute"
}
```

### Server → Client Messages

```typescript
// Audio response
{
  "type": "audio",
  "data": "base64_encoded_pcm_24khz"
}

// Status updates
{
  "type": "status",
  "status": "connected" | "ready" | "disconnected"
}

// Errors
{
  "type": "error",
  "error": "error message"
}
```

## Performance Tuning

For lowest latency:
- Run on same network/region as clients
- Use wired connection
- Disable system power saving
- Consider using PM2 with cluster mode
- Monitor with: `npm run monitor`

## Production Deployment

```bash
# Build TypeScript
npm run build

# Run with PM2
pm2 start dist/index.js --name mei-proxy -i max

# Or with systemd
sudo systemctl start mei-proxy
```

## Monitoring

The proxy logs detailed timing information:
- Connection setup time
- Message processing time
- Audio chunk forwarding latency

Use these metrics to ensure <25ms target latency.