import mongoose from 'mongoose';

const MovieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true },
  originalTitle: { type: String },
  description: { type: String },
  thumb_url: { type: String, },
  poster_url: { type: String },
  time: { type: String },
  year: { type: Number },
  genre: { type: String },
  link_m3u8: { type: String, required: true},
  link_audio: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model('Movie', MovieSchema);