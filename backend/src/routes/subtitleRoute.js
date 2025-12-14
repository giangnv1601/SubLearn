import express from 'express'
import { multerUploadMiddleware } from '../middlewares/multerUploadMiddleware.js';
import { uploadSubtitle, getSubtitlesByMovie } from '../controllers/subtitleController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router()

router.post('/', authMiddleware.isAuthorized, authMiddleware.isAdmin, multerUploadMiddleware.uploadSubtitle, uploadSubtitle)
router.get('/:movieId', authMiddleware.isAuthorized, authMiddleware.isAdminOrClient, getSubtitlesByMovie)

export default router