import express from 'express';
import { auth } from '../middleware/authMiddleware.js';
import { checkRole } from '../middleware/checkRole.js';
import { createAnswer, deleteAnswer, getAllAnswerAdmin } from '../controllers/answer.controller.js';

const router = express.Router();

// Create answer (requires auth and USER/ADMIN role)
router.post('/create', auth, checkRole(['USER', 'ADMIN']), createAnswer);

// Delete answer (requires auth and must be owner or admin)
router.delete('/:id', auth, deleteAnswer);

// Get all answers (admin only)
router.get('/admin/all', auth, checkRole(['ADMIN']), getAllAnswerAdmin);

export default router;
