import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config({ path: '../../.env' });

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  COINBASE_WS_URL: z.string().url().default('wss://ws-feed.exchange.coinbase.com'),
  REDIS_URL: z.string().url().default('redis://localhost:6379'),
  FLUSH_INTERVAL_MS: z.coerce.number().default(50),
  MAX_TRADES: z.coerce.number().default(200),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

const parseEnv = () => {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:', parsed.error.format());
    process.exit(1);
  }

  return parsed.data;
};

export const env = parseEnv();
