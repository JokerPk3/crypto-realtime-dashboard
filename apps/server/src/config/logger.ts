import winston from 'winston';
import 'winston-daily-rotate-file';
import { env } from './env';

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Custom log format
const logFormat = printf(({ level, message, timestamp, stack, context, ...metadata }) => {
  const ctx = context ? `[${context}] ` : '';
  const metaStr = Object.keys(metadata).length ? JSON.stringify(metadata) : '';
  return `${timestamp} ${level}: ${ctx}${message} ${metaStr} ${stack || ''}`;
});

const fileTransportRotate = new winston.transports.DailyRotateFile({
  filename: 'logs/app-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  level: env.LOG_LEVEL,
});

const errorFileTransport = new winston.transports.DailyRotateFile({
  filename: 'logs/error-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  level: 'error',
});

const consoleTransport = new winston.transports.Console({
  format: combine(
    colorize({ all: true }),
    logFormat
  ),
});

export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    logFormat
  ),
  transports: [
    fileTransportRotate,
    errorFileTransport,
    ...(env.NODE_ENV !== 'production' ? [consoleTransport] : []),
  ],
});
