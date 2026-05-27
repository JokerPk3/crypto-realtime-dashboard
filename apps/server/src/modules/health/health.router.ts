import type { Request, Response } from 'express';
import { Router } from 'express';
import { HealthService } from './health.service';
import { asyncHandler } from '../../shared/handlers/asyncHandler';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    uptime: HealthService.getUptime(),
    timestamp: new Date().toISOString(),
  });
});

router.get('/ready', asyncHandler(async (req: Request, res: Response) => {
  const status = await HealthService.getReadyStatus();
  res.status(status.status === 'ok' ? 200 : 503).json(status);
}));

export const healthRouter = router;
