import express from 'express';
import {
  register,
  login,
  getMe,
  logout,
  updateDetails,
  updatePassword,
  googleLogin,
  linkGoogleAccount
} from '../controllers/authController.js';

const router = express.Router();

// Import middleware
import { protect } from '../middlewares/auth.js';

// Routes
router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/link-google', protect, linkGoogleAccount);
router.get('/me', protect, getMe);
router.get('/logout', protect, logout);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);

export default router;