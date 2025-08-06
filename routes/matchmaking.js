import express from 'express';
import {
  findCompatiblePlayers,
  createMatchRequest,
  joinMatchRequest,
  getMatchRecommendations,
  getAvailableCourts,
  sendMatchInvitation,
  respondToInvitation,
  getMatchHistory
} from '../controllers/matchmakingController.js';

const router = express.Router();

// Import middleware
import { protect } from '../middlewares/auth.js';

// Routes
router.route('/find-players')
  .post(protect, findCompatiblePlayers);

router.route('/create-request')
  .post(protect, createMatchRequest);

router.route('/join-request/:requestId')
  .post(protect, joinMatchRequest);

router.route('/recommendations')
  .get(protect, getMatchRecommendations);

router.route('/available-courts')
  .get(protect, getAvailableCourts);

router.route('/send-invitation')
  .post(protect, sendMatchInvitation);

router.route('/invitation/:invitationId')
  .put(protect, respondToInvitation);

router.route('/history')
  .get(protect, getMatchHistory);

export default router;