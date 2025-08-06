import express from 'express';
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getUserProfile,
  updateUserProfile,
  updateUserPreferences,
  getUserStats,
  searchUsers,
  getUserRecommendations
} from '../controllers/userController.js';

const router = express.Router();

// Import middleware
import { protect, authorize } from '../middlewares/auth.js';

// Routes
router.route('/')
  .get(protect, authorize('admin'), getUsers)
  .post(protect, authorize('admin'), createUser);

router.route('/search')
  .get(protect, searchUsers);

router.route('/recommendations')
  .get(protect, getUserRecommendations);

router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

router.route('/preferences')
  .put(protect, updateUserPreferences);

router.route('/stats')
  .get(protect, getUserStats);

router.route('/:id')
  .get(protect, authorize('admin'), getUser)
  .put(protect, authorize('admin'), updateUser)
  .delete(protect, authorize('admin'), deleteUser);

export default router;