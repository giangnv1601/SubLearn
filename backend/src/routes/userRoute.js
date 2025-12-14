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

router.get('/:id', authMiddleware.isAuthorized, authMiddleware.isAdminOrClient, getProfile)
router.put('/change-password/:id', authMiddleware.isAuthorized, authMiddleware.isAdminOrClient, changePassword)
router.put('/update-profile/:id', authMiddleware.isAuthorized, authMiddleware.isAdminOrClient, multerUploadMiddleware.uploadAvatar , updateProfile)

// Only admin
router.get('/', authMiddleware.isAuthorized, authMiddleware.isAdmin, getAllUsers)
router.delete('/:id', authMiddleware.isAuthorized, authMiddleware.isAdmin, deleteUser)
router.put('/update-user/:id', authMiddleware.isAuthorized, authMiddleware.isAdmin, multerUploadMiddleware.uploadAvatar, updateUser)

export default router
