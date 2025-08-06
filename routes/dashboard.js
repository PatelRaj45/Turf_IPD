import express from 'express';
import {
  getDashboardStats,
  getRecentActivity,
  getRecommendedTurfs,
  getNearbyTurfs,
  getQuickActions
} from '../controllers/dashboardController.js';

const router = express.Router();

// Import middleware
import { protect } from '../middlewares/auth.js';

// Routes
router.route('/stats')
  .get(protect, getDashboardStats);

router.route('/activity')
  .get(protect, getRecentActivity);

router.route('/recommendations')
  .get(protect, getRecommendedTurfs);

router.route('/nearby')
  .get(protect, getNearbyTurfs);

router.route('/quick-actions')
  .get(protect, getQuickActions);

export default router; 