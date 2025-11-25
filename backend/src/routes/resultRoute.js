import express from 'express'
import { submitResult, getResults } from '../controllers/resultController.js'
import { authMiddleware } from '../middlewares/authMiddleware.js'

const router = express.Router()

router.post('/', authMiddleware.isAuthorized, submitResult)

// Lấy kết quả theo userId
router.get('/:userId', authMiddleware.isAuthorized, getResults)

export default router
