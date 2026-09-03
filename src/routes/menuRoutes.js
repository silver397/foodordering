import { Router } from 'express';
import {
  addCategory,
  addMenuItem,
  editMenuItem,
  removeMenuItem,
} from '../controllers/menuController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';

const router = Router();

router.post('/categories', authenticate, authorize('restaurant_owner', 'admin'), addCategory);
router.post('/', authenticate, authorize('restaurant_owner', 'admin'), addMenuItem);
router.put('/:id', authenticate, authorize('restaurant_owner', 'admin'), editMenuItem);
router.delete('/:id', authenticate, authorize('restaurant_owner', 'admin'), removeMenuItem);

export default router;
