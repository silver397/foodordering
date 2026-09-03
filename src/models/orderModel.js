import { query, pool } from '../config/db.js';

export const createOrderWithItems = async ({ userId, restaurantId, deliveryAddress, items }) => {
  // items = [{ menuItemId, quantity, price }]  (price is looked up server-side, not trusted from client)
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const orderResult = await client.query(
      `INSERT INTO orders (user_id, restaurant_id, total_price, delivery_address, status)
       VALUES ($1, $2, $3, $4, 'pending')
       RETURNING *`,
      [userId, restaurantId, totalPrice, deliveryAddress]
    );
    const order = orderResult.rows[0];

    for (const item of items) {
      await client.query(
        `INSERT INTO order_items (order_id, menu_item_id, quantity, price)
         VALUES ($1, $2, $3, $4)`,
        [order.id, item.menuItemId, item.quantity, item.price]
      );
    }

    await client.query('COMMIT');
    return order;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const getOrdersByUser = async (userId) => {
  const result = await query(
    'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  return result.rows;
};

export const getOrderById = async (id) => {
  const orderResult = await query('SELECT * FROM orders WHERE id = $1', [id]);
  const order = orderResult.rows[0];
  if (!order) return null;

  const itemsResult = await query(
    `SELECT oi.*, m.name AS item_name
     FROM order_items oi
     JOIN menu_items m ON oi.menu_item_id = m.id
     WHERE oi.order_id = $1`,
    [id]
  );

  return { ...order, items: itemsResult.rows };
};

export const updateOrderStatus = async (id, status) => {
  const result = await query(
    `UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
    [status, id]
  );
  return result.rows[0];
};
