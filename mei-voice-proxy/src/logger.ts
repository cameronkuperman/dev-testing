import pino from 'pino';
import { config } from './config.js';

const options: pino.LoggerOptions = {
  level: config.logLevel,
  timestamp: pino.stdTimeFunctions.isoTime,
};

// Use pretty logging in development
if (config.logPretty && process.env.NODE_ENV !== 'production') {
  options.transport = {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss.l',
      ignore: 'pid,hostname',
    },
  };
}

export const logger = pino(options);