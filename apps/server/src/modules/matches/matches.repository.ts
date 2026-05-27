import type { Trade } from './matches.types';
import { logger } from '../../config/logger';

export class MatchRepository {
  public async saveTrade(trade: Trade) {
    // No persistence needed - trades are handled in-memory by MatchEngine
    logger.debug(`Trade recorded: ${trade.productId} ${trade.side} @ ${trade.price}`);
  }

  public async getRecentTrades(productId: string, limit: number = 50) {
    // No DB - trades come from real-time stream
    return [];
  }
}

export const matchRepository = new MatchRepository();
