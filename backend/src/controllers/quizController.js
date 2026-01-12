import Quiz from '../models/quizModel.js'
import { OpenaiProvider } from '../providers/OpenaiProvider.js'

export const createQuiz = async (req, res) => {
  try {
    const { movieId, quizType, passage, questions } = req.body

    // Chuẩn hoá dữ liệu đồng nhất
    const normalizedQuestions = Array.isArray(questions)
      ? questions.map(q => ({
          question: q?.question || '',
          answer: q?.answer || 'A',
          explanation: q?.explanation || '',
          quote: q?.quote || '',
          options: Array.isArray(q?.options)
            ? q.options.map(op => ({
                label: op?.label || '',
                content: op?.content || ''
              }))
            : []
        }))
      : []

    const doc = await Quiz.create({
      movieId: movieId,
      quizType: quizType,
      passage: passage ?? null,
      questions: normalizedQuestions
    })

    return res.status(201).json({ ok: true, data: doc })
  } catch (err) {
    console.error('createQuiz error:', err)
    return res.status(500).json({ ok: false, message: err.message || 'Server error' })
  }
}

// Lấy tổng quan quiz theo movie và loại quiz
export const getListQuizSummary = async (req, res) => {
  try {
    const result = await Quiz.aggregate([
      // Group theo movieId, đếm từng loại quiz và lấy thời gian tạo đầu tiên
      {
        $group: {
          _id: '$movieId',
          reading: {
            $sum: { $cond: [{ $eq: ['$quizType', 'reading'] }, 1, 0] }
          },
          dialogue_reordering: {
            $sum: { $cond: [{ $eq: ['$quizType', 'dialogue_reordering'] }, 1, 0] }
          },
          translation: {
            $sum: { $cond: [{ $eq: ['$quizType', 'translation'] }, 1, 0] }
          },
          equivalent: {
            $sum: { $cond: [{ $eq: ['$quizType', 'equivalent'] }, 1, 0] }
          },
          firstCreatedAt: { $min: '$createdAt' }
        }
      },
      // Sắp xếp theo thời gian tạo quiz đầu tiên (mới nhất trước)
      {
        $sort: { firstCreatedAt: -1 }
      },
      // Lookup lấy title từ Movie
      {
        $lookup: {
          from: 'movies',
          localField: '_id',
          foreignField: '_id',
          as: 'movie'
        }
      },
      // Format output
      {
        $project: {
          _id: 0,
          movieId: '$_id',
          title: { $ifNull: [{ $arrayElemAt: ['$movie.title', 0] }, '(Unknown)'] },
          quizCounts: {
            reading: '$reading',
            dialogue_reordering: '$dialogue_reordering',
            translation: '$translation',
            equivalent: '$equivalent'
          }
        }
      }
    ])

    return res.status(200).json({ ok: true, data: result })
  } catch (err) {
    console.error('listQuizSummary error:', err)
    return res.status(500).json({ ok: false, message: err.message || 'Server error' })
  }
}

// Lấy Quiz theo movie và quiz_type
export const listQuizzes = async (req, res) => {
  try {
    const { movie_id, quiz_type } = req.query

    if (!movie_id || !quiz_type) {
      return res.status(400).json({ ok: false, message: 'Thiếu tham số bắt buộc: movie_id và quiz_type' })
    }

    const filter = { movieId: movie_id, quizType: quiz_type }

    const items = await Quiz.find(filter).sort({ createdAt: -1 }).lean()
    return res.status(200).json({ ok: true, data: items })
  } catch (err) {
    console.error('listQuizzes error:', err)
    return res.status(500).json({ ok: false, message: err.message || 'Server error' })
  }
}

// Cập nhập Quiz
export const updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const { movieId, quizType, passage, questions } = req.body;

    // Chuẩn hóa questions nếu có
    let normalizedQuestions = undefined;
    if (Array.isArray(questions)) {
      normalizedQuestions = questions.map(q => ({
        question: q?.question || '',
        answer: q?.answer || q?.answerLetter || 'A',
        explanation: q?.explanation || '',
        quote: q?.quote || '',
        options: Array.isArray(q?.options)
          ? q.options.map(op => ({
              label: op?.label || '',
              content: op?.content || ''
            }))
          : []
      }))
    }

    const doc = await Quiz.findByIdAndUpdate(
      id,
      {
        ...(movieId ? { movieId } : {}),
        ...(quizType ? { quizType } : {}),
        ...(passage !== undefined ? { passage } : {}),
        ...(normalizedQuestions ? { questions: normalizedQuestions } : {})
      },
      { new: true }
    )
    if (!doc) return res.status(404).json({ ok: false, message: 'Quiz not found' })
    return res.status(200).json({ ok: true, data: doc })
  } catch (err) {
    console.error('updateQuiz error:', err)
    return res.status(500).json({ ok: false, message: err.message || 'Server error' })
  }
}

// Xóa Quiz
export const deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Quiz.findByIdAndDelete(id);
    if (!doc) return res.status(404).json({ ok: false, message: 'Quiz not found' });
    return res.status(200).json({ ok: true, message: 'Deleted' });
  } catch (err) {
    console.error('deleteQuiz error:', err);
    return res.status(500).json({ ok: false, message: err.message || 'Server error' });
  }
}

// Tạo quiz bằng AI từ subtitle
export const createQuizByAi = async (req, res) => {
  try {
    const { subtitle , quizType } = req.body || {}

    if (!subtitle || !subtitle.trim()) {
      return res.status(400).json({ message: 'Subtitle is required' })
    }

    if (!quizType) {
      return res.status(400).json({ message: 'Quiz type is required' })
    }

    const data = await OpenaiProvider.generateQuiz(subtitle, quizType)
    return res.status(200).json(data)
  } catch (err) {
    console.error('createQuiz error:', err)
    return res.status(500).json({ ok: false, message: err.message || 'Server error' })
  }
}

// Tại quiz tương tác với phim
export const createInteractiveQuizByAi = async (req, res) => {
  try {
    const { segmentSubtitle, mcqNum, fill_blankNum, true_falseNum } = req.body
    if (!segmentSubtitle || !mcqNum || !fill_blankNum || !true_falseNum) {
      return res.status(400).json({ message: 'Thiếu tham số bắt buộc' })
    }
    const data = await OpenaiProvider.generateInteractiveQuiz(segmentSubtitle, mcqNum, fill_blankNum, true_falseNum)
    return res.status(200).json(data)
  } catch (err) {
    console.error('createInteractiveQuiz error:', err)
    return res.status(500).json({ ok: false, message: err.message || 'Server error' })
  }
}