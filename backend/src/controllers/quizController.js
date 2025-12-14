import Quiz from '../models/quizModel.js'
import Movie from '../models/movieModel.js'
import { OpenAiGenQuiz } from '../services/OpenAiGenQuizService.js'

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

// Lấy phim và bài tập theo loại
export const getUniqueMovieQuizTypes = async (req, res) => {
  try {
    const data = await Quiz.aggregate([
      {
        $group: {
          _id: { movieId: '$movieId', quizType: '$quizType' }, // gom theo cặp movieId + quizType
          quizCount: { $sum: 1 } // đếm xem có bao nhiêu quiz cho cặp này (nếu bạn muốn xài)
        }
      },
      {
        $lookup: {
          from: 'movies',                // tên collection Movie trong Mongo (thường là 'movies')
          localField: '_id.movieId',
          foreignField: '_id',
          as: 'movie'
        }
      },
      { $unwind: '$movie' },
      {
        $project: {
          _id: 0,
          movieId: '$_id.movieId',
          quizType: '$_id.quizType',
          quizCount: 1,
          movieTitle: '$movie.title'
        }
      },
      { $sort: { movieTitle: 1, quizType: 1 } }
    ])

    return res.status(200).json({
      message: 'OK',
      data
    })
  } catch (err) {
    console.error('getUniqueMovieQuizTypes error:', err)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

// Lấy số Quiz theo movie và quiz_type
export const listQuizSummary = async (req, res) => {
  try {
    const grouped = await Quiz.aggregate([
      { $group: { _id: { movieId: '$movieId', quizType: '$quizType' }, count: { $sum: 1 } } }
    ])

    const movieIdToCounts = new Map()
    for (const g of grouped) {
      const movieId = String(g._id.movieId)
      const type = g._id.quizType
      const count = g.count
      if (!movieIdToCounts.has(movieId)) {
        movieIdToCounts.set(movieId, { reading: 0, dialogue_reordering: 0, translation: 0, equivalent: 0 })
      }
      const entry = movieIdToCounts.get(movieId)
      if (type && Object.prototype.hasOwnProperty.call(entry, type)) {
        entry[type] = count
      }
    }

    const movieIds = Array.from(movieIdToCounts.keys())
    const movies = await Movie.find({ _id: { $in: movieIds } }, { title: 1 }).lean()
    const idToTitle = new Map(movies.map(m => [String(m._id), m.title]))

    const result = movieIds.map(id => ({
      movieId: id,
      title: idToTitle.get(id) || '(Unknown)',
      quizCounts: movieIdToCounts.get(id)
    }))

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
export const generatorQuiz = async (req, res) => {
  try {
    const { subtitle , quizType } = req.body || {}

    if (!subtitle || !subtitle.trim()) {
      return res.status(400).json({ message: 'Subtitle is required' })
    }

    if (!quizType) {
      return res.status(400).json({ message: 'Quiz type is required' })
    }

    const data = await OpenAiGenQuiz.createQuiz(subtitle, quizType)
    return res.status(200).json(data)
  } catch (err) {
    console.error('Create quiz error:', err)
    return res.status(500).json({ ok: false, message: err.message || 'Server error' })
  }
}

// Tại quiz tương tác với phim
export const generatotQuizWithMovie = async (req, res) => {
  try {
    const { subtitleSegment } = req.body
    if (!subtitleSegment || !subtitleSegment.trim()) {
      return res.status(400).json({ message: 'Thiếu tham số bắt buộc: subtitleSegment' })
    }
    const data = await OpenAiGenQuiz.createExerciseForMovie(subtitleSegment)
    return res.status(200).json(data)
  } catch (err) {
    console.error('generatotQuizWithMovie error:', err)
    return res.status(500).json({ ok: false, message: err.message || 'Server error' })
  }
}