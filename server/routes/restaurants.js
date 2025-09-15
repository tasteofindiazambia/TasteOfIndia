import express from 'express';
import {
  getAllRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant
} from '../controllers/restaurantController.js';

const router = express.Router();

// GET /api/restaurants - Get all restaurants
router.get('/', getAllRestaurants);

// GET /api/restaurants/:id - Get restaurant by ID
router.get('/:id', getRestaurantById);

// POST /api/restaurants - Create new restaurant
router.post('/', createRestaurant);

// PUT /api/restaurants/:id - Update restaurant
router.put('/:id', updateRestaurant);

// DELETE /api/restaurants/:id - Delete restaurant
router.delete('/:id', deleteRestaurant);

export default router;
