import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/userController.js';
import { listOrdersForUser } from '../controllers/orderController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.get('/:id/orders', authenticate, listOrdersForUser);

export default router;
