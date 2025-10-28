import express from 'express'
import { register } from '../controllers/userController.js'
import { registerValidation } from '../validations/userValidation.js'

const router = express.Router()

router.post('/register', registerValidation, register)

export default router
