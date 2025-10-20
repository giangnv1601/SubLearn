import Subtitle from "../models/Subtitle.js";
import Movie from "../models/Movie.js";

export const uploadSubtitle = async (req, res) => {
  try {
    const { movieId, language } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No subtitle file uploaded" });
    }

    // kiểm tra phim tồn tại
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    // đọc nội dung file srt
    const srtContent = req.file.buffer.toString("utf-8");

    const subtitle = new Subtitle({
      movieId,
      language,
      srtContent,
    });

    const saved = await subtitle.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error("Error uploading subtitle:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getSubtitlesByMovie = async (req, res) => {
  try {
    const { movieId } = req.params;
    const subtitles = await Subtitle.find({ movieId });
    res.status(200).json(subtitles);
  } catch (error) {
    console.error("Error fetching subtitles:", error);
    res.status(500).json({ message: "Server error" });
  }
};
