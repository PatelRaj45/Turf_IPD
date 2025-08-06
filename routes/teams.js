import express from 'express';
import {
  getTeams,
  getTeam,
  createTeam,
  updateTeam,
  deleteTeam,
  addTeamMember,
  removeTeamMember,
  setViceCaptain,
  transferCaptaincy,
  getUserTeams
} from '../controllers/teamController.js';

const router = express.Router();

// Import middleware
import { protect } from '../middlewares/auth.js';

// User routes
router.get('/me', protect, getUserTeams);

// Team routes
router
  .route('/')
  .get(getTeams)
  .post(protect, createTeam);

router
  .route('/:id')
  .get(getTeam)
  .put(protect, updateTeam)
  .delete(protect, deleteTeam);

// Team member management
router.post('/:id/members', protect, addTeamMember);
router.delete('/:id/members/:userId', protect, removeTeamMember);

// Team leadership management
router.put('/:id/vice-captain/:userId', protect, setViceCaptain);
router.put('/:id/transfer-captaincy/:userId', protect, transferCaptaincy);

export default router;