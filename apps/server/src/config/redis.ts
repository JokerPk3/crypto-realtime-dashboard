import Redis from 'ioredis';
import { env } from './env';
import { logger } from './logger';

const createRedisClient = (name: string) => {
  const client = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  });

  client.on('connect', () => {
    logger.info(`Redis ${name} connected`);
  });

  client.on('error', (error) => {
    logger.error(`Redis ${name} error:`, error);
  });

  client.on('reconnecting', () => {
    logger.warn(`Redis ${name} reconnecting`);
  });

  return client;
};

// Publisher connection for sending messages
export const redisPublisher = createRedisClient('publisher');

// Subscriber connection for listening to channels
export const redisSubscriber = createRedisClient('subscriber');

export const publishToChannel = async (channel: string, data: unknown) => {
  try {
    await redisPublisher.publish(channel, JSON.stringify(data));
  } catch (error) {
    logger.error(`Failed to publish to channel ${channel}:`, error);
  }
};

export const subscribeToChannel = async (channel: string, _callback: (message: unknown) => void) => {
  try {
    await redisSubscriber.subscribe(channel);
    
    logger.info(`Subscribed to Redis channel: ${channel}`);
  } catch (error) {
    logger.error(`Failed to subscribe to channel ${channel}:`, error);
  }
};

// Global message handler for the subscriber
redisSubscriber.on('message', (channel, message) => {
  try {
    const data = JSON.parse(message) as unknown;
    logger.debug(`Received message on channel ${channel}`, { data });
  } catch (error) {
    logger.error(`Failed to parse message from channel ${channel}:`, error);
  }
});
