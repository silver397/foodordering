import { Router } from 'express';
import { makePayment, listOrderPayments } from '../controllers/paymentController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/', authenticate, makePayment);
router.get('/order/:orderId', authenticate, listOrderPayments);

export default router;
