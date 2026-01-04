import express from 'express'
import { uploadMiddleware } from '../middlewares/uploadMiddleware.js';
import { uploadSubtitle, getSubtitlesByMovie } from '../controllers/subtitleController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router()

router.post('/', authMiddleware.isAuthorized, authMiddleware.isAdmin, uploadMiddleware.uploadSubtitle, uploadSubtitle)
router.get('/:movieId', authMiddleware.isAuthorized, authMiddleware.isAdminOrClient, getSubtitlesByMovie)

export default router