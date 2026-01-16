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
import { uploadMiddleware } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.get('/search', authMiddleware.isAuthorized, authMiddleware.isAdminOrClient, searchMovies);
router.get('/', authMiddleware.isAuthorized, authMiddleware.isAdminOrClient, getAllMovies);
router.post('/', authMiddleware.isAuthorized, authMiddleware.isAdmin, uploadMiddleware.uploadMovieImages, createMovie);
router.put('/:id', authMiddleware.isAuthorized, authMiddleware.isAdmin, uploadMiddleware.uploadMovieImages, updateMovie);
router.delete('/:id', authMiddleware.isAuthorized, authMiddleware.isAdmin, deleteMovie);
router.get('/:id', authMiddleware.isAuthorized, authMiddleware.isAdminOrClient, getMovieById);

export default router;