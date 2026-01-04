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
import { uploadMiddleware } from '../middlewares/uploadMiddleware.js'

const router = express.Router()

// Public
router.post('/register', register)
router.post('/login', login)
router.put('/refresh-token', refreshToken)

// Admin and Client
router.get('/:id', authMiddleware.isAuthorized, authMiddleware.isAdminOrClient, getProfile)
router.put('/change-password/:id', authMiddleware.isAuthorized, authMiddleware.isAdminOrClient, changePassword)
router.put('/update-profile/:id', authMiddleware.isAuthorized, authMiddleware.isAdminOrClient, uploadMiddleware.uploadAvatar , updateProfile)

// Only Admin
router.get('/', authMiddleware.isAuthorized, authMiddleware.isAdmin, getAllUsers)
router.delete('/:id', authMiddleware.isAuthorized, authMiddleware.isAdmin, deleteUser)
router.put('/update-user/:id', authMiddleware.isAuthorized, authMiddleware.isAdmin, uploadMiddleware.uploadAvatar, updateUser)

export default router
