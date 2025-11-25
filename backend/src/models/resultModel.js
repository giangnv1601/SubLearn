import mongoose from 'mongoose';

const { Schema, Types } = mongoose;

const ResultSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: 'User',
      required: true
    },

    quizId: {
      type: Types.ObjectId,
      ref: 'Quiz',
      required: true
    },

    correctCount: {
      type: Number,
      required: true,
      min: 0
    },

    incorrectCount: {
      type: Number,
      required: true,
      min: 0
    },

    totalQuestions: {
      type: Number,
      required: true,
      min: 1
    },

    accuracy: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },

    attempt: {
      type: Number,
      default: 1,
      min: 1
    }
  },
  { timestamps: true }
);

export default mongoose.model('Result', ResultSchema);
