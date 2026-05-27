import type { Request, Response } from 'express';
import { orderbookManager } from './orderbook.service';
import { AppError } from '../../shared/errors';

export class OrderBookController {
  public static getSnapshot(req: Request, res: Response) {
    const { productId } = req.query;

    if (!productId || typeof productId !== 'string') {
      throw AppError.badRequest('Valid productId is required');
    }

    const depth = Number(req.query.depth) || 25;
    const snapshot = orderbookManager.getTopOfBook(productId, depth);

    if (!snapshot) {
      throw AppError.notFound(`OrderBook not available for ${productId}`);
    }

    res.status(200).json({ success: true, data: snapshot });
  }
}
