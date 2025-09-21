import express from 'express';
import {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerStats
} from '../controllers/customerController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Admin routes (all customer management requires authentication)
// GET /api/customers - Get all customers with filters
router.get('/', authenticateToken, getAllCustomers);

// GET /api/customers/:id - Get customer by ID
router.get('/:id', authenticateToken, getCustomerById);

// POST /api/customers - Create new customer
router.post('/', createCustomer); // Public - can be created from orders/reservations

// PUT /api/customers/:id - Update customer
router.put('/:id', authenticateToken, updateCustomer);

// DELETE /api/customers/:id - Delete customer
router.delete('/:id', authenticateToken, deleteCustomer);

// GET /api/customers/:id/stats - Get customer statistics
router.get('/:id/stats', authenticateToken, getCustomerStats);

export default router;