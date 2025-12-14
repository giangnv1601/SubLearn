import express from 'express'
import { 
  register, 
  login, 
  refreshToken, 
  getProfile,
  changePassword,
  updateProfile,
  getAllUsers,
  deleteUser,
  updateUser
} from '../controllers/userController.js'
import { authMiddleware } from '../middlewares/authMiddleware.js'
import { multerUploadMiddleware } from '../middlewares/multerUploadMiddleware.js'

const router = express.Router()

router.post('/register', register)
router.post('/login', login)
router.put('/refresh-token', refreshToken)

router.get('/:id', authMiddleware.isAuthorized, getProfile)
router.put('/change-password/:id', authMiddleware.isAuthorized, changePassword)
router.put('/update-profile/:id', authMiddleware.isAuthorized, multerUploadMiddleware.uploadAvatar , updateProfile)

// Only admin
router.get('/', authMiddleware.isAuthorized, getAllUsers)
router.delete('/:id', authMiddleware.isAuthorized, deleteUser)
router.put('/update-user/:id', authMiddleware.isAuthorized, multerUploadMiddleware.uploadAvatar, updateUser)

export default router
