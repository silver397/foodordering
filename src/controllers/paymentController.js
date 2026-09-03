import { createPayment, getPaymentsByOrder } from '../models/paymentModel.js';
import { getOrderById, updateOrderStatus } from '../models/orderModel.js';

export const makePayment = async (req, res) => {
  try {
    const { orderId, method } = req.body;

    if (!orderId || !method) {
      return res.status(400).json({ error: 'orderId and method are required' });
    }

    const order = await getOrderById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Only the customer who placed the order can pay for it
    if (order.user_id !== req.user.id) {
      return res.status(403).json({ error: 'You cannot pay for this order' });
    }

    // ---- Simulated payment processing ----
    // In a real app, this is where you'd call Stripe/Flutterwave/etc.
    // and only mark "paid" once the gateway confirms success.
    const simulatedTransactionRef = `SIM-${Date.now()}`;
    const payment = await createPayment({
      orderId,
      amount: order.total_price,
      method,
      status: 'paid',
      transactionRef: simulatedTransactionRef,
    });

    // Once paid, move the order forward from "pending" to "confirmed"
    if (order.status === 'pending') {
      await updateOrderStatus(orderId, 'confirmed');
    }

    res.status(201).json({ message: 'Payment successful', payment });
  } catch (err) {
    console.error('Payment error:', err.message);
    res.status(500).json({ error: 'Something went wrong while processing payment' });
  }
};

export const listOrderPayments = async (req, res) => {
  try {
    const payments = await getPaymentsByOrder(req.params.orderId);
    res.json({ payments });
  } catch (err) {
    console.error('List payments error:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
};
