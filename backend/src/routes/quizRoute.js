import express from 'express'
import {
  createQuiz,
  listQuizzes,
  getUniqueMovieQuizTypes,
  listQuizSummary,
  deleteQuiz,
  updateQuiz,
  generatorQuiz,
  generatotQuizWithMovie
} from '../controllers/quizController.js'
import { authMiddleware } from '../middlewares/authMiddleware.js'

const router = express.Router()

router.post('/', authMiddleware.isAuthorized, createQuiz)
router.get('/unique-movie-type', authMiddleware.isAuthorized, getUniqueMovieQuizTypes)
router.get('/summary', authMiddleware.isAuthorized, listQuizSummary)
router.get('/', authMiddleware.isAuthorized, listQuizzes)
router.delete('/:id', authMiddleware.isAuthorized, deleteQuiz)
router.put('/:id', authMiddleware.isAuthorized, updateQuiz)

// Tạo quiz bằng AI
router.post('/genQuiz', authMiddleware.isAuthorized, generatorQuiz)

// Tại bài tập tương tác phim
router.post('/genExerciseWithMovie', generatotQuizWithMovie)

export default router
