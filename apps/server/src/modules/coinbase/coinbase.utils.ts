import type { CoinbaseMessage } from './coinbase.types';

export const parseCoinbaseMessage = (data: string): CoinbaseMessage | null => {
  try {
    const parsed = JSON.parse(data) as CoinbaseMessage;
    return parsed;
  } catch {
    return null;
  }
};
