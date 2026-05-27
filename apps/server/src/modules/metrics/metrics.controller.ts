import type { Request, Response } from 'express';
import os from 'os';

export class MetricsController {
  public static getMetrics(req: Request, res: Response) {
    const metrics = {
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      osLoad: os.loadavg(),
      uptime: process.uptime(),
    };

    res.status(200).json({ success: true, metrics });
  }
}
