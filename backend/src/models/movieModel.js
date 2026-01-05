import mongoose from 'mongoose';

const { Schema } = mongoose;

const MovieSchema = new Schema(
  {
    title: { 
      type: String, 
      required: true,
      trim: true,
    },
    slug:{
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    description: { 
      type: String,
      trim: true,
      default: ''
    },
    thumb_url: { 
      type: String,
      trim: true,
      default: ''
    },
    poster_url: { 
      type: String,
      trim: true,
      default: ''
    },
    duration: {
      type: String,
      default: 'Đang cập nhật',
      trim: true,
    },
    year_released: { 
      type: Number,
      default: null
    },
    level: { 
      type: String ,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    },
    genre: { 
      type: String,
      default: 'Đang cập nhật'
    },
    link_m3u8: { 
      type: String, 
      trim: true,
      required: true
    }
  }, 
  { 
    timestamps: true 
  }
)

// Tìm kiếm theo title
MovieSchema.index({ title: 'text' })

export default mongoose.model('Movie', MovieSchema);