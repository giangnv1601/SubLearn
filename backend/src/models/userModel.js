import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format']
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters']
    },

    fullname: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true
    },

    avatar: {
      type: String,
      default: '/images/default-avatar.png'
    },

    role: {
      type: String,
      enum: ['client', 'admin'],
      default: 'client'
    }
  },
  {
    timestamps: true
  }
)

export default mongoose.model('User', UserSchema)
