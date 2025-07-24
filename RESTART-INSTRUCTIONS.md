# How to Restart and Test Voice System

## 1. Kill all processes

```bash
# Kill proxy server
lsof -ti:8080 | xargs kill -9 2>/dev/null || true

# Kill Next.js
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
```

## 2. Start Proxy Server (Terminal 1)

```bash
cd mei-voice-proxy
npm run dev
```

Wait for: "WebSocket proxy server started"

## 3. Start Next.js App (Terminal 2)

```bash
cd proxima-1-features
npm run dev
```

## 4. Test Voice System

1. Go to: http://localhost:3000/dr-mei/mei-sesame
2. Click the orb to start
3. Allow microphone access
4. You should hear Mei introduce herself!

## 5. Debug if needed

Visit: http://localhost:3000/dr-mei/mei-sesame/debug

Check proxy logs in Terminal 1 for:
- "Setup complete"
- "Sent text to Gemini"
- "Received audio in serverContent format"

## Common Issues:

**No audio?**
- Check browser console for errors
- Make sure speakers/headphones are connected
- Check proxy logs for audio responses

**Can't connect?**
- Verify proxy is running on port 8080
- Check API key is correct in .env
- Try refreshing the page

**Still not working?**
- Run the test: `cd mei-voice-proxy && node test-live-api.js`
- Should see audio data in response