export interface CoinbaseSubscribeMessage {
  type: 'subscribe';
  product_ids: string[];
  channels: (string | { name: string; product_ids: string[] })[];
}

export interface CoinbaseL2Snapshot {
  type: 'snapshot';
  product_id: string;
  bids: [string, string][];
  asks: [string, string][];
}

export interface CoinbaseL2Update {
  type: 'l2update';
  product_id: string;
  changes: [string, string, string][]; // [side, price, size]
  time: string;
}

export interface CoinbaseMatch {
  type: 'match' | 'last_match';
  trade_id: number;
  sequence: number;
  maker_order_id: string;
  taker_order_id: string;
  time: string;
  product_id: string;
  size: string;
  price: string;
  side: 'buy' | 'sell';
}

export interface CoinbaseStatus {
  type: 'status';
  products: Record<string, unknown>[];
  currencies: Record<string, unknown>[];
}

export interface CoinbaseError {
  type: 'error';
  message: string;
  reason: string;
}

export type CoinbaseMessage =
  | CoinbaseL2Snapshot
  | CoinbaseL2Update
  | CoinbaseMatch
  | CoinbaseStatus
  | CoinbaseError
  | { type: 'subscriptions'; channels: Record<string, unknown>[] };
