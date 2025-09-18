import express from 'express';
import {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomersBySource
} from '../controllers/customerController.js';

const router = express.Router();

// Add console logs for debugging
console.log('🔧 Customer routes loaded successfully');

// GET /api/customers - Get all customers
router.get('/', getAllCustomers);

// GET /api/customers/:id - Get customer by ID
router.get('/:id', getCustomerById);

// POST /api/customers - Create new customer
router.post('/', createCustomer);

// PUT /api/customers/:id - Update customer
router.put('/:id', updateCustomer);

// DELETE /api/customers/:id - Delete customer
router.delete('/:id', deleteCustomer);

// GET /api/customers/source/:source - Get customers by source
router.get('/source/:source', getCustomersBySource);

export default router;
