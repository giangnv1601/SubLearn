import express from 'express'
import {
  createQuiz,
  listQuizzes,
  listQuizSummary,
  deleteQuiz,
  updateQuiz
} from '../controllers/quizController.js'

const router = express.Router()

router.post('/', createQuiz)

// Lấy số lượng quiz theo movie và type
router.get('/summary', listQuizSummary)

router.get('/', listQuizzes)

router.delete('/:id', deleteQuiz)

router.put('/:id', updateQuiz)

export default router
