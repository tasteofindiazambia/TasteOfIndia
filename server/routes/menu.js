import express from 'express';
import upload from '../middleware/upload.js';
import {
  getMenuItems,
  getCategories,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  uploadMenuCSV
} from '../controllers/menuController.js';

const router = express.Router();

// GET /api/restaurants/:restaurantId/menu - Get menu items for restaurant
router.get('/restaurants/:restaurantId/menu', getMenuItems);

// GET /api/restaurants/:restaurantId/categories - Get categories for restaurant
router.get('/restaurants/:restaurantId/categories', getCategories);

// POST /api/restaurants/:restaurantId/menu - Create new menu item
router.post('/restaurants/:restaurantId/menu', createMenuItem);

// PUT /api/menu/:id - Update menu item
router.put('/menu/:id', updateMenuItem);

// DELETE /api/menu/:id - Delete menu item
router.delete('/menu/:id', deleteMenuItem);

// POST /api/restaurants/:restaurantId/menu/upload - Upload menu CSV
router.post('/restaurants/:restaurantId/menu/upload', upload.single('menuFile'), uploadMenuCSV);

export default router;
