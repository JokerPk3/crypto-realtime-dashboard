import { OrderBookManager, orderbookManager } from './orderbook.service';
import type { CoinbaseL2Snapshot, CoinbaseL2Update } from '../coinbase/coinbase.types';

// Stop the default singleton scheduler to prevent open handles
orderbookManager.stopFlushScheduler();

jest.mock('../../config/redis', () => ({
  publishToChannel: jest.fn(),
}));

describe('OrderBookManager', () => {
  let manager: OrderBookManager;

  beforeEach(() => {
    manager = new OrderBookManager();
    // Stop the automatically started scheduler to prevent handles staying open
    manager.stopFlushScheduler();
  });

  afterEach(() => {
    manager.stopFlushScheduler();
  });

  it('should initialize empty orderbooks', () => {
    expect(manager.getTopOfBook('BTC-USD')).toBeNull();
  });

  it('should apply orderbook snapshot successfully', () => {
    const snapshot: CoinbaseL2Snapshot = {
      type: 'snapshot',
      product_id: 'BTC-USD',
      bids: [
        ['50000.00', '1.5'],
        ['49999.00', '2.0'],
      ],
      asks: [
        ['50001.00', '0.5'],
        ['50002.00', '3.1'],
      ],
    };

    manager.applySnapshot(snapshot);

    const result = manager.getTopOfBook('BTC-USD');
    expect(result).not.toBeNull();
    expect(result!.productId).toBe('BTC-USD');
    expect(result!.bids).toEqual([
      ['50000.00', '1.5'],
      ['49999.00', '2.0'],
    ]);
    expect(result!.asks).toEqual([
      ['50001.00', '0.5'],
      ['50002.00', '3.1'],
    ]);
  });

  it('should apply deltas and updates correct price/size bids and asks', () => {
    const snapshot: CoinbaseL2Snapshot = {
      type: 'snapshot',
      product_id: 'ETH-USD',
      bids: [['3000.00', '10.0']],
      asks: [['3001.00', '5.0']],
    };
    manager.applySnapshot(snapshot);

    const update: CoinbaseL2Update = {
      type: 'l2update',
      product_id: 'ETH-USD',
      changes: [
        ['buy', '3000.00', '12.5'], // update existing bid size
        ['buy', '2999.00', '4.0'],  // add new bid
        ['sell', '3001.00', '0'],   // delete ask
        ['sell', '3002.00', '8.0'],  // add new ask
      ],
      time: new Date().toISOString(),
    };
    manager.applyDelta(update);

    const result = manager.getTopOfBook('ETH-USD', 5);
    expect(result).not.toBeNull();
    // Bids should be sorted descending
    expect(result!.bids).toEqual([
      ['3000.00', '12.5'],
      ['2999.00', '4.0'],
    ]);
    // Asks should be sorted ascending, 3001 deleted
    expect(result!.asks).toEqual([
      ['3002.00', '8.0'],
    ]);
  });
});
