import { logger } from '../../config/logger';

export class SystemStatusRepository {
  public async logEvent(eventType: string, message: string, metadata?: Record<string, unknown>) {
    // Log to console instead of DB (no persistence needed per assignment)
    logger.info(`[${eventType}] ${message}`, metadata || {});
  }

  public async getRecentEvents(limit: number = 20) {
    // No event history needed - all real-time
    return [];
  }
}

export const systemStatusRepository = new SystemStatusRepository();
