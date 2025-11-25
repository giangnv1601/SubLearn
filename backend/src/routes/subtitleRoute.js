import express from 'express'
import { multerUploadMiddleware } from '../middlewares/multerUploadMiddleware.js';
import { uploadSubtitle, getSubtitlesByMovie } from '../controllers/subtitleController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router()

router.post('/', authMiddleware.isAuthorized , multerUploadMiddleware.uploadSubtitle, uploadSubtitle)
router.get('/:movieId', authMiddleware.isAuthorized, getSubtitlesByMovie)

export default router