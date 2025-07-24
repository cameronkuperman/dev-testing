#!/bin/bash
echo "Starting Mei Voice Proxy Server..."
echo "API Key: ${GEMINI_API_KEY:0:10}..." # Only show first 10 chars
npm run dev