import express from 'express'
import {
  createResult,
  getResultsByUser
} from '../controllers/resultController.js'
import { authMiddleware } from '../middlewares/authMiddleware.js'

const router = express.Router()

router.post('/', authMiddleware.isAuthorized, authMiddleware.isClient, createResult)

router.get('/', authMiddleware.isAuthorized, authMiddleware.isClient, getResultsByUser)

export default router