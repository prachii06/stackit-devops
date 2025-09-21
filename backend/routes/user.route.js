import express from 'express';
import { auth } from '../middleware/authMiddleware.js';
import { checkRole } from '../middleware/checkRole.js';
import { getCurrentUser, getUserProfile, getUserStats } from '../controllers/user.controller.js';

const router = express.Router();

// Get current logged-in user's full profile (requires auth)
router.get('/me', auth, getCurrentUser);

// Get any user's public profile (available to all, even guests)
router.get('/profile/:username', getUserProfile);

// Get user's stats (available to all, even guests)
router.get('/stats/:username', getUserStats);

export default router;
