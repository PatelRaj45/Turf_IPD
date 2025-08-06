import express from 'express';
import {
  createOrder,
  verifyPayment,
  getPayment,
  getUserPayments,
  processRefund
} from '../controllers/paymentController.js';

const router = express.Router();

// Import middleware
import { protect, authorize } from '../middlewares/auth.js';

// User routes
router.post('/create-order', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.get('/me', protect, getUserPayments);

// User and admin routes
router.get('/:id', protect, getPayment);

// Admin routes
router.post('/:id/refund', protect, authorize('admin'), processRefund);

export default router;