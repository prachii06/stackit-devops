import express from 'express';
import { auth } from '../middleware/authMiddleware.js';
import { voteAnswer } from '../controllers/vote.controller.js';

const router = express.Router();

// POST /vote/:answerId (auth required)
router.post('/:answerId', auth, voteAnswer);

export default router;
