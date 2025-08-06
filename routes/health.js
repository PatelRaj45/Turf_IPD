import express from 'express';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

// Health check endpoint
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'TurfX API is running',
    timestamp: new Date().toISOString()
  });
});

// Authentication test endpoint
router.get('/auth-test', protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Authentication is working',
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    }
  });
});

export default router;