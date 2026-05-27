import { redisPublisher, redisSubscriber } from '../../config/redis';

export class HealthService {
  static getUptime() {
    return process.uptime();
  }

  static async checkRedis(): Promise<boolean> {
    try {
      const pubPing = await redisPublisher.ping();
      const subPing = await redisSubscriber.ping();
      return pubPing === 'PONG' && subPing === 'PONG';
    } catch {
      return false;
    }
  }

  static async getReadyStatus() {
    const redisOk = await this.checkRedis();

    const isReady = redisOk;

    return {
      status: isReady ? 'ok' : 'error',
      components: {
        redis: redisOk ? 'ok' : 'error',
      },
      uptime: this.getUptime(),
      timestamp: new Date().toISOString(),
    };
  }
}
