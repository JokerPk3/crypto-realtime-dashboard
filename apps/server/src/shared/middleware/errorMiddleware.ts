import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors';
import { logger } from '../../config/logger';
import { env } from '../../config/env';

export const errorMiddleware = (err: Error, req: Request, res: Response, _next: NextFunction) => {
  let error = err;

  if (!(error instanceof AppError)) {
    // Convert generic errors to AppError
    const statusCode = (error as { statusCode?: number }).statusCode || 500;
    const message = error.message || 'Internal Server Error';
    error = new AppError(message, statusCode);
  }

  const appError = error as AppError;

  // Log error
  if (appError.isOperational) {
    logger.warn(appError.message, { context: appError.context, path: req.path });
  } else {
    logger.error('Unexpected error', { error: err, path: req.path });
  }

  // Response payload
  const payload: Record<string, unknown> = {
    success: false,
    error: {
      message: appError.message,
      statusCode: appError.statusCode,
    },
  };

  // Include stack trace only in development
  if (env.NODE_ENV === 'development') {
    (payload.error as Record<string, unknown>).stack = err.stack;
  }

  res.status(appError.statusCode).json(payload);
};
