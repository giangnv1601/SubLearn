import Movie from "../models/movieModel.js";
import { CloudinaryProvider } from '../providers/CloudinaryProvider.js'

const getAllMovies = async (req, res) => {
  try {
    const movies = await Movie.find().sort({ createdAt: -1 });
    res.status(200).json(movies);
  } catch (error) {
    console.error('Error fetching movies:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createMovie = async (req, res) => {
  try {
    const { title, slug, description, duration, year_released, level, genre, link_m3u8 } = req.body;
    
    // Upload thumb_url nếu có file
    let thumb_url = req.body.thumb_url || ''
    if (req.files?.thumb_url?.[0]) {
      const uploadResult = await CloudinaryProvider.streamUpload(
        req.files.thumb_url[0].buffer, 
        'movies/thumbs'
      )
      thumb_url = uploadResult.secure_url
    }
    
    // Upload poster_url nếu có file
    let poster_url = req.body.poster_url || ''
    if (req.files?.poster_url?.[0]) {
      const uploadResult = await CloudinaryProvider.streamUpload(
        req.files.poster_url[0].buffer, 
        'movies/posters'
      )
      poster_url = uploadResult.secure_url
    }
    
    const movie = new Movie({ 
      title, 
      slug, 
      description, 
      thumb_url, 
      poster_url, 
      duration, 
      year_released, 
      level, 
      genre, 
      link_m3u8 
    });
    
    const newMovie = await movie.save();
    res.status(201).json(newMovie);
  } catch (error) {
    console.error('Error creating movie:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateMovie = async (req, res) => {
  try {
    const { title, slug, description, duration, year_released, level, genre, link_m3u8 } = req.body;
    
    const movie = await Movie.findById(req.params.id)
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    
    // Upload thumb_url nếu có file mới
    let thumb_url = req.body.thumb_url || movie.thumb_url
    if (req.files?.thumb_url?.[0]) {
      const uploadResult = await CloudinaryProvider.streamUpload(
        req.files.thumb_url[0].buffer, 
        'movies/thumbs'
      )
      thumb_url = uploadResult.secure_url
    }
    
    // Upload poster_url nếu có file mới
    let poster_url = req.body.poster_url || movie.poster_url
    if (req.files?.poster_url?.[0]) {
      const uploadResult = await CloudinaryProvider.streamUpload(
        req.files.poster_url[0].buffer, 
        'movies/posters'
      )
      poster_url = uploadResult.secure_url
    }
    
    const updatedMovie = await Movie.findByIdAndUpdate(
      req.params.id, 
      { title, slug, description, thumb_url, poster_url, duration, year_released, level, genre, link_m3u8 }, 
      { new: true }
    );
    
    res.status(200).json(updatedMovie);
  } catch (error) {
    console.error('Error updating movie:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteMovie = async (req, res) => {
  try {
    const deletedMovie = await Movie.findByIdAndDelete(req.params.id);
    if (!deletedMovie) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    res.status(200).json(deletedMovie);
  } catch (error) {
    console.error('Error deleting movie:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    res.status(200).json(movie);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const searchMovies = async (req, res) => {
  try {
    const q = (req.query.q || '').trim()

    if (!q) {
      return res.json([])
    }
    const movies = await Movie.find(
      { $text: { $search: q } },
      {
        score: { $meta: 'textScore' },
        title: 1,
        thumb_url: 1,
        year_released: 1,
      }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(10)
      .lean()

    return res.json(movies)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
};

export { getAllMovies, createMovie, updateMovie, deleteMovie, getMovieById, searchMovies };