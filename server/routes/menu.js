import express from 'express';
import {
  getMenuByRestaurant,
  getCategoriesByRestaurant,
  getAllMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem
} from '../controllers/menuController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Public routes
// GET /api/menu/:restaurantId - Get menu items for a restaurant
router.get('/menu/:restaurantId', getMenuByRestaurant);

// GET /api/menu-categories/:restaurantId - Get categories for a restaurant  
router.get('/menu-categories/:restaurantId', getCategoriesByRestaurant);

// Admin routes (protected)
// GET /api/admin/menu - Get all menu items with filters
router.get('/admin/menu', authenticateToken, getAllMenuItems);

// POST /api/admin/menu - Create new menu item
router.post('/admin/menu', authenticateToken, createMenuItem);

// PUT /api/admin/menu/:id - Update menu item
router.put('/admin/menu/:id', authenticateToken, updateMenuItem);

// DELETE /api/admin/menu/:id - Delete menu item
router.delete('/admin/menu/:id', authenticateToken, deleteMenuItem);

export default router;