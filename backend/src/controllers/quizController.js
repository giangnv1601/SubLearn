import Quiz from '../models/quizModel.js'
import { OpenaiProvider } from '../providers/OpenaiProvider.js'

export const addQuiz = async (req, res) => {
  try {
    const quizzes = req.body;

    // Validate input
    if (!Array.isArray(quizzes) || quizzes.length === 0) {
      return res.status(400).json({ 
        ok: false, 
        message: 'Dữ liệu không hợp lệ hoặc rỗng' 
      });
    }

    // Validate từng quiz
    for (let i = 0; i < quizzes.length; i++) {
      const quiz = quizzes[i];
      
      if (!quiz.movieId) {
        return res.status(400).json({ 
          ok: false, 
          message: `Quiz ${i + 1}: thiếu movieId` 
        });
      }

      if (!quiz.quizType) {
        return res.status(400).json({ 
          ok: false, 
          message: `Quiz ${i + 1}: thiếu quizType` 
        });
      }

      if (!['reading', 'dialogue_reordering', 'translation', 'equivalent'].includes(quiz.quizType)) {
        return res.status(400).json({ 
          ok: false, 
          message: `Quiz ${i + 1}: quizType không hợp lệ` 
        });
      }

      if (!Array.isArray(quiz.questions) || quiz.questions.length === 0) {
        return res.status(400).json({ 
          ok: false, 
          message: `Quiz ${i + 1}: thiếu hoặc không có câu hỏi nào` 
        });
      }

      // Validate từng question
      for (let j = 0; j < quiz.questions.length; j++) {
        const q = quiz.questions[j];
        
        if (!q.question || !q.answer || !Array.isArray(q.options) || q.options.length !== 4) {
          return res.status(400).json({ 
            ok: false, 
            message: `Quiz ${i + 1}, câu ${j + 1}: thiếu trường bắt buộc hoặc options không đủ 4 phần tử` 
          });
        }

        if (!['A', 'B', 'C', 'D'].includes(q.answer)) {
          return res.status(400).json({ 
            ok: false, 
            message: `Quiz ${i + 1}, câu ${j + 1}: answer phải là A, B, C hoặc D` 
          });
        }

        // Validate options
        for (let k = 0; k < q.options.length; k++) {
          const opt = q.options[k];
          if (!opt.label || !opt.content) {
            return res.status(400).json({ 
              ok: false, 
              message: `Quiz ${i + 1}, câu ${j + 1}, option ${k + 1}: thiếu label hoặc content` 
            });
          }
        }
      }
    }

    // Chuẩn hóa và lưu từng quiz
    const savedQuizzes = [];
    for (const quiz of quizzes) {
      const normalizedQuestions = quiz.questions.map(q => ({
        question: q.question || '',
        answer: q.answer || 'A',
        explanation: q.explanation || '',
        quote: q.quote || '',
        options: q.options.map(opt => ({
          label: opt.label || '',
          content: opt.content || ''
        }))
      }));

      const doc = await Quiz.create({
        movieId: quiz.movieId,
        quizType: quiz.quizType,
        passage: quiz.passage || null,
        questions: normalizedQuestions
      });

      savedQuizzes.push(doc);
    }

    return res.status(201).json({ 
      ok: true, 
      message: `Đã lưu thành công ${savedQuizzes.length} bài quiz`,
      data: savedQuizzes 
    });

  } catch (err) {
    console.error('addQuiz error:', err);
    return res.status(500).json({ 
      ok: false, 
      message: err.message || 'Server error' 
    });
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
export const getQuizzesByMovieAndQuizType = async (req, res) => {
  try {
    const { movieId, quizType } = req.query

    if (!movieId || !quizType) {
      return res.status(400).json({ message: 'Thiếu tham số bắt buộc: movieId và quizType' })
    }

    const filter = { movieId, quizType}

    const items = await Quiz.find(filter).sort({ createdAt: -1 }).lean()
    return res.status(200).json(items)
  } catch (err) {
    console.error('listQuizzes error:', err)
    return res.status(500).json({ message: err.message || 'Server error' })
  }
}

// Cập nhập Quiz
export const updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const { passage, questions } = req.body;

    // Validate quiz ID
    if (!id) {
      return res.status(400).json({ message: 'Thiếu Id bài quiz' });
    }

    // Kiểm tra quiz có tồn tại không
    const existingQuiz = await Quiz.findById(id);
    if (!existingQuiz) {
      return res.status(404).json({ message: 'Không tìm thấy bài quiz' });
    }

    // Validate questions
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: 'Thiếu hoặc không có câu hỏi nào' });
    }

    // Validate từng question
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      
      if (!q.question || !q.answer || !Array.isArray(q.options) || q.options.length !== 4) {
        return res.status(400).json({ message: `Câu ${i + 1}: thiếu trường bắt buộc hoặc options không đủ 4 phần tử` });
      }

      if (!['A', 'B', 'C', 'D'].includes(q.answer)) {
        return res.status(400).json({ message: `Câu ${i + 1}: answer phải là A, B, C hoặc D` });
      }

      // Validate options
      for (let j = 0; j < q.options.length; j++) {
        const opt = q.options[j];
        if (!opt.label || !opt.content) {
          return res.status(400).json({ message: `Câu ${i + 1}, option ${j + 1}: thiếu label hoặc content` });
        }
      }
    }

    // Chuẩn hóa dữ liệu
    const normalizedQuestions = questions.map(q => ({
      question: q.question || '',
      answer: q.answer || 'A',
      explanation: q.explanation || '',
      quote: q.quote || '',
      options: q.options.map(opt => ({
        label: opt.label || '',
        content: opt.content || ''
      }))
    }));

    // Update quiz
    const updatedQuiz = await Quiz.findByIdAndUpdate(
      id,
      {
        passage: passage || null,
        questions: normalizedQuestions
      },
      { new: true, runValidators: true }
    );

    return res.status(200).json({ 
      message: 'Cập nhật bài quiz thành công',
      data: updatedQuiz 
    });

  } catch (err) {
    console.error('updateQuiz error:', err);
    return res.status(500).json({ message: err.message || 'Server error' });
  }
}

// Xóa Quiz
export const deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ message: 'Thiếu Id bài quiz' });
    }

    const doc = await Quiz.findByIdAndDelete(id);
    
    if (!doc) {
      return res.status(404).json({ message: 'Không tìm thấy bài quiz để xóa' });
    }

    return res.status(200).json({message: 'Xóa bài quiz thành công'})
  } catch (err) {
    console.error('deleteQuiz error:', err);
    return res.status(500).json({ message: err.message || 'Lỗi server khi xóa bài quiz' });
  }
}

// Xóa quiz theo movieId và typeQuiz
export const deleteQuizzesByMovieAndTypeQuiz = async (req, res) => {
  try {
    const { movieId, quizType } = req.params;
    const result = await Quiz.deleteMany({ movieId, quizType });
    return res.status(200).json({ 
      ok: true, 
      message: `Xóa thành công ${result.deletedCount} bài quiz` 
    });
  } catch (err) {
    console.error('deleteQuizzesByMovieAndTypeQuiz error:', err);
    return res.status(500).json({ 
      ok: false, 
      message: err.message || 'Server error' 
    });
  }
}

// Tạo quiz bằng AI từ subtitle
export const createQuizByAi = async (req, res) => {
  try {
    const { subtitle , quizType, count } = req.body || {}

    if (!subtitle || !subtitle.trim()) {
      return res.status(400).json({ message: 'Subtitle is required' })
    }

    if (!quizType) {
      return res.status(400).json({ message: 'Quiz type is required' })
    }

    const data = await OpenaiProvider.generateQuiz(subtitle, quizType, count)
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
    
    // Validate required fields
    if (!segmentSubtitle || typeof segmentSubtitle !== 'string') {
      return res.status(400).json({ message: 'segmentSubtitle là bắt buộc và phải là chuỗi' })
    }
    
    if (typeof mcqNum !== 'number' || typeof fill_blankNum !== 'number' || typeof true_falseNum !== 'number') {
      return res.status(400).json({ message: 'mcqNum, fill_blankNum, true_falseNum phải là số' })
    }

    if (mcqNum < 0 || fill_blankNum < 0 || true_falseNum < 0) {
      return res.status(400).json({ message: 'Số lượng bài tập không được âm' })
    }

    if (mcqNum + fill_blankNum + true_falseNum < 3) {
      return res.status(400).json({ message: 'Phải có ít nhất 3 câu hỏi' })
    }

    const data = await OpenaiProvider.generateInteractiveQuiz(
      segmentSubtitle, 
      mcqNum, 
      fill_blankNum, 
      true_falseNum
    )
    
    return res.status(200).json(data)
  } catch (err) {
    console.error('createInteractiveQuiz error:', err)
    return res.status(500).json({ ok: false, message: err.message || 'Server error' })
  }
}