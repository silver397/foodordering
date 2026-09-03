import { getRestaurantById } from '../models/restaurantModel.js';
import { createCategory, getCategoriesByRestaurant } from '../models/categoryModel.js';
import {
  getMenuByRestaurant,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from '../models/menuItemModel.js';

// Helper: confirms the logged-in user owns the restaurant (or is admin)
const canManageRestaurant = (restaurant, user) => {
  return restaurant.owner_id === user.id || user.role === 'admin';
};

export const getRestaurantMenu = async (req, res) => {
  try {
    const restaurant = await getRestaurantById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    const menu = await getMenuByRestaurant(req.params.id);
    res.json({ restaurant: restaurant.name, menu });
  } catch (err) {
    console.error('Get menu error:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

export const addCategory = async (req, res) => {
  try {
    const { restaurantId, name } = req.body;
    if (!restaurantId || !name) {
      return res.status(400).json({ error: 'restaurantId and name are required' });
    }

    const restaurant = await getRestaurantById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    if (!canManageRestaurant(restaurant, req.user)) {
      return res.status(403).json({ error: 'You do not own this restaurant' });
    }

    const category = await createCategory({ restaurantId, name });
    res.status(201).json({ message: 'Category created', category });
  } catch (err) {
    console.error('Create category error:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

export const addMenuItem = async (req, res) => {
  try {
    const { restaurantId, categoryId, name, description, price, imageUrl } = req.body;

    if (!restaurantId || !name || price === undefined) {
      return res.status(400).json({ error: 'restaurantId, name and price are required' });
    }

    const restaurant = await getRestaurantById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    if (!canManageRestaurant(restaurant, req.user)) {
      return res.status(403).json({ error: 'You do not own this restaurant' });
    }

    const item = await createMenuItem({ restaurantId, categoryId, name, description, price, imageUrl });
    res.status(201).json({ message: 'Menu item created', item });
  } catch (err) {
    console.error('Create menu item error:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

export const editMenuItem = async (req, res) => {
  try {
    const item = await getMenuItemById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    const restaurant = await getRestaurantById(item.restaurant_id);
    if (!canManageRestaurant(restaurant, req.user)) {
      return res.status(403).json({ error: 'You do not own this restaurant' });
    }

    const { categoryId, name, description, price, imageUrl, isAvailable } = req.body;
    const updated = await updateMenuItem(req.params.id, {
      categoryId, name, description, price, imageUrl, isAvailable,
    });

    res.json({ message: 'Menu item updated', item: updated });
  } catch (err) {
    console.error('Update menu item error:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

export const removeMenuItem = async (req, res) => {
  try {
    const item = await getMenuItemById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    const restaurant = await getRestaurantById(item.restaurant_id);
    if (!canManageRestaurant(restaurant, req.user)) {
      return res.status(403).json({ error: 'You do not own this restaurant' });
    }

    await deleteMenuItem(req.params.id);
    res.json({ message: 'Menu item deleted' });
  } catch (err) {
    console.error('Delete menu item error:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
};
