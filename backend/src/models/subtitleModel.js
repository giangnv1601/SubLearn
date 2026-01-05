import mongoose from "mongoose";

const { Schema, Types } = mongoose;

const subtitleSchema = new Schema(
  {
    movieId: {
      type: Types.ObjectId,
      ref: "Movie",
      required: true,
      index: true
    },
    language: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      enum: ['en', 'vi']
    },
    srtContent: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

subtitleSchema.index({ movieId: 1, language: 1 }, { unique: true });

export default mongoose.model("Subtitle", subtitleSchema);
