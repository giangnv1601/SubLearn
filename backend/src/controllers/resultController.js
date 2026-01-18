import Result from '../models/resultModel.js'

export const createResult = async (req, res) => {
  try {
    const userId = req.jwtDecoded.id
    const { quizId, totalQuestions, correctCount } = req.body

    // Validate required fields
    if (!quizId || totalQuestions == null || correctCount == null) {
      return res.status(400).json({ message: 'Thiếu dữ liệu bắt buộc.' })
    }

    // Tính điểm phần trăm
    const score = totalQuestions > 0 
      ? Math.round((correctCount / totalQuestions) * 100) 
      : 0

    // Tính lần làm thứ mấy (attempt)
    const lastResult = await Result
      .findOne({ userId, quizId })
      .sort({ attempt: -1 })

    const attempt = (lastResult?.attempt || 0) + 1

    // Tạo kết quả mới
    const result = await Result.create({
      userId,
      quizId,
      attempt,
      totalQuestions,
      correctCount,
      score,
    })

    return res.status(201).json({ 
      message: 'Lưu kết quả thành công', 
      data: result 
    })
  } catch (err) {
    console.error('createPracticeResult error:', err)
    return res.status(500).json({ message: 'Lỗi server', error: err.message })
  }
}

export const getResultsByUser = async (req, res) => {
  try {
    const userId = req.jwtDecoded.id
    const results = await Result
      .find({ userId })
      .populate({
        path: 'quizId',
        select: 'movieId quizType',
        populate: {
          path: 'movieId',
          select: 'title'
        }
      })
      .sort({ createdAt: -1 })
    return res.status(200).json({ data: results })
  } catch (err) {
    console.error('getPracticeResultsByUser error:', err)
    return res.status(500).json({ message: 'Lỗi server', error: err.message })
  }
}