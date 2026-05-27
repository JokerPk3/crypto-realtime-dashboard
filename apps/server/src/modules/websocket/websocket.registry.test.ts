import { SubscriptionRegistry } from './websocket.registry';

describe('SubscriptionRegistry', () => {
  let registry: SubscriptionRegistry;

  beforeEach(() => {
    registry = new SubscriptionRegistry();
  });

  it('should allow clients to subscribe to products', () => {
    registry.subscribe('client-1', 'BTC-USD');
    registry.subscribe('client-1', 'ETH-USD');
    registry.subscribe('client-2', 'BTC-USD');

    expect(Array.from(registry.getSubscriptions('client-1'))).toEqual(['BTC-USD', 'ETH-USD']);
    expect(Array.from(registry.getSubscriptions('client-2'))).toEqual(['BTC-USD']);
    expect(Array.from(registry.getSubscribers('BTC-USD'))).toEqual(['client-1', 'client-2']);
    expect(Array.from(registry.getSubscribers('ETH-USD'))).toEqual(['client-1']);
  });

  it('should handle unsubscribing correctly', () => {
    registry.subscribe('client-1', 'BTC-USD');
    registry.subscribe('client-2', 'BTC-USD');

    registry.unsubscribe('client-1', 'BTC-USD');

    expect(Array.from(registry.getSubscriptions('client-1'))).toEqual([]);
    expect(Array.from(registry.getSubscribers('BTC-USD'))).toEqual(['client-2']);
  });

  it('should clean up completely on unsubscribeAll', () => {
    registry.subscribe('client-1', 'BTC-USD');
    registry.subscribe('client-1', 'ETH-USD');
    registry.subscribe('client-2', 'BTC-USD');

    registry.unsubscribeAll('client-1');

    expect(Array.from(registry.getSubscriptions('client-1'))).toEqual([]);
    expect(Array.from(registry.getSubscribers('BTC-USD'))).toEqual(['client-2']);
    expect(Array.from(registry.getSubscribers('ETH-USD'))).toEqual([]);
  });
});
