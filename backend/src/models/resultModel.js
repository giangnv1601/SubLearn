import mongoose from 'mongoose'

const { Schema, Types } = mongoose

const resultSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: 'User', required: true },
    quizId: { type: Types.ObjectId, ref: 'Quiz', required: true },
    attempt: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    correctCount: { type: Number, required: true },
    score: { type: Number, required: true } // 0-100
  },
  { timestamps: true }
)

export default mongoose.model('Result', resultSchema)