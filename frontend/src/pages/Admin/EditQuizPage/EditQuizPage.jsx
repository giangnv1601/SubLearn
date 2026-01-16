import React, { useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useNavigate, useParams } from 'react-router'
import { fetchQuizByMovieAndTypeQuizApi, updateQuizApi, deleteQuizApi } from '@/api'
import { toast } from 'sonner'
import ConfirmDialog from '@/components/ConfirmDialog/ConfirmDialog'

const EditQuizPage = () => {
  const navigate = useNavigate()
  const { movieId, quizType } = useParams()
  const [quizzes, setQuizzes] = useState([])
  const [originalQuizzes, setOriginalQuizzes] = useState([])
  const [editingQuiz, setEditingQuiz] = useState(null)
  const [loading, setLoading] = useState(false)
  const [savingQuizId, setSavingQuizId] = useState(null)
  const [deletingQuizId, setDeletingQuizId] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState({ open: false, quizIdx: null })

  // Hàm gọi API lấy dữ liệu quiz
  const fetchQuizzes = async (movieId, quizType) => {
    setLoading(true)
    try {
      const data = await fetchQuizByMovieAndTypeQuizApi(movieId, quizType)
      console.log('Dữ liệu quiz lấy về từ API:', data)
      // Chuẩn hóa dữ liệu từ API về format hiển thị
      const normalizedData = data?.map(quiz => ({
        ...quiz,
        questions: quiz.questions?.map(q => ({
          ...q,
          options: q.options?.map(opt => 
            typeof opt === 'string' ? opt : `${opt.label}. ${opt.content}`
          )
        }))
      })) || []
      setQuizzes(normalizedData)
      setOriginalQuizzes(JSON.parse(JSON.stringify(normalizedData)))
      console.log('Dữ liệu quiz lấy về đã xử lý:', normalizedData)
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu quiz:', error)
      toast.error('Lỗi khi lấy dữ liệu quiz. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuizzes(movieId, quizType)
  }, [movieId, quizType])

  // Kiểm tra quiz có thay đổi không
  const isQuizModified = (quizIdx) => {
    return JSON.stringify(quizzes[quizIdx]) !== JSON.stringify(originalQuizzes[quizIdx])
  }

  // Hàm bật/tắt chế độ chỉnh sửa
  const handleEditToggle = (quizIdx, questionIdx, field) => {
    setEditingQuiz({ quizIdx, questionIdx, field })
  }

  // Hàm lưu thay đổi
  const handleSaveEdit = (quizIdx, questionIdx, field, value) => {
    const updated = [...quizzes]
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
    setQuizzes(updated)
    setEditingQuiz(null)
  }

  // Mở dialog xác nhận xóa
  const handleDeleteClick = (quizIdx) => {
    setConfirmDelete({ open: true, quizIdx })
  }

  // Hàm xóa bài quiz
  const handleDeleteQuiz = async () => {
    const quizIdx = confirmDelete.quizIdx
    setConfirmDelete({ open: false, quizIdx: null })
    
    const quiz = quizzes[quizIdx]
    const quizId = quiz._id

    if (!quizId) {
      toast.error('Không tìm thấy ID bài tập để xóa!')
      return
    }

    setDeletingQuizId(quizId)
    try {
      console.log('Xóa bài quiz với ID:', quizId)
      
      await deleteQuizApi(quizId)
      
      // Xóa khỏi state local
      const updatedQuizzes = [...quizzes]
      updatedQuizzes.splice(quizIdx, 1)
      setQuizzes(updatedQuizzes)
      
      const updatedOriginal = [...originalQuizzes]
      updatedOriginal.splice(quizIdx, 1)
      setOriginalQuizzes(updatedOriginal)
      
      toast.success(`Đã xóa bài tập thành công!`)
    } catch (error) {
      console.error('Lỗi khi xóa bài tập:', error)
      toast.error('Lỗi khi xóa bài tập. Vui lòng thử lại.')
    } finally {
      setDeletingQuizId(null)
    }
  }

  // Hủy xóa
  const handleCancelDelete = () => {
    setConfirmDelete({ open: false, quizIdx: null })
  }

  // Hàm lưu một bài quiz cụ thể
  const handleSaveQuiz = async (quizIdx) => {
    const quiz = quizzes[quizIdx]
    const quizId = quiz._id

    if (!quizId) {
      toast.error('Không tìm thấy ID bài tập để lưu!')
      return
    }

    const payload = {
      passage: quiz.passage || null,
      questions: quiz.questions.map((q) => ({
        question: q.question || '',
        answer: q.answer || 'A',
        explanation: q.explanation || '',
        quote: q.quote || '',
        options: q.options.map((opt, idx) => {
          const content = typeof opt === 'string' ? opt.replace(/^[A-D]\.\s*/, '') : opt
          return {
            label: String.fromCharCode(65 + idx),
            content: content
          }
        })
      }))
    }
    
    setSavingQuizId(quizId)
    try {
      await updateQuizApi(quizId, payload)
      
      // Cập nhật originalQuizzes sau khi lưu thành công
      const updatedOriginal = [...originalQuizzes]
      updatedOriginal[quizIdx] = JSON.parse(JSON.stringify(quiz))
      setOriginalQuizzes(updatedOriginal)
      
      toast.success(`Đã lưu bài ${quizIdx + 1} thành công!`)
    } catch (error) {
      console.error('Lỗi khi lưu bài tập:', error)
      toast.error('Lỗi khi lưu bài tập. Vui lòng thử lại.')
    } finally {
      setSavingQuizId(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#2E4863] text-white">
      <div className="max-w-[1200px] mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-semibold text-[#E4D161]">Chỉnh sửa bài tập</h1>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          <div className="bg-[#1B2A36] p-4 rounded-md border border-white/10 min-h-[400px]">
            <h2 className="text-lg font-semibold mb-4">Danh sách bài tập</h2>
            
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#E4D161] mb-4"></div>
                <p className="text-gray-300 font-medium">Đang tải bài tập...</p>
              </div>
            ) : quizzes.length > 0 ? (
              <div className="space-y-4">
                {quizzes.map((quiz, quizIdx) => (
                  <div key={quiz._id || quizIdx} className="bg-[#14202A] p-4 rounded-md border border-white/5 relative group">
                    {/* Nút Lưu và Xóa bài quiz */}
                    <div className="absolute top-2 right-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleSaveQuiz(quizIdx)}
                        disabled={!isQuizModified(quizIdx) || savingQuizId === quiz._id}
                        className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/15 disabled:cursor-not-allowed text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1"
                      >
                        {savingQuizId === quiz._id ? (
                          <>
                            <div className="inline-block animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                            <span>Đang lưu...</span>
                          </>
                        ) : (
                          'Lưu bài'
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteClick(quizIdx)}
                        disabled={deletingQuizId === quiz._id}
                        className="bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 disabled:cursor-not-allowed text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1"
                      >
                        {deletingQuizId === quiz._id ? (
                          <>
                            <div className="inline-block animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                            <span>Đang xóa...</span>
                          </>
                        ) : (
                          'Xóa bài'
                        )}
                      </button>
                    </div>

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
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDelete.open}
        title="Xác nhận xóa bài tập"
        message={`Bạn có chắc chắn muốn xóa bài ${confirmDelete.quizIdx !== null ? confirmDelete.quizIdx + 1 : ''} không?\nHành động này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
        onConfirm={handleDeleteQuiz}
        onCancel={handleCancelDelete}
      />
    </div>
  )
}

export default EditQuizPage