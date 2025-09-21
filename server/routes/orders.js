import express from 'express';
import {
  getAllOrders,
  getOrderById,
  getOrderByToken,
  createOrder,
  updateOrderStatus,
  deleteOrder
} from '../controllers/orderController.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Public routes
// POST /api/orders - Create new order (public - customers can create orders)
router.post('/', createOrder);

// GET /api/orders/token/:token - Get order by secure token (public - for customers)
router.get('/token/:token', getOrderByToken);

// GET /api/orders/:id - Get order by ID (with optional auth for security)
router.get('/:id', optionalAuth, getOrderById);

// Admin routes (protected)
// GET /api/orders - Get all orders with filters (admin only)
router.get('/', authenticateToken, getAllOrders);

// PUT /api/orders/:id/status - Update order status (admin only)
router.put('/:id/status', authenticateToken, updateOrderStatus);

// DELETE /api/orders/:id - Delete order (admin only)
router.delete('/:id', authenticateToken, deleteOrder);

export default router;
