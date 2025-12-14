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

router.get('/search', authMiddleware.isAuthorized, authMiddleware.isAdminOrClient , searchMovies);
router.get('/', authMiddleware.isAuthorized , authMiddleware.isAdminOrClient , getAllMovies);
router.post('/', authMiddleware.isAuthorized, authMiddleware.isAdmin , createMovie);
router.put('/:id', authMiddleware.isAuthorized, authMiddleware.isAdmin , updateMovie);
router.delete('/:id', authMiddleware.isAuthorized, authMiddleware.isAdmin , deleteMovie);
router.get('/:id', authMiddleware.isAuthorized , authMiddleware.isAdminOrClient , getMovieById);

export default router;