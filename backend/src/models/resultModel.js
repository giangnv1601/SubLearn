import mongoose from 'mongoose'

const { Schema, Types } = mongoose

const resultSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: 'User', required: true },
    movieId: { type: Types.ObjectId, ref: 'Movie', required: true },
    quizType: {
      type: String,
      enum: ['reading', 'dialogue_reordering', 'translation', 'equivalent'],
      required: true,
    },
    attempt: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    correctCount: { type: Number, required: true },
    score: { type: Number, required: true } // 0-100
  },
  { timestamps: true }
)

export default mongoose.model('Result', resultSchema)