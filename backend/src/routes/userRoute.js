import express from 'express'
import { 
  register, 
  login, 
  refreshToken, 
  getProfile,
  changePassword,
  updateProfile
} from '../controllers/userController.js'
import { isAuthorized } from '../middlewares/authMiddleware.js'
import { multerUploadMiddleware } from '../middlewares/multerUploadMiddleware.js'

const router = express.Router()

router.post('/register', register)
router.post('/login', login)
router.put('/refresh-token', refreshToken)

router.get('/:id', isAuthorized, getProfile)
router.put('/change-password/:id', isAuthorized, changePassword)
router.put('/update-profile/:id', isAuthorized, multerUploadMiddleware.uploadAvatar , updateProfile)

export default router
