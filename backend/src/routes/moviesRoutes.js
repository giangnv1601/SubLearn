import express from 'express';
import { 
  getAllMovies, 
  createMovie, 
  updateMovie,
  deleteMovie,
 } from '../controllers/moviesControllers.js';
import upload from '../middleware/uploadFIle.js'; 
import { uploadSubtitle, getSubtitlesByMovie } from '../controllers/SubtitleController.js';
const router = express.Router();

router.get('/', getAllMovies);

router.post('/', createMovie);

router.put('/:id', updateMovie);

router.delete('/:id', deleteMovie);
router.post("/subtitles", upload.single("subtitle"), uploadSubtitle); 
router.get("/:movieId", getSubtitlesByMovie);
export default router;