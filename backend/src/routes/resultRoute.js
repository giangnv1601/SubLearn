import express from 'express'
import { submitResult, getResults } from '../controllers/resultController.js'
import { authMiddleware } from '../middlewares/authMiddleware.js'

const router = express.Router()

router.post('/', authMiddleware.isAuthorized, authMiddleware.isClient ,submitResult)
router.get('/:userId', authMiddleware.isAuthorized, authMiddleware.isClient , getResults)

export default router
