import express from 'express'
import upload from '../middlewares/uploadFile.js'
import { uploadSubtitle, getSubtitlesByMovie } from '../controllers/subtitleController.js';

const router = express.Router()

router.post('/', upload.single('subtitle'), uploadSubtitle)

router.get('/movie/:movieId', getSubtitlesByMovie)

export default router