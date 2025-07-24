import { WebSocketServer, WebSocket } from 'ws';
import { createServer, IncomingMessage, ServerResponse } from 'http';
import { config } from './config.js';
import { logger } from './logger.js';
import { GeminiConnection } from './gemini-connection.js';
import { ClientConnection } from './client-connection.js';

// Create HTTP server with CORS handling
const server = createServer((req: IncomingMessage, res: ServerResponse) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
    return;
  }
  
  // Health check endpoint
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'healthy', connections: connections.size }));
    return;
  }
  
  // Default response for non-WebSocket requests
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('WebSocket proxy server is running');
});
const wss = new WebSocketServer({ 
  server,
  perMessageDeflate: false, // Disable compression for lower latency
});

// Track active connections
const connections = new Map<string, {
  client: ClientConnection;
  gemini: GeminiConnection;
}>();

wss.on('connection', async (ws: WebSocket, req) => {
  const connectionId = crypto.randomUUID();
  logger.info({ 
    connectionId, 
    url: req.url,
    headers: req.headers,
    origin: req.headers.origin 
  }, 'New WebSocket connection');

  try {
    // Create client connection handler
    const client = new ClientConnection(ws, connectionId);
    
    // Parse query params to determine which assistant to use
    const url = new URL(req.url || '/', `http://${req.headers.host}`);
    const assistantType = url.searchParams.get('assistant') || 'mei';
    
    // Create Gemini connection with specified assistant type
    const gemini = new GeminiConnection(
      connectionId, 
      config.geminiApiKey, 
      config.geminiModel,
      assistantType as 'mei' | 'varys'
    );
    
    // Store connection pair
    connections.set(connectionId, { client, gemini });
    
    logger.info({ connectionId, assistantType }, 'Using assistant');
    
    // Set up bidirectional message forwarding
    client.on('audio', (data: string, mimeType: string) => {
      // Handle base64 PCM audio from client
      if (mimeType === 'audio/pcm' || !mimeType) {
        try {
          const audioBuffer = Buffer.from(data, 'base64');
          gemini.sendAudio(audioBuffer.buffer.slice(
            audioBuffer.byteOffset,
            audioBuffer.byteOffset + audioBuffer.byteLength
          ));
        } catch (error) {
          logger.error({ connectionId, error }, 'Failed to process audio');
        }
      } else {
        logger.warn({ connectionId, mimeType }, 'Unsupported audio format');
      }
    });
    
    client.on('text', (text: string) => {
      logger.info({ connectionId, text }, 'Text message received');
      gemini.sendText(text);
    });
    
    client.on('control', (action: string) => {
      switch (action) {
        case 'start':
          gemini.connect();
          break;
        case 'stop':
          gemini.disconnect();
          break;
      }
    });
    
    gemini.on('audio', (data: ArrayBuffer) => {
      client.sendAudio(data);
    });
    
    gemini.on('status', (status: string) => {
      client.sendStatus(status);
    });
    
    gemini.on('error', (error: Error) => {
      client.sendError(error.message);
    });
    
    // Handle client disconnect
    client.on('close', () => {
      logger.info({ connectionId }, 'Client disconnected');
      gemini.disconnect();
      connections.delete(connectionId);
    });
    
    gemini.on('close', () => {
      logger.info({ connectionId }, 'Gemini disconnected');
      client.close();
      connections.delete(connectionId);
    });
    
  } catch (error) {
    logger.error({ connectionId, error }, 'Connection setup failed');
    ws.close(1011, 'Server error');
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, closing connections...');
  connections.forEach(({ client, gemini }) => {
    gemini.disconnect();
    client.close();
  });
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

server.listen(config.port, config.host, () => {
  logger.info({ port: config.port, host: config.host }, 'WebSocket proxy server started');
});