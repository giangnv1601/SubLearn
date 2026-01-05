import mongoose from 'mongoose'

const { Schema, Types } = mongoose

// Option Schema
const OptionSchema = new Schema(
  {
    label: { type: String, default: '' },
    content: { type: String, default: '' }
  }
)

// Question Schema
const QuestionSchema = new Schema(
  {
    question: { type: String, default: '' },
    answer: { type: String, enum: ['A', 'B', 'C', 'D'], default: 'A' },
    explanation: { type: String, default: '' },
    quote: { type: String, default: '' },
    options: { type: [OptionSchema], default: [] }
  }
)

// Quiz Schema
const QuizSchema = new Schema(
  {
    movieId: { type: Types.ObjectId, required: true, ref: 'Movie' },
    quizType: {
      type: String,
      enum: ['reading', 'dialogue_reordering', 'translation', 'equivalent'],
      required: true
    },
    passage: { type: String, default: null },
    questions: { type: [QuestionSchema], default: [] }
  },
  { timestamps: true }
)

export default mongoose.model('Quiz', QuizSchema)
