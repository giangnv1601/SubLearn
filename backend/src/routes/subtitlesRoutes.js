import express from 'express'
import upload from '../middleware/uploadFile.js'
import { uploadSubtitle, getSubtitlesByMovie } from '../controllers/subtitleController.js';

const router = express.Router()

router.post('/', upload.single('subtitle'), uploadSubtitle)

// Thêm route GET để lấy sub theo movie
router.get('/movie/:movieId', getSubtitlesByMovie)

export default router