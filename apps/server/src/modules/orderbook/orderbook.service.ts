import { env } from '../../config/env';
import { logger } from '../../config/logger';
import { publishToChannel } from '../../config/redis';
import { REDIS_CHANNEL_PREFIX } from '../coinbase/coinbase.constants';
import type { CoinbaseL2Snapshot, CoinbaseL2Update } from '../coinbase/coinbase.types';
import type { OrderBookState, OrderBookSnapshot } from './orderbook.types';
import { ORDERBOOK_DEPTH } from './orderbook.constants';

export class OrderBookManager {
  private books: Map<string, OrderBookState> = new Map();
  private flushInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startFlushScheduler();
  }

  public applySnapshot(snapshot: CoinbaseL2Snapshot) {
    const { product_id, bids, asks } = snapshot;

    const state: OrderBookState = {
      bids: new Map(),
      asks: new Map(),
      dirty: true,
    };

    // Initialize bids
    for (const [price, size] of bids) {
      state.bids.set(price, size);
    }

    // Initialize asks
    for (const [price, size] of asks) {
      state.asks.set(price, size);
    }

    this.books.set(product_id, state);
    logger.info(`OrderBook snapshot applied for ${product_id}`);
  }

  public applyDelta(update: CoinbaseL2Update) {
    const { product_id, changes } = update;
    const state = this.books.get(product_id);

    if (!state) {
      return;
    }

    for (const [side, price, size] of changes) {
      const bookSide = side === 'buy' ? state.bids : state.asks;

      if (size === '0' || size === '0.00000000') {
        bookSide.delete(price);
      } else {
        bookSide.set(price, size);
      }
    }

    state.dirty = true;
  }

  public getTopOfBook(productId: string, depth: number = ORDERBOOK_DEPTH): OrderBookSnapshot | null {
    const state = this.books.get(productId);
    if (!state) return null;

    // Sort bids descending
    const bids = Array.from(state.bids.entries())
      .sort((a, b) => Number(b[0]) - Number(a[0]))
      .slice(0, depth);

    // Sort asks ascending
    const asks = Array.from(state.asks.entries())
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .slice(0, depth);

    return {
      type: 'orderbook',
      productId,
      bids,
      asks,
      timestamp: new Date().toISOString(),
    };
  }

  public startFlushScheduler() {
    if (this.flushInterval) return;

    this.flushInterval = setInterval(() => {
      this.flush();
    }, env.FLUSH_INTERVAL_MS);
    
    logger.info(`Started OrderBook flush scheduler at ${env.FLUSH_INTERVAL_MS}ms`);
  }

  public stopFlushScheduler() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
  }

  private async flush() {
    for (const [productId, state] of this.books.entries()) {
      if (state.dirty) {
        const snapshot = this.getTopOfBook(productId);
        if (snapshot) {
          const channel = `${REDIS_CHANNEL_PREFIX}:orderbook:${productId}`;
          await publishToChannel(channel, snapshot);
        }
        state.dirty = false;
      }
    }
  }
}

export const orderbookManager = new OrderBookManager();
