import Movie from "../models/Movie.js";

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
    const { title, slug, originalTitle, description, thumb_url,  thumbnail_url, poster_url, time, year, genre, link_m3u8 } = req.body;
    const movie = new Movie({ title, slug, originalTitle, description, thumb_url,  thumbnail_url, poster_url, time, year, genre, link_m3u8 });
    const newMovie = await movie.save();
    res.status(201).json(newMovie);
  } catch (error) {
    console.error('Error creating movie:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateMovie = async (req, res) => {
  try {
    const { title, slug, originalTitle, description, thumb_url,  thumbnail_url, poster_url, time, year, genre, link_m3u8 } = req.body;
    const updatedMovie = await Movie.findByIdAndUpdate(
      req.params.id, 
      { title, slug, originalTitle, description, thumb_url,  thumbnail_url, poster_url, time, year, genre, link_m3u8 }, 
      { new: true }
    );
    if (!updatedMovie) {
      return res.status(404).json({ message: 'Movie not found' });
    }
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
    console.error('Error fetching movie by ID:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export { getAllMovies, createMovie, updateMovie, deleteMovie, getMovieById };