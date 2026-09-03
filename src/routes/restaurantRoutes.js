import { Router } from 'express';
import {
  listRestaurants,
  getRestaurant,
  addRestaurant,
  editRestaurant,
  removeRestaurant,
} from '../controllers/restaurantController.js';
import { getRestaurantMenu } from '../controllers/menuController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';

const router = Router();

router.get('/', listRestaurants);
router.get('/:id', getRestaurant);
router.get('/:id/menu', getRestaurantMenu);

router.post('/', authenticate, authorize('restaurant_owner', 'admin'), addRestaurant);
router.put('/:id', authenticate, authorize('restaurant_owner', 'admin'), editRestaurant);
router.delete('/:id', authenticate, authorize('restaurant_owner', 'admin'), removeRestaurant);

export default router;
