import { Router } from 'express';
import { SystemStatusController } from './system-status.controller';
import { asyncHandler } from '../../shared/handlers/asyncHandler';

const router = Router();

router.get('/', SystemStatusController.getStatus);
router.get('/events', asyncHandler(SystemStatusController.getEvents));

export const systemStatusRouter = router;
