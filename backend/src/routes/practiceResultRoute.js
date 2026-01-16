import express from 'express'
import {
  createPracticeResult,
  getPracticeResultsByUser
} from '../controllers/practiceResultController.js'
import { authMiddleware } from '../middlewares/authMiddleware.js'

const router = express.Router()

// Lưu kết quả khi nộp bài
router.post('/', authMiddleware.isAuthorized, authMiddleware.isClient, createPracticeResult)

router.get('/', authMiddleware.isAuthorized, authMiddleware.isClient, getPracticeResultsByUser)

export default router