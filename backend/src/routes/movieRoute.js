import express from 'express';
import { 
  getAllMovies, 
  createMovie, 
  updateMovie,
  deleteMovie,
  getMovieById,
  searchMovies
 } from '../controllers/movieController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();


router.get('/search', authMiddleware.isAuthorized, searchMovies);
router.get('/', authMiddleware.isAuthorized , getAllMovies);
router.post('/', authMiddleware.isAuthorized, createMovie);
router.put('/:id', authMiddleware.isAuthorized, updateMovie);
router.delete('/:id', authMiddleware.isAuthorized, deleteMovie);
router.get('/:id', authMiddleware.isAuthorized , getMovieById);

export default router;