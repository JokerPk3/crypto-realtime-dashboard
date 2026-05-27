import { Router } from 'express';
import { TradesController } from './trades.controller';
import { asyncHandler } from '../../shared/handlers/asyncHandler';

const router = Router();

router.get('/', asyncHandler(TradesController.getRecentTrades));

export const tradesRouter = router;
