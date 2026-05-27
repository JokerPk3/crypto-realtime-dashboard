import type { Request, Response } from 'express';
import { systemStatusService } from './system-status.service';
import { systemStatusRepository } from './system-status.repository';

export class SystemStatusController {
  public static getStatus(req: Request, res: Response) {
    const status = systemStatusService.getStatus();
    res.status(200).json({ success: true, status });
  }

  public static async getEvents(req: Request, res: Response) {
    const limit = Number(req.query.limit) || 20;
    const events = await systemStatusRepository.getRecentEvents(limit);
    res.status(200).json({ success: true, events });
  }
}
