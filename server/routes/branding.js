import express from 'express';
import {
  getBranding,
  updateBranding,
  resetBranding
} from '../controllers/brandingController.js';

const router = express.Router();

// GET /api/branding - Get current branding settings
router.get('/', getBranding);

// PUT /api/branding - Update branding settings
router.put('/', updateBranding);

// POST /api/branding/reset - Reset to default branding
router.post('/reset', resetBranding);

export default router;
