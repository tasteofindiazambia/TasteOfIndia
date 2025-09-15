import express from 'express';
import {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  toggleEventFeatured,
  updateEventAttendees
} from '../controllers/eventController.js';

const router = express.Router();

// GET /api/events - Get all events (with optional filters)
router.get('/', getAllEvents);

// GET /api/events/:id - Get event by ID
router.get('/:id', getEventById);

// POST /api/events - Create new event
router.post('/', createEvent);

// PUT /api/events/:id - Update event
router.put('/:id', updateEvent);

// DELETE /api/events/:id - Delete event
router.delete('/:id', deleteEvent);

// PUT /api/events/:id/featured - Toggle featured status
router.put('/:id/featured', toggleEventFeatured);

// PUT /api/events/:id/attendees - Update attendees count
router.put('/:id/attendees', updateEventAttendees);

export default router;
