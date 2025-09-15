import express from 'express';
import { login, createAdmin } from '../controllers/authController.js';

const router = express.Router();

// POST /api/auth/login - Admin login
router.post('/login', login);

// POST /api/auth/register - Create new admin user
router.post('/register', createAdmin);

export default router;
