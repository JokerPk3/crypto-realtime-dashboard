import type { Request, Response } from 'express';
import { z } from 'zod';
import { matchEngine } from '../matches/matches.service';
import { matchRepository } from '../matches/matches.repository';
import { AppError } from '../../shared/errors';

export class TradesController {
  public static async getRecentTrades(req: Request, res: Response) {
    const querySchema = z.object({
      productId: z.string().min(1),
      limit: z.coerce.number().min(1).max(100).default(50),
    });

    const validation = querySchema.safeParse(req.query);
    if (!validation.success) {
      throw AppError.badRequest('Invalid query parameters', validation.error.format());
    }

    const { productId, limit } = validation.data;

    // Check memory buffer first for fastest response
    const bufferedTrades = matchEngine.getRecentTrades(productId);
    
    if (bufferedTrades.length >= limit) {
      res.status(200).json({ success: true, trades: bufferedTrades.slice(0, limit) });
      return;
    }

    // Fallback to database if not enough trades in buffer
    const trades = await matchRepository.getRecentTrades(productId, limit);
    res.status(200).json({ success: true, trades });
  }
}
