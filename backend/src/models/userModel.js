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
      default: 'https://res.cloudinary.com/dghkkn6q4/image/upload/v1762708547/man_mmzaag.png'
    },

    role: {
      type: String,
      enum: ['client', 'admin'],
      default: 'client'
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
)

export default mongoose.model('User', UserSchema)
