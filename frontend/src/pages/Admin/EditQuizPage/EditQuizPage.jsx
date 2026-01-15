import React, { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router'
import { fetchQuizByMovieAndTypeQuizApi } from '@/api'

// Fake data for testing
const FAKE_QUIZZES = [
    {
        "passage": null,
        "questions": [
            {
                "question": "Dịch câu sau sang tiếng Việt: 'The conflict reached a bloody and decisive conclusion, with Konrad I of the House of Barlow emerging victorious as ruler, his power absolute.'",
                "options": [
                    "A. Cuộc xung đột đã kết thúc đẫm máu và quyết định, với Konrad I của nhà Barlow trở thành người chiến thắng và cai trị, quyền lực của ông là tuyệt đối.",
                    "B. Cuộc xung đột kết thúc đẫm máu và quyết định, Konrad I của nhà Barlow đang chiến thắng với tư cách là người cai trị, quyền lực của ông ấy sẽ tuyệt đối.",
                    "C. Cuộc xung đột sẽ kết thúc đẫm máu và quyết định, Konrad I của nhà Barlow sẽ là người chiến thắng, quyền lực của ông ấy là tuyệt đối.",
                    "D. Cuộc xung đột đã kết thúc một cách yên bình, với Konrad I của nhà Barlow thất bại, quyền lực của ông ấy là giới hạn."
                ],
                "answer": "A",
                "explanation": "Đáp án A đúng về thì quá khứ, nghĩa và cấu trúc bị động/kết hợp với cụm từ 'with...emerging...'. B sai thì (hiện tại tiếp diễn và tương lai đơn), C sai thì và ý nghĩa, D sai nghĩa hoàn toàn.",
                "quote": "The conflict reached a bloody and decisive conclusion, with Konrad I of the House of Barlow emerging victorious as ruler, his power absolute."
            }
        ]
    },
    {
        "passage": null,
        "questions": [
            {
                "question": "Dịch câu sau sang tiếng Việt: 'Children run and recoil in terror at the very mention of her.'",
                "options": [
                    "A. Trẻ em chạy và co rúm lại vì sợ hãi ngay khi nghe nhắc đến tên bà ấy.",
                    "B. Trẻ em đã chạy và co rúm lại vì sợ hãi khi nhìn thấy bà ấy.",
                    "C. Trẻ em sẽ chạy và co rúm lại vì sợ hãi mỗi lần gặp bà ấy.",
                    "D. Trẻ em chạy và nhảy lên vì vui sướng mỗi khi nghe nhắc đến bà ấy."
                ],
                "answer": "A",
                "explanation": "Câu gốc thì hiện tại đơn mô tả thói quen/phản xạ; A dịch sát nghĩa và đúng thì. B sai thì quá khứ và nghĩa ('nhìn thấy' thay vì 'nghe nhắc đến'), C sai thì tương lai và nghĩa, D sai nghĩa hoàn toàn.",
                "quote": "Children run and recoil in terror at the very mention of her."
            }
        ]
    },
    {
        "passage": null,
        "questions": [
            {
                "question": "Dịch câu sau sang tiếng Việt: 'If we rush in with violence, we do not stand a chance.'",
                "options": [
                    "A. Nếu chúng ta lao vào một cách bạo lực, chúng ta sẽ không có cơ hội nào.",
                    "B. Nếu chúng ta đã lao vào một cách bạo lực, chúng ta không có cơ hội nào.",
                    "C. Nếu chúng ta lao vào một cách bạo lực, chúng ta đang có cơ hội.",
                    "D. Nếu chúng ta lao vào một cách bạo lực, chúng ta sẽ thắng dễ dàng."
                ],
                "answer": "A",
                "explanation": "Câu điều kiện loại 1, diễn đạt khả năng không có thật ở tương lai. A đúng về thì, cấu trúc và nghĩa. B sai thì (quá khứ), C sai nghĩa (đang có cơ hội), D sai nghĩa hoàn toàn.",
                "quote": "If we rush in with violence, we do not stand a chance."
            }
        ]
    }
]

const EditQuizPage = () => {
  const navigate = useNavigate()
  const [quizzes, setQuizzes] = useState(FAKE_QUIZZES)
  const [editingQuiz, setEditingQuiz] = useState(null)
  const [loading, setLoading] = useState(false)

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

  // Hàm xóa bài quiz
  const handleDeleteQuiz = (quizIdx) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài tập này không?')) return
    const updated = [...quizzes]
    updated.splice(quizIdx, 1)
    setQuizzes(updated)
  }

  // Hàm chuẩn hóa payload để gửi API
  const preparePayload = () => {
    return quizzes.map((quiz) => ({
      passage: quiz.passage || null,
      questions: quiz.questions.map((q) => ({
        question: q.question || '',
        answer: q.answer || 'A',
        explanation: q.explanation || '',
        quote: q.quote || '',
        options: q.options.map((opt, idx) => ({
          label: String.fromCharCode(65 + idx), // A, B, C, D
          content: opt.replace(/^[A-D]\.\s*/, '') // Xóa prefix A. B. C. D. nếu có
        }))
      }))
    }))
  }

  // Hàm lưu tất cả thay đổi
  const handleSaveAll = async () => {
    setLoading(true)
    

    const payload = preparePayload()

    console.log(payload)

    
    // TODO: Call API to update quizzes
    // const res = await updateQuizzesApi(movieId, quizType, payload)
    
    setTimeout(() => {
      setLoading(false)
      alert('Lưu thành công!')
    }, 1000)
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

          <button
            onClick={handleSaveAll}
            disabled={loading || quizzes.length === 0}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-md font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Đang lưu...' : `Lưu thay đổi (${quizzes.length})`}
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          <div className="bg-[#1B2A36] p-4 rounded-md border border-white/10 min-h-[400px]">
            <h2 className="text-lg font-semibold mb-4">Danh sách bài tập</h2>
            
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#E4D161] mb-4"></div>
                <p className="text-gray-300 font-medium">Đang lưu bài tập...</p>
              </div>
            ) : quizzes.length > 0 ? (
              <div className="space-y-4">
                {quizzes.map((quiz, quizIdx) => (
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
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditQuizPage