import express from 'express';
import { 
  getAllMovies, 
  createMovie, 
  updateMovie,
  deleteMovie,
  getMovieById
 } from '../controllers/movieController.js';
import { isAuthorized } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/:id', isAuthorized ,getMovieById);

router.get('/', isAuthorized , getAllMovies);

router.post('/', createMovie);

router.put('/:id', updateMovie);

router.delete('/:id', deleteMovie);

export default router;