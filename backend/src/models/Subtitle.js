import mongoose from "mongoose";

const subtitleSchema = new mongoose.Schema(
  {
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
      required: true,
    },
    language: {
      type: String,
      required: true,
      trim: true,
    },
    srtContent: {
      type: String, // nội dung file .srt sẽ lưu dạng text
      required: true,
    },
  },
  { timestamps: true }
);

const Subtitle = mongoose.model("Subtitle", subtitleSchema);

export default Subtitle;
