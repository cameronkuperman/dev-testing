import { WebSocket } from 'ws';
import { EventEmitter } from 'events';
import { logger } from './logger.js';

interface ClientMessage {
  type: 'audio' | 'control' | 'text';
  data?: string; // Base64 encoded audio
  action?: 'start' | 'stop' | 'mute';
  text?: string;
  mimeType?: string;
}

interface ServerMessage {
  type: 'audio' | 'status' | 'error';
  data?: string; // Base64 encoded audio
  status?: string;
  error?: string;
}

export class ClientConnection extends EventEmitter {
  private ws: WebSocket;
  private connectionId: string;
  private isAlive: boolean = true;
  private pingInterval?: NodeJS.Timeout;

  constructor(ws: WebSocket, connectionId: string) {
    super();
    this.ws = ws;
    this.connectionId = connectionId;
    
    this.setupEventHandlers();
    this.startHeartbeat();
  }

  private setupEventHandlers(): void {
    this.ws.on('message', (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString()) as ClientMessage;
        
        switch (message.type) {
          case 'audio':
            if (message.data) {
              // For now, pass the audio data as-is
              // The server will need to handle conversion from webm to PCM
              this.emit('audio', message.data, message.mimeType || 'audio/pcm');
            }
            break;
            
          case 'control':
            if (message.action) {
              this.emit('control', message.action);
            }
            break;
            
          case 'text':
            if (message.text) {
              this.emit('text', message.text);
            }
            break;
        }
      } catch (error) {
        logger.error({ connectionId: this.connectionId, error }, 'Failed to parse client message');
      }
    });

    this.ws.on('pong', () => {
      this.isAlive = true;
    });

    this.ws.on('close', () => {
      this.stopHeartbeat();
      this.emit('close');
    });

    this.ws.on('error', (error) => {
      logger.error({ connectionId: this.connectionId, error }, 'WebSocket error');
      this.emit('error', error);
    });
  }

  private startHeartbeat(): void {
    this.pingInterval = setInterval(() => {
      if (!this.isAlive) {
        this.ws.terminate();
        return;
      }
      
      this.isAlive = false;
      this.ws.ping();
    }, 30000); // 30 second heartbeat
  }

  private stopHeartbeat(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }
  }

  sendAudio(data: ArrayBuffer): void {
    if (this.ws.readyState !== WebSocket.OPEN) return;
    
    const message: ServerMessage = {
      type: 'audio',
      data: Buffer.from(data).toString('base64'),
    };
    
    this.ws.send(JSON.stringify(message), (error) => {
      if (error) {
        logger.error({ connectionId: this.connectionId, error }, 'Failed to send audio');
      }
    });
  }

  sendStatus(status: string): void {
    if (this.ws.readyState !== WebSocket.OPEN) return;
    
    const message: ServerMessage = {
      type: 'status',
      status,
    };
    
    this.ws.send(JSON.stringify(message));
  }

  sendError(error: string): void {
    if (this.ws.readyState !== WebSocket.OPEN) return;
    
    const message: ServerMessage = {
      type: 'error',
      error,
    };
    
    this.ws.send(JSON.stringify(message));
  }

  close(): void {
    this.stopHeartbeat();
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.close();
    }
  }
}