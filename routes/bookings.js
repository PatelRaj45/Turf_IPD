import express from 'express';
import {
  getBookings,
  getBooking,
  createBooking,
  updateBooking,
  deleteBooking,
  cancelBooking,
  getUserBookings
} from '../controllers/bookingController.js';

const router = express.Router();

// Import middleware
import { protect, authorize } from '../middlewares/auth.js';

// User routes
router.get('/me', protect, getUserBookings);

// Admin and user routes
router
  .route('/')
  .get(protect, getBookings)
  .post(protect, createBooking);

router
  .route('/:id')
  .get(protect, getBooking)
  .put(protect, updateBooking)
  .delete(protect, deleteBooking);

// Cancel booking route
router.put('/:id/cancel', protect, cancelBooking);

export default router;