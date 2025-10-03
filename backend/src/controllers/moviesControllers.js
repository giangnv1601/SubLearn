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
    const { title, thumbnail_url, video_url, genre } = req.body;
    const movie = new Movie({ title, thumbnail_url, video_url, genre });
    const newMovie = await movie.save();
    res.status(201).json(newMovie);
  } catch (error) {
    console.error('Error creating movie:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateMovie = async (req, res) => {
  try {
    const { title, thumbnail_url, video_url, genre } = req.body;
    const updatedMovie = await Movie.findByIdAndUpdate(
      req.params.id, 
      { title, thumbnail_url, video_url, genre }, 
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

export { getAllMovies, createMovie, updateMovie, deleteMovie };