import express from 'express'
import createQuiz, { QUIZ_TYPES } from '../services/createExercise.js'

const router = express.Router()

// POST /api/quizzes/create
router.post('/create', async (req, res) => {
  try {
    const { subtitle = '', quizType = QUIZ_TYPES.READING } = req.body || {}
    if (!subtitle.trim()) {
      return res.status(400).json({ ok: false, message: 'subtitle is required' })
    }
    const data = await createQuiz(subtitle, quizType)
    return res.status(200).json({ ok: true, data })
  } catch (err) {
    console.error('Create quiz error:', err)
    return res.status(500).json({ ok: false, message: err.message || 'Server error' })
  }
})

export default router
