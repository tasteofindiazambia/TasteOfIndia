import express from 'express';
import {
  getAllReservations,
  getReservationById,
  createReservation,
  updateReservation,
  deleteReservation
} from '../controllers/reservationController.js';

const router = express.Router();

// GET /api/reservations - Get all reservations (with optional filters)
router.get('/', getAllReservations);

// GET /api/reservations/:id - Get reservation by ID
router.get('/:id', getReservationById);

// POST /api/reservations - Create new reservation
router.post('/', createReservation);

// PUT /api/reservations/:id - Update reservation
router.put('/:id', updateReservation);

// DELETE /api/reservations/:id - Delete reservation
router.delete('/:id', deleteReservation);

export default router;
