import { query } from '../config/db.js';

export const createPayment = async ({ orderId, amount, method, status, transactionRef }) => {
  const result = await query(
    `INSERT INTO payments (order_id, amount, method, status, transaction_ref)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [orderId, amount, method, status || 'pending', transactionRef]
  );
  return result.rows[0];
};

export const getPaymentsByOrder = async (orderId) => {
  const result = await query(
    'SELECT * FROM payments WHERE order_id = $1 ORDER BY created_at DESC',
    [orderId]
  );
  return result.rows;
};
