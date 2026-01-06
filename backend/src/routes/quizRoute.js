import express from 'express'
import {
  createQuiz,
  listQuizzes,
  getListQuizSummary,
  deleteQuiz,
  updateQuiz,
  createQuizByAi,
  createInteractiveQuizByAi
} from '../controllers/quizController.js'
import { authMiddleware } from '../middlewares/authMiddleware.js'

const router = express.Router()

router.post('/', authMiddleware.isAuthorized, authMiddleware.isAdmin, createQuiz)
router.get('/summary', authMiddleware.isAuthorized, authMiddleware.isAdminOrClient, getListQuizSummary)
router.get('/', authMiddleware.isAuthorized, listQuizzes)
router.delete('/:id', authMiddleware.isAuthorized, authMiddleware.isAdmin, deleteQuiz)
router.put('/:id', authMiddleware.isAuthorized, authMiddleware.isAdmin, updateQuiz)

// Tạo quiz bằng AI
router.post('/createQuizByAi', authMiddleware.isAuthorized, authMiddleware.isAdmin, createQuizByAi)

// Tạo bài tập tương tác bằng AI
router.post('/createInteractiveQuizByAi', authMiddleware.isAuthorized, authMiddleware.isClient, createInteractiveQuizByAi)

export default router
