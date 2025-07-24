import { config as dotenvConfig } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenvConfig({ path: resolve(process.cwd(), '.env') });

export const config = {
  // Server configuration
  port: parseInt(process.env.PORT || '8080', 10),
  host: process.env.HOST || '0.0.0.0',
  
  // Gemini API configuration
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-2.5-flash-preview-native-audio-dialog',
  geminiEndpoint: 'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent',
  
  // Performance tuning
  enableCompression: process.env.ENABLE_COMPRESSION === 'true',
  bufferSize: parseInt(process.env.BUFFER_SIZE || '4096', 10),
  highWaterMark: parseInt(process.env.HIGH_WATER_MARK || '16384', 10),
  
  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
  logPretty: process.env.LOG_PRETTY === 'true',
  
  // CORS
  allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(','),
} as const;

// Validate required configuration
if (!config.geminiApiKey) {
  throw new Error('GEMINI_API_KEY environment variable is required');
}