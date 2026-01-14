import React, { useEffect, useState } from 'react'
import { fetchMoviesApi, getSubtitlesByMovieApi, createQuizByAiApi } from '@/api'
import { processSubtitle } from '@/utils/helpers'

const QUIZ_TYPES = [
  { value: 'reading', label: 'Đọc hiểu' },
  { value: 'dialogue_reordering', label: 'Sắp xếp hội thoại' },
  { value: 'translation', label: 'Dịch thuật' },
  { value: 'equivalent', label: 'Câu tương đương' },
]

const toArray = (res) => (Array.isArray(res) ? res : (res?.data ?? []))

const AddQuizPage = () => {
  const [movies, setMovies] = useState([])
  const [selectedMovieId, setSelectedMovieId] = useState('')
  const [quizType, setQuizType] = useState('')
  const [quizCount, setQuizCount] = useState(1)

  const [subtitle, setSubtitle] = useState('')
  const [subtitleMessage, setSubtitleMessage] = useState('')
  const [loadingMovies, setLoadingMovies] = useState(false)
  const [loadingSubtitles, setLoadingSubtitles] = useState(false)
  const [loadingGenerate, setLoadingGenerate] = useState(false)
  const [generatedQuizzes, setGeneratedQuizzes] = useState([])
  const [editingQuiz, setEditingQuiz] = useState(null) // { quizIdx, questionIdx, field }

  // Fetch movies
  useEffect(() => {
    const loadMovies = async () => {
      setLoadingMovies(true)
      try {
        const res = await fetchMoviesApi()
        setMovies(toArray(res))
      } catch (err) {
        console.error('Error fetching movies:', err)
        setMovies([])
      } finally {
        setLoadingMovies(false)
      }
    }
    loadMovies()
  }, [])

  // Chọn phim -> fetch phụ đề
  const handleMovieChange = async (e) => {
    const movieId = e.target.value
    setSelectedMovieId(movieId)

    // reset
    setSubtitle('')
    setSubtitleMessage('')

    if (!movieId) return

    setLoadingSubtitles(true)
    try {
      const res = await getSubtitlesByMovieApi(movieId)
      const data = toArray(res)
      
      if (data.length > 0 && data[0]?.srtContent) {
        setSubtitle(data[0].srtContent)
        setSubtitleMessage('')
      } else {
        setSubtitle('')
        setSubtitleMessage('Phim chưa có phụ đề.')
      }
    } catch (err) {
      console.error('Error fetching subtitles:', err)
      setSubtitle('')
      setSubtitleMessage('Không thể lấy phụ đề.')
    } finally {
      setLoadingSubtitles(false)
    }
  }

  const handleQuizCountChange = (e) => {
    const value = Number(e.target.value)
    const safe = Math.max(1, Math.min(5, Number.isFinite(value) ? value : 1))
    setQuizCount(safe)
  }

  const canGenerate = selectedMovieId && quizType && subtitle && !loadingSubtitles && !loadingGenerate

  // Hàm sinh quiz
  const handleGenerateQuiz = async () => {
    if (!canGenerate) return
    
    if (!subtitle || !subtitle.trim()) {
      console.error('Không có nội dung phụ đề')
      setSubtitleMessage('Không có nội dung phụ đề để tạo quiz.')
      return
    }

    // Xử lý phụ đề: xóa timestamp + cắt ngắn
    const processedSubtitle = processSubtitle(subtitle)

    // console.log(`Phụ đề gốc: ${subtitle.length} ký tự`)
    // console.log(`Phụ đề sau xử lý: ${processedSubtitle.length} ký tự`)

    const payload = {
      subtitle: processedSubtitle,
      quizType: quizType,
      count: quizCount,
    }

    // console.log('Gửi payload tạo quiz:', payload)

    setLoadingGenerate(true)
    setGeneratedQuizzes([])
    try {
      const res = await createQuizByAiApi(payload)
      console.log('Quiz generated:', res)
      setGeneratedQuizzes(toArray(res))
    } catch (err) {
      console.error('Error generating quiz:', err)
      setGeneratedQuizzes([])
      setSubtitleMessage('Lỗi tạo quiz: ' + (err?.response?.data?.message || err.message))
    } finally {
      setLoadingGenerate(false)
    }
  }

  // Hàm bật/tắt chế độ chỉnh sửa
  const handleEditToggle = (quizIdx, questionIdx, field) => {
    setEditingQuiz({ quizIdx, questionIdx, field })
  }

  // Hàm lưu thay đổi
  const handleSaveEdit = (quizIdx, questionIdx, field, value) => {
    const updated = [...generatedQuizzes]
    if (field === 'passage') {
      updated[quizIdx].passage = value
    } else if (field === 'question') {
      updated[quizIdx].questions[questionIdx].question = value
    } else if (field === 'answer') {
      updated[quizIdx].questions[questionIdx].answer = value
    } else if (field === 'explanation') {
      updated[quizIdx].questions[questionIdx].explanation = value
    } else if (field === 'quote') {
      updated[quizIdx].questions[questionIdx].quote = value
    } else if (field.startsWith('option-')) {
      const optionIdx = parseInt(field.split('-')[1])
      updated[quizIdx].questions[questionIdx].options[optionIdx] = value
    }
    setGeneratedQuizzes(updated)
    setEditingQuiz(null)
  }

  // Hàm xóa bài quiz
  const handleDeleteQuiz = (quizIdx) => {
    const updated = [...generatedQuizzes]
    updated.splice(quizIdx, 1)
    setGeneratedQuizzes(updated)
  }

  // Hàm lưu quiz vào database
  const handleSaveQuizzes = () => {
    if (!selectedMovieId || generatedQuizzes.length === 0) {
      console.warn('Không có dữ liệu để lưu')
      return
    }

    // Chuẩn bị payload theo đúng schema của backend
    const payload = generatedQuizzes.map((quiz) => ({
      movieId: selectedMovieId,
      quizType: quizType,
      passage: quiz.passage || null,
      questions: quiz.questions.map((q) => ({
        question: q.question,
        answer: q.answer,
        explanation: q.explanation || '',
        quote: q.quote || '',
        options: q.options.map((opt, idx) => ({
          label: String.fromCharCode(65 + idx), // A, B, C, D
          content: opt.replace(/^[A-D]\.\s*/, '') // Xóa prefix A. B. C. D. nếu có
        }))
      }))
    }))

    console.log('Payload to save:', payload)
    
    // TODO: Gọi API lưu vào database
    // await createQuizApi(payload)
  }

  return (
    <div className="min-h-screen bg-[#2E4863] text-white">
      <div className="max-w-[1200px] mx-auto px-4 py-6">
        <h1 className="text-2xl font-semibold text-[#E4D161] mb-4">Add Quiz</h1>

        <div className="space-y-6">
          {/* TOP SECTION - Controls */}
          <div className="bg-[#1B2A36] p-4 rounded-md border border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Quiz type */}
              <div>
                <label className="block text-sm font-medium mb-2">Loại bài tập</label>
                <select
                  value={quizType}
                  onChange={(e) => setQuizType(e.target.value)}
                  className="w-full bg-[#14202A] text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E4D161]"
                >
                  <option value="">Chọn loại bài tập</option>
                  {QUIZ_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quiz count */}
              <div>
                <label className="block text-sm font-medium mb-2">Số lượng bài tập</label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={quizCount}
                  onChange={handleQuizCountChange}
                  className="w-full bg-[#14202A] text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E4D161]"
                />
              </div>

              {/* Movie */}
              <div>
                <label className="block text-sm font-medium mb-2">Phim</label>
                <select
                  value={selectedMovieId}
                  onChange={handleMovieChange}
                  disabled={loadingMovies}
                  className="w-full bg-[#14202A] text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E4D161] disabled:opacity-60"
                >
                  <option value="">
                    {loadingMovies ? 'Đang tải phim...' : 'Chọn phim'}
                  </option>
                  {movies.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Subtitle status */}
            <div className="mt-4">
              {loadingSubtitles && <div className="text-sm text-gray-300">Đang tải phụ đề...</div>}
              {!loadingSubtitles && subtitleMessage && (
                <div className="text-yellow-400 font-medium">{subtitleMessage}</div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 flex-wrap mt-6">
              <button
                onClick={handleGenerateQuiz}
                disabled={!canGenerate}
                className="px-5 py-2.5 bg-[#E4D161] hover:bg-[#d4c151] text-black rounded-md font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Tạo Quiz tự động
              </button>
              <button 
                onClick={handleSaveQuizzes}
                disabled={generatedQuizzes.length === 0}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-md font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Lưu Quiz ({generatedQuizzes.length})
              </button>
            </div>
          </div>

          {/* BOTTOM SECTION - Kết quả */}
          <div className="bg-[#1B2A36] p-4 rounded-md border border-white/10 min-h-[400px]">
            <h2 className="text-lg font-semibold mb-4">Danh sách bài tập</h2>
            
            {loadingGenerate ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#E4D161] mb-4"></div>
                <p className="text-gray-300 font-medium">Đang tạo bài tập bằng AI...</p>
                <p className="text-gray-500 text-sm mt-2">Vui lòng đợi trong giây lát</p>
              </div>
            ) : generatedQuizzes.length > 0 ? (
              <div className="space-y-4">
                {generatedQuizzes.map((quiz, quizIdx) => (
                  <div key={quizIdx} className="bg-[#14202A] p-4 rounded-md border border-white/5 relative group">
                    {/* Nút xóa bài quiz */}
                    <button
                      onClick={() => handleDeleteQuiz(quizIdx)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs font-medium"
                    >
                      Xóa bài
                    </button>

                    <h3 className="font-semibold text-[#E4D161] mb-2">Bài {quizIdx + 1}</h3>
                    
                    {/* Đoạn văn */}
                    {quiz.passage && (
                      <div className="mb-4 p-3 bg-[#0D1419] rounded border border-white/5 relative group/passage">
                        <p className="text-xs text-gray-500 mb-1 uppercase font-semibold">Đoạn văn:</p>
                        {editingQuiz?.quizIdx === quizIdx && editingQuiz?.field === 'passage' ? (
                          <div>
                            <textarea
                              defaultValue={quiz.passage}
                              className="w-full bg-[#14202A] text-gray-300 p-2 rounded border border-[#E4D161] focus:outline-none text-sm leading-relaxed min-h-[150px]"
                              onBlur={(e) => handleSaveEdit(quizIdx, null, 'passage', e.target.value)}
                              autoFocus
                            />
                            <button
                              onClick={() => setEditingQuiz(null)}
                              className="mt-2 text-xs text-gray-400 hover:text-white"
                            >
                              Đóng
                            </button>
                          </div>
                        ) : (
                          <div className="relative">
                            <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">{quiz.passage}</p>
                            <button
                              onClick={() => handleEditToggle(quizIdx, null, 'passage')}
                              className="absolute top-0 right-0 opacity-0 group-hover/passage:opacity-100 transition-opacity bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs"
                            >
                              Sửa
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="space-y-4">
                      {quiz.questions?.map((q, qIdx) => (
                        <div key={qIdx} className="border-l-2 border-[#E4D161] pl-3 relative group/question">
                          {/* Câu hỏi */}
                          <div className="mb-2 relative group/field">
                            {editingQuiz?.quizIdx === quizIdx && editingQuiz?.questionIdx === qIdx && editingQuiz?.field === 'question' ? (
                              <input
                                type="text"
                                defaultValue={q.question}
                                className="w-full bg-[#14202A] text-white p-2 rounded border border-[#E4D161] focus:outline-none font-medium"
                                onBlur={(e) => handleSaveEdit(quizIdx, qIdx, 'question', e.target.value)}
                                autoFocus
                              />
                            ) : (
                              <div className="relative">
                                <p className="font-medium text-white pr-12">
                                  {qIdx + 1}. {q.question}
                                </p>
                                <button
                                  onClick={() => handleEditToggle(quizIdx, qIdx, 'question')}
                                  className="absolute top-0 right-0 opacity-0 group-hover/field:opacity-100 transition-opacity bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs"
                                >
                                  Sửa
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Options */}
                          <div className="ml-4 space-y-1 text-gray-400 mb-2">
                            {q.options?.map((opt, oIdx) => (
                              <div key={oIdx} className="relative group/option">
                                {editingQuiz?.quizIdx === quizIdx && editingQuiz?.questionIdx === qIdx && editingQuiz?.field === `option-${oIdx}` ? (
                                  <input
                                    type="text"
                                    defaultValue={opt}
                                    className="w-full bg-[#14202A] text-gray-300 p-1 rounded border border-[#E4D161] focus:outline-none text-sm"
                                    onBlur={(e) => handleSaveEdit(quizIdx, qIdx, `option-${oIdx}`, e.target.value)}
                                    autoFocus
                                  />
                                ) : (
                                  <div className="relative pr-12">
                                    <span className={opt === q.answer || opt.startsWith(q.answer + '.') ? 'text-emerald-400 font-medium' : ''}>
                                      {opt}
                                    </span>
                                    <button
                                      onClick={() => handleEditToggle(quizIdx, qIdx, `option-${oIdx}`)}
                                      className="absolute top-0 right-0 opacity-0 group-hover/option:opacity-100 transition-opacity bg-blue-500 hover:bg-blue-600 text-white px-2 py-0.5 rounded text-xs"
                                    >
                                      Sửa
                                    </button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>

                          <div className="ml-4 mt-2 space-y-2">
                            {/* Đáp án */}
                            <div className="flex items-start gap-2 relative group/answer">
                              <span className="text-emerald-400 font-semibold text-xs">✓ Đáp án:</span>
                              {editingQuiz?.quizIdx === quizIdx && editingQuiz?.questionIdx === qIdx && editingQuiz?.field === 'answer' ? (
                                <input
                                  type="text"
                                  defaultValue={q.answer}
                                  className="flex-1 bg-[#14202A] text-emerald-400 p-1 rounded border border-[#E4D161] focus:outline-none text-sm font-medium"
                                  onBlur={(e) => handleSaveEdit(quizIdx, qIdx, 'answer', e.target.value)}
                                  autoFocus
                                />
                              ) : (
                                <>
                                  <span className="text-emerald-400 font-medium text-sm flex-1">{q.answer}</span>
                                  <button
                                    onClick={() => handleEditToggle(quizIdx, qIdx, 'answer')}
                                    className="opacity-0 group-hover/answer:opacity-100 transition-opacity bg-blue-500 hover:bg-blue-600 text-white px-2 py-0.5 rounded text-xs"
                                  >
                                    Sửa
                                  </button>
                                </>
                              )}
                            </div>

                            {/* Giải thích */}
                            {q.explanation && (
                              <div className="bg-[#0D1419] p-2 rounded border border-white/5 relative group/explanation">
                                <p className="text-xs text-gray-500 mb-1 font-semibold">Giải thích:</p>
                                {editingQuiz?.quizIdx === quizIdx && editingQuiz?.questionIdx === qIdx && editingQuiz?.field === 'explanation' ? (
                                  <textarea
                                    defaultValue={q.explanation}
                                    className="w-full bg-[#14202A] text-gray-300 p-2 rounded border border-[#E4D161] focus:outline-none text-sm leading-relaxed min-h-[80px]"
                                    onBlur={(e) => handleSaveEdit(quizIdx, qIdx, 'explanation', e.target.value)}
                                    autoFocus
                                  />
                                ) : (
                                  <div className="relative">
                                    <p className="text-sm text-gray-300 leading-relaxed">{q.explanation}</p>
                                    <button
                                      onClick={() => handleEditToggle(quizIdx, qIdx, 'explanation')}
                                      className="absolute top-0 right-0 opacity-0 group-hover/explanation:opacity-100 transition-opacity bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs"
                                    >
                                      Sửa
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Trích dẫn */}
                            {q.quote && (
                              <div className="bg-[#0D1419] p-2 rounded border border-blue-500/20 relative group/quote">
                                <p className="text-xs text-blue-400 mb-1 font-semibold">Trích dẫn:</p>
                                {editingQuiz?.quizIdx === quizIdx && editingQuiz?.questionIdx === qIdx && editingQuiz?.field === 'quote' ? (
                                  <textarea
                                    defaultValue={q.quote}
                                    className="w-full bg-[#14202A] text-gray-400 p-2 rounded border border-[#E4D161] focus:outline-none text-sm italic min-h-[60px]"
                                    onBlur={(e) => handleSaveEdit(quizIdx, qIdx, 'quote', e.target.value)}
                                    autoFocus
                                  />
                                ) : (
                                  <div className="relative">
                                    <p className="text-sm text-gray-400 italic">"{q.quote}"</p>
                                    <button
                                      onClick={() => handleEditToggle(quizIdx, qIdx, 'quote')}
                                      className="absolute top-0 right-0 opacity-0 group-hover/quote:opacity-100 transition-opacity bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs"
                                    >
                                      Sửa
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400">Chưa có bài tập nào.</p>
                <p className="text-gray-500 text-sm mt-2">
                  Nhấn <span className="text-[#E4D161] font-medium">Tạo Quiz tự động</span> để bắt đầu.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddQuizPage
