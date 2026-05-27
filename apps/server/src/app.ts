import express from 'express';
import type { Application, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { logger } from './config/logger';
import { healthRouter } from './modules/health/health.router';
import { tradesRouter } from './modules/trades/trades.router';
import { systemStatusRouter } from './modules/system-status/system-status.router';
import { orderbookRouter } from './modules/orderbook/orderbook.router';
import { metricsRouter } from './modules/metrics/metrics.router';
import { errorMiddleware } from './shared/middleware/errorMiddleware';
import { notFoundMiddleware } from './shared/middleware/notFoundMiddleware';

const app: Application = express();

// 1. Security headers
app.use(helmet());

// 2. CORS
app.use(cors({
  origin: '*', // TODO: restrict in production
  methods: ['GET', 'POST'],
}));

// 3. Compression
app.use(compression());

// 4. Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: 'Too many requests from this IP, please try again after 15 minutes',
});

// Apply rate limiter to all API routes
app.use('/api', limiter);

// 5. Request logging
app.use(morgan('combined', {
  stream: {
    write: (message: string) => logger.info(message.trim()),
  },
}));


// Base Route
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ success: true, message: 'Crypto Realtime Platform API' });
});

// Mount modular routers
app.use('/health', healthRouter);
app.use('/api/trades', tradesRouter);
app.use('/api/system-status', systemStatusRouter);
app.use('/api/orderbook', orderbookRouter);
app.use('/api/metrics', metricsRouter);

// 404 Handler
app.use(notFoundMiddleware);

// Global Error Handler
app.use(errorMiddleware);

export default app;
