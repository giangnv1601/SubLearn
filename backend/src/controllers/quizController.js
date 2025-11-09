import Quiz from '../models/quizModel.js'
import Movie from '../models/movieModel.js'

// Helper: chuyển 'A'|'B'|'C'|'D' thành index 0-3
const letterToIndex = (letter = 'A') => {
  const map = { A: 0, B: 1, C: 2, D: 3 }
  const key = String(letter || 'A').trim().toUpperCase()
  return Number.isInteger(map[key]) ? map[key] : 0
}

export const createQuiz = async (req, res) => {
  try {
    const { movieId, quizType, passage, questions } = req.body

    // Chuẩn hoá dữ liệu đồng nhất
    const normalizedQuestions = Array.isArray(questions)
      ? questions.map(q => ({
          question: q?.question || '',
          answerLetter: q?.answer || 'A',
          answerIndex: letterToIndex(q?.answer),
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

// Summary counts per movie and type
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


export const listQuizzes = async (req, res) => {
  try {
    const { movie_id, quiz_type } = req.query
    const filter = {}
    if (movie_id) filter.movieId = movie_id
    if (quiz_type) filter.quizType = quiz_type

    const items = await Quiz.find(filter).sort({ createdAt: -1 })
    return res.status(200).json({ ok: true, data: items })
  } catch (err) {
    console.error('listQuizzes error:', err)
    return res.status(500).json({ ok: false, message: err.message || 'Server error' })
  }
}

export const updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const { movieId, quizType, passage, questions } = req.body;

    // Chuẩn hóa questions nếu có
    let normalizedQuestions = undefined;
    if (Array.isArray(questions)) {
      normalizedQuestions = questions.map(q => ({
        question: q?.question || '',
        answerLetter: q?.answer || q?.answerLetter || 'A',
        answerIndex: Number.isInteger(q?.answerIndex)
          ? q.answerIndex
          : letterToIndex(q?.answer || q?.answerLetter),
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
