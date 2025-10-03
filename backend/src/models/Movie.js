import mongoose from "mongoose";

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: null,
    },
    thumbnail_url: {
      type: String,
      default: null,
    },
    video_url: {
      type: String,
      required: true,
    },
    release_year: {
      type: Number,
      min: 1900,
      max: new Date().getFullYear(),
      default: null
    },
    genre: {
      type: String,
      required: true,
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
  }, { timestamps: true }
);

const Movie = mongoose.model("Movie", movieSchema);

export default Movie;