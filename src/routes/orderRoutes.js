import { Router } from 'express';
import { placeOrder, listMyOrders, getOrder, changeOrderStatus } from '../controllers/orderController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/', authenticate, placeOrder);
router.get('/', authenticate, listMyOrders);
router.get('/:id', authenticate, getOrder);
router.patch('/:id/status', authenticate, changeOrderStatus);

export default router;
