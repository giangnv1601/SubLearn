import express from 'express';
import { 
  getAllMovies, 
  createMovie, 
  updateMovie,
  deleteMovie,
  getMovieById
 } from '../controllers/movieController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/:id', authMiddleware.isAuthorized ,getMovieById);
router.get('/', authMiddleware.isAuthorized , getAllMovies);

router.post('/', createMovie);
router.put('/:id', updateMovie);
router.delete('/:id', deleteMovie);

export default router;