import express from 'express'
import {
  addQuiz,
  getQuizzesByMovieAndQuizType,
  getListQuizSummary,
  deleteQuiz,
  deleteQuizzesByMovieAndTypeQuiz,
  updateQuiz,
  createQuizByAi,
  createInteractiveQuizByAi
} from '../controllers/quizController.js'
import { authMiddleware } from '../middlewares/authMiddleware.js'

const router = express.Router()

router.post('/addQuiz', authMiddleware.isAuthorized, authMiddleware.isAdmin, addQuiz)
router.get('/summary', authMiddleware.isAuthorized, authMiddleware.isAdminOrClient, getListQuizSummary)
router.get('/', authMiddleware.isAuthorized,authMiddleware.isAdminOrClient, getQuizzesByMovieAndQuizType)
router.delete('/:id', authMiddleware.isAuthorized, authMiddleware.isAdmin, deleteQuiz)
router.delete('/:movieId/:quizType', authMiddleware.isAuthorized, authMiddleware.isAdmin, deleteQuizzesByMovieAndTypeQuiz)
router.put('/:id', authMiddleware.isAuthorized, authMiddleware.isAdmin, updateQuiz)

// Tạo quiz bằng AI
router.post('/createQuizByAi', authMiddleware.isAuthorized, authMiddleware.isAdmin, createQuizByAi)

// Tạo bài tập tương tác bằng AI
router.post('/createInteractiveQuizByAi', authMiddleware.isAuthorized, authMiddleware.isClient, createInteractiveQuizByAi)

export default router
