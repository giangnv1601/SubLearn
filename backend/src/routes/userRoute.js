import express from 'express'
import { register, login, refreshToken } from '../controllers/userController.js'

const router = express.Router()

router.post('/register', register)
router.post('/login', login)
router.put('/refresh-token', refreshToken)

export default router
