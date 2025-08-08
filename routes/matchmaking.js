import express from 'express';

// Import middleware
import { protect } from '../middlewares/auth.js';

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

// Import AI matchmaking controllers
import {
  getSports,
  getAIRecommendations,
  updateAIModel
} from '../controllers/aiMatchmakingController.js';

const router = express.Router();

// Routes
router.route('/find-players')
  .post(protect, findCompatiblePlayers);

router.route('/create-request')
  .post(protect, createMatchRequest);

router.route('/join-request/:requestId')
  .post(protect, joinMatchRequest);

router.route('/recommendations')
  .get(protect, getMatchRecommendations)
  .post(protect, getAIRecommendations);

router.route('/available-courts')
  .get(protect, getAvailableCourts);

router.route('/send-invitation')
  .post(protect, sendMatchInvitation);

router.route('/invitation/:invitationId')
  .put(protect, respondToInvitation);

router.route('/history')
  .get(protect, getMatchHistory);

// Test route
router.get('/test', (req, res) => {
  console.log('Test route hit');
  res.json({ message: 'Test route working' });
});

// AI-specific routes
router.route('/sports').get(getSports);

router.route('/update')
  .post(protect, updateAIModel);

export default router;