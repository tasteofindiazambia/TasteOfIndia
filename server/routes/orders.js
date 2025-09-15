import express from 'express';
import {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  deleteOrder
} from '../controllers/orderController.js';

const router = express.Router();

// GET /api/orders - Get all orders (with optional filters)
router.get('/', getAllOrders);

// GET /api/orders/:id - Get order by ID
router.get('/:id', getOrderById);

// POST /api/orders - Create new order
router.post('/', createOrder);

// PUT /api/orders/:id/status - Update order status
router.put('/:id/status', updateOrderStatus);

// DELETE /api/orders/:id - Delete order
router.delete('/:id', deleteOrder);

export default router;
