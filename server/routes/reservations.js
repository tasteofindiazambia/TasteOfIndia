import express from 'express';
import {
  getAllReservations,
  getReservationById,
  createReservation,
  updateReservationStatus,
  deleteReservation
} from '../controllers/reservationController.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Public routes
// POST /api/reservations - Create new reservation (public - customers can make reservations)
router.post('/', createReservation);

// GET /api/reservations/:id - Get reservation by ID (with optional auth for security)
router.get('/:id', optionalAuth, getReservationById);

// Admin routes (protected)
// GET /api/reservations - Get all reservations with filters (admin only)
router.get('/', authenticateToken, getAllReservations);

// PUT /api/reservations/:id/status - Update reservation status (admin only)
router.put('/:id/status', authenticateToken, updateReservationStatus);

// DELETE /api/reservations/:id - Delete reservation (admin only)
router.delete('/:id', authenticateToken, deleteReservation);

export default router;