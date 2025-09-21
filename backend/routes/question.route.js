import express from 'express'
import { auth } from '../middleware/authMiddleware.js'
import { askQuestion, getAllQuestions, getAllQuestionsAdmin, getQuestionById, getQuestionsByTag, getQuestionsByUser, getTrendingQuestions } from '../controllers/question.controller.js'
import { checkRole } from '../middleware/checkRole.js'

const router = express.Router()


//public routes
router.get('/getQuestions', getAllQuestions)
router.get('/getQuestions/trending', getTrendingQuestions)
router.get('/getQuestions/tag/:tag',getQuestionsByTag)


//protected routes
router.get('/getQuestions/:id', auth, getQuestionById)
router.get('/my-questions/:userId', auth, getQuestionsByUser)
router.get('/admin/getQuestions', auth, checkRole(['ADMIN']), getAllQuestionsAdmin)

router.post('/askQuestion', auth, checkRole(['USER', 'ADMIN']), askQuestion)



export default router;
