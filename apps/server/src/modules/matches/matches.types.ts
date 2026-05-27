export interface Trade {
  id?: string;
  productId: string;
  side: string;
  price: string; // Using string to preserve precision from Coinbase
  size: string;
  tradeId: string;
  timestamp: Date;
}
