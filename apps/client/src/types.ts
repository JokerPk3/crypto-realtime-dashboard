export interface ServerMessage {
  type: 'welcome' | 'subscribed' | 'unsubscribed' | 'error' | 'orderbook' | 'trade' | 'system_status';
  clientId?: string;
  products?: string[];
  message?: string;
  productId?: string;
  bids?: [string, string][];
  asks?: [string, string][];
  timestamp?: string;
  id?: string;
  side?: string;
  price?: string;
  size?: string;
  tradeId?: string;
  channels?: Channel[];
}

export interface Channel {
  name: string;
  product_ids: string[];
}

export interface Trade {
  id?: string;
  productId: string;
  side: string;
  price: string;
  size: string;
  tradeId: string;
  timestamp: string;
}

export interface OrderBook {
  bids: [string, string][];
  asks: [string, string][];
}
