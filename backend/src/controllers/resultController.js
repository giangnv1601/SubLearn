import Result from '../models/resultModel.js'
import Quiz from '../models/quizModel.js'
import Movie from '../models/movieModel.js'

export const submitResult = async (req, res) => {
  try {
    const userId = req.jwtDecoded?.id || req.jwtDecoded?._id
    if (!userId) return res.status(401).json({ message: 'Unauthorized' })

    const { quizId, correctCount, incorrectCount, totalQuestions, accuracy } = req.body

    if (!quizId) return res.status(400).json({ message: 'quizId is required' })

    if ([correctCount, incorrectCount, totalQuestions, accuracy].some(v => v === undefined)) {
      return res.status(400).json({ message: 'Missing score fields' })
    }

    const prevCount = await Result.countDocuments({ userId, quizId })
    const attempt = prevCount + 1

    const result = await Result.create({
      userId,
      quizId,
      correctCount,
      incorrectCount,
      totalQuestions,
      accuracy,
      attempt
    })

    return res.status(201).json({
      message: 'Submit result successfully',
      data: result
    })
  } catch (err) {
    console.error('submitResult error:', err)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export const getResults = async (req, res) => {
  try {
    const userId = req.params.userId
    if (!userId) return res.status(400).json({ message: 'userId is required' })

    // join với Quiz và Movie để lấy thêm thông tin hiển thị
    const results = await Result.find({ userId })
      .sort({ createdAt: -1 })
      .populate({
        path: 'quizId',
        select: 'quizType title movieId', // fields from Quiz
        populate: {
          path: 'movieId',
          select: 'title movieTitle' // fields from Movie
        }
      })
      .lean()

    // chuẩn hóa dữ liệu trả về: thêm quizType, movieTitle vào root result object
    const out = results.map(r => {
      const quiz = r.quizId || {}
      const movie = quiz.movieId || {}
      return {
        ...r,
        quizType: r.quizType || quiz.quizType || null,
        movieTitle: r.movieTitle || movie.title || movie.movieTitle || null,
        quiz: quiz // keep full quiz doc if needed
      }
    })

    return res.status(200).json({
      message: 'Fetch results successfully',
      data: out
    })
  } catch (err) {
    console.error('getResults error:', err)
    return res.status(500).json({ message: 'Internal server error' })
  }
}