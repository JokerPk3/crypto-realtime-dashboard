import { HealthService } from './health.service';

jest.mock('../../config/redis', () => ({
  redisPublisher: {
    ping: jest.fn().mockResolvedValue('PONG'),
  },
  redisSubscriber: {
    ping: jest.fn().mockResolvedValue('PONG'),
  },
}));

describe('HealthService', () => {
  it('should return true for checkRedis when pings succeed', async () => {
    const isOk = await HealthService.checkRedis();
    expect(isOk).toBe(true);
  });

  it('should return the ready status with uptime', async () => {
    const status = await HealthService.getReadyStatus();
    expect(status.status).toBe('ok');
    expect(status.components.redis).toBe('ok');
    expect(status.uptime).toBeGreaterThan(0);
  });
});
