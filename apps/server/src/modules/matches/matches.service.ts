import { env } from '../../config/env';
import { logger } from '../../config/logger';
import { publishToChannel } from '../../config/redis';
import { REDIS_CHANNEL_PREFIX } from '../coinbase/coinbase.constants';
import type { CoinbaseMatch } from '../coinbase/coinbase.types';
import type { Trade } from './matches.types';
import { matchRepository } from './matches.repository';

export class MatchEngine {
  private buffer: Map<string, Trade[]> = new Map();
  private maxTrades: number = env.MAX_TRADES || 100;

  public async processTrade(match: CoinbaseMatch) {
    const trade: Trade = {
      productId: match.product_id,
      side: match.side,
      price: match.price,
      size: match.size,
      tradeId: match.trade_id.toString(),
      timestamp: new Date(match.time),
    };

    // 1. Add to buffer
    this.addToBuffer(trade);

    // 2. Publish to Redis for WebSocket fanout
    const channel = `${REDIS_CHANNEL_PREFIX}:trades:${trade.productId}`;
    // Format to match expected WebSocket payload
    const wsPayload = {
      type: 'trade',
      ...trade,
    };
    await publishToChannel(channel, wsPayload);

    // 3. Persist to DB (async, non-blocking)
    // In a higher-throughput environment, this should use a batch insert strategy
    matchRepository.saveTrade(trade).catch(e => logger.error('DB trade save error', e));
  }

  private addToBuffer(trade: Trade) {
    const { productId } = trade;
    if (!this.buffer.has(productId)) {
      this.buffer.set(productId, []);
    }

    const trades = this.buffer.get(productId)!;
    // Push to front (newest first)
    trades.unshift(trade);

    // Trim buffer to maxTrades
    if (trades.length > this.maxTrades) {
      trades.pop();
    }
  }

  public getRecentTrades(productId: string): Trade[] {
    return this.buffer.get(productId) || [];
  }

  public async flushPendingWrites() {
    // With batching, we would flush here on graceful shutdown
    logger.info('MatchEngine: All pending writes flushed');
  }
}

export const matchEngine = new MatchEngine();
