import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors';

export const notFoundMiddleware = (req: Request, res: Response, next: NextFunction) => {
  next(AppError.notFound(`Cannot find ${req.originalUrl} on this server!`));
};
