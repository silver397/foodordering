import { createOrderWithItems, getOrdersByUser, getOrderById, updateOrderStatus } from '../models/orderModel.js';
import { getMenuItemById } from '../models/menuItemModel.js';
import { getRestaurantById } from '../models/restaurantModel.js';

export const placeOrder = async (req, res) => {
  try {
    const { restaurantId, deliveryAddress, items } = req.body;
    // items expected as: [{ menuItemId, quantity }]

    if (!restaurantId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'restaurantId and a non-empty items array are required' });
    }

    const restaurant = await getRestaurantById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    // Look up the REAL price of each item server-side — never trust price from the client
    const resolvedItems = [];
    for (const i of items) {
      if (!i.menuItemId || !i.quantity || i.quantity <= 0) {
        return res.status(400).json({ error: 'Each item needs a valid menuItemId and quantity' });
      }

      const menuItem = await getMenuItemById(i.menuItemId);
      if (!menuItem) {
        return res.status(404).json({ error: `Menu item ${i.menuItemId} not found` });
      }
      if (!menuItem.is_available) {
        return res.status(400).json({ error: `"${menuItem.name}" is currently unavailable` });
      }
      if (menuItem.restaurant_id !== Number(restaurantId)) {
        return res.status(400).json({ error: `"${menuItem.name}" does not belong to this restaurant` });
      }

      resolvedItems.push({
        menuItemId: menuItem.id,
        quantity: i.quantity,
        price: Number(menuItem.price), // trusted price snapshot
      });
    }

    const order = await createOrderWithItems({
      userId: req.user.id,
      restaurantId,
      deliveryAddress,
      items: resolvedItems,
    });

    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (err) {
    console.error('Place order error:', err.message);
    res.status(500).json({ error: 'Something went wrong while placing the order' });
  }
};

export const listMyOrders = async (req, res) => {
  try {
    const orders = await getOrdersByUser(req.user.id);
    res.json({ orders });
  } catch (err) {
    console.error('List orders error:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

export const getOrder = async (req, res) => {
  try {
    const order = await getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Only the customer who placed it, or an admin, can view it
    if (order.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You cannot view this order' });
    }

    res.json({ order });
  } catch (err) {
    console.error('Get order error:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

export const changeOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${validStatuses.join(', ')}` });
    }

    const order = await getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Only restaurant owner (of that restaurant) or admin can update status
    const restaurant = await getRestaurantById(order.restaurant_id);
    if (restaurant.owner_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You cannot update this order' });
    }

    const updated = await updateOrderStatus(req.params.id, status);
    res.json({ message: 'Order status updated', order: updated });
  } catch (err) {
    console.error('Update order status error:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

export const listOrdersForUser = async (req, res) => {
  try {
    const targetUserId = Number(req.params.id);

    if (targetUserId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You cannot view this user\'s orders' });
    }

    const orders = await getOrdersByUser(targetUserId);
    res.json({ orders });
  } catch (err) {
    console.error('List user orders error:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
};
