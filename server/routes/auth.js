import express from 'express';
import {
  login,
  register,
  verifyToken,
  changePassword,
  logout
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// POST /api/auth/login - Admin login
router.post('/login', login);

// POST /api/auth/register - Create new admin user (protected)
router.post('/register', authenticateToken, register);

// GET /api/auth/verify - Verify JWT token
router.get('/verify', verifyToken);

// POST /api/auth/change-password - Change password (protected)
router.post('/change-password', authenticateToken, changePassword);

// POST /api/auth/logout - Logout (client-side token removal)
router.post('/logout', logout);

export default router;