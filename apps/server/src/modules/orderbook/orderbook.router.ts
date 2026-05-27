import { Router } from 'express';
import { OrderBookController } from './orderbook.controller';

const router = Router();

router.get('/snapshot', OrderBookController.getSnapshot);

export const orderbookRouter = router;
