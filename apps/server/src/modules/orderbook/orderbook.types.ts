export interface OrderBookState {
  bids: Map<string, string>; // price -> size
  asks: Map<string, string>; // price -> size
  dirty: boolean;
  sequence?: number;
}

export interface OrderBookSnapshot {
  type: 'orderbook';
  productId: string;
  bids: [string, string][];
  asks: [string, string][];
  timestamp: string;
}
