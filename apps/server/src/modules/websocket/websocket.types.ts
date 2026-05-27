export interface ClientMessage {
  type: 'subscribe' | 'unsubscribe';
  products: string[];
}

export type ServerMessage =
  | { type: 'welcome'; clientId: string }
  | { type: 'subscribed'; products: string[] }
  | { type: 'unsubscribed'; products: string[] }
  | { type: 'error'; message: string }
  | { type: 'orderbook'; productId: string; bids: [string, string][]; asks: [string, string][]; timestamp: string }
  | { type: 'trade'; id?: string; productId: string; side: string; price: string; size: string; tradeId: string; timestamp: Date | string }
  | { type: 'system_status'; channels: Record<string, unknown>[] };
