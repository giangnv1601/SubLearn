import express from 'express';
import { 
  getAllMovies, 
  createMovie, 
  updateMovie,
  deleteMovie,
 } from '../controllers/moviesControllers.js';

const router = express.Router();

router.get('/', getAllMovies);

router.post('/', createMovie);

router.put('/:id', updateMovie);

router.delete('/:id', deleteMovie);

export default router;