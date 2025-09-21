import express from 'express';
import {
  getAllRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  getRestaurantStats
} from '../controllers/restaurantController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Public routes
// GET /api/restaurants - Get all restaurants
router.get('/', getAllRestaurants);

// GET /api/restaurants/:id - Get restaurant by ID
router.get('/:id', getRestaurantById);

// Admin routes (protected)
// POST /api/restaurants - Create new restaurant
router.post('/', authenticateToken, createRestaurant);

// PUT /api/restaurants/:id - Update restaurant
router.put('/:id', authenticateToken, updateRestaurant);

// DELETE /api/restaurants/:id - Delete restaurant
router.delete('/:id', authenticateToken, deleteRestaurant);

// GET /api/restaurants/:id/stats - Get restaurant statistics
router.get('/:id/stats', authenticateToken, getRestaurantStats);

export default router;
