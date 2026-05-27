import { Router } from 'express';
import { MetricsController } from './metrics.controller';

const router = Router();

router.get('/', MetricsController.getMetrics);

export const metricsRouter = router;
