import express from 'express';
import {
  getTurfs,
  getTurf,
  createTurf,
  updateTurf,
  deleteTurf,
  getTurfAvailability,
  searchTurfs,
  getFeaturedTurfs,
  getTurfsByLocation
} from '../controllers/turfController.js';

const router = express.Router();

// Import middleware
import { protect, authorize } from '../middlewares/auth.js';

// Routes
router.route('/')
  .get(getTurfs)
  .post(protect, authorize('admin'), createTurf);

router.route('/search')
  .get(searchTurfs);

router.route('/featured')
  .get(getFeaturedTurfs);

router.route('/location/:location')
  .get(getTurfsByLocation);

router.route('/:id')
  .get(getTurf)
  .put(protect, authorize('admin'), updateTurf)
  .delete(protect, authorize('admin'), deleteTurf);

router.route('/:id/availability')
  .get(getTurfAvailability);

export default router;