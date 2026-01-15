import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { fetchQuizByMovieAndTypeQuizApi } from "@/api"
import { Check, X, BookOpen, Quote } from 'lucide-react'

const PracticePage = () => {
  const { movieId, quizType } = useParams()
  const [quizzes, setQuizzes] = useState([])
  const [userAnswers, setUserAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(true)

  const handleSelectAnswer = (quizIndex, questionIndex, selectedLabel) => {
    if (submitted) return
    setUserAnswers({
      ...userAnswers,
      [`${quizIndex}-${questionIndex}`]: selectedLabel
    })
  }

  const fetchQuizzes = async (movieId, quizType) => {
    setLoading(true)
    try {
      const res = await fetchQuizByMovieAndTypeQuizApi(movieId, quizType)
      console.log('Fetched quizzes:', res)
      setQuizzes(res || [])
    } catch (error) {
      console.error("Error fetching quizzes:", error)
      setQuizzes([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (movieId && quizType) {
      fetchQuizzes(movieId, quizType)
    }
  }, [movieId, quizType])

  const handleSubmit = () => {
    setSubmitted(true)
  }

  const handleReset = () => {
    setUserAnswers({})
    setSubmitted(false)
  }

  const calculateScore = () => {
    if (quizzes.length === 0) return { correct: 0, total: 0 }
    let correct = 0
    let total = 0
    
    quizzes.forEach((quiz, quizIdx) => {
      quiz.questions.forEach((q, qIdx) => {
        total++
        if (userAnswers[`${quizIdx}-${qIdx}`] === q.answer) {
          correct++
        }
      })
    })
    
    return { correct, total }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#2E4863] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#E4D161] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-300">Đang tải bài tập...</p>
        </div>
      </div>
    )
  }

  if (quizzes.length === 0) {
    return (
      <div className="min-h-screen bg-[#2E4863] text-white flex items-center justify-center">
        <p className="text-gray-300">Không có bài tập nào.</p>
      </div>
    )
  }

  const { correct, total } = calculateScore()
  const currentQuizType = quizzes[0]?.quizType
  const isReading = currentQuizType === 'reading'
  const isDialogueReordering = currentQuizType === 'dialogue_reordering'

  return (
    <div className="min-h-screen bg-[#2E4863] text-white">
      <div className="max-w-[900px] mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-[#E4D161]">
              {isReading && 'Reading Comprehension'}
              {currentQuizType === 'translation' && 'Translation Practice'}
              {currentQuizType === 'equivalent' && 'Equivalent Sentences'}
              {isDialogueReordering && 'Dialogue Reordering'}
            </h1>
            {submitted && (
              <div className="bg-[#1B2A36] px-3 py-1.5 rounded-lg border border-[#E4D161]">
                <p className="text-sm font-semibold">
                  Điểm: <span className="text-[#E4D161]">{correct}/{total}</span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* All Quizzes */}
        <div className="space-y-6">
          {quizzes.map((quiz, quizIdx) => (
            <div key={quiz._id} className="space-y-4">
              {/* Passage - chỉ hiện với Reading và Dialogue Reordering */}
              {quiz.passage && (
                <div className="bg-[#1B2A36] p-4 rounded-lg border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-4 h-4 text-[#E4D161]" />
                    <h2 className="text-base font-semibold text-[#E4D161]">
                      {isDialogueReordering ? `Dialogue ${quizIdx + 1}` : `Passage ${quizIdx + 1}`}
                    </h2>
                  </div>
                  <div className="text-gray-200 text-sm leading-relaxed whitespace-pre-line">
                    {quiz.passage}
                  </div>
                </div>
              )}

              {/* Questions */}
              {quiz.questions.map((question, qIdx) => {
                const userAnswer = userAnswers[`${quizIdx}-${qIdx}`]
                const isCorrect = userAnswer === question.answer
                const hasAnswered = userAnswer !== undefined

                return (
                  <div 
                    key={qIdx} 
                    className={`bg-[#1B2A36] p-4 rounded-lg border transition-all ${
                      submitted && hasAnswered
                        ? isCorrect 
                          ? 'border-green-500/50 bg-green-500/5' 
                          : 'border-red-500/50 bg-red-500/5'
                        : 'border-white/10'
                    }`}
                  >
                    {/* Question */}
                    <div className="mb-3">
                      <p className="text-base font-medium text-white">
                        <span className="text-[#E4D161] mr-2">
                          {quizzes.reduce((acc, q, idx) => {
                            if (idx < quizIdx) return acc + q.questions.length
                            return acc
                          }, 0) + qIdx + 1}.
                        </span>
                        {question.question}
                      </p>
                    </div>

                    {/* Options */}
                    <div className="space-y-2 mb-3">
                      {question.options.map((option) => {
                        const optionLabel = typeof option === 'string' 
                          ? option.charAt(0) 
                          : option.label
                        const optionContent = typeof option === 'string'
                          ? option.substring(3)
                          : option.content

                        const isSelected = userAnswer === optionLabel
                        const isCorrectOption = question.answer === optionLabel
                        
                        let optionClass = 'bg-[#14202A] border-gray-600 hover:border-[#E4D161]'
                        if (submitted) {
                          if (isCorrectOption) {
                            optionClass = 'bg-green-500/10 border-green-500'
                          } else if (isSelected && !isCorrect) {
                            optionClass = 'bg-red-500/10 border-red-500'
                          }
                        } else if (isSelected) {
                          optionClass = 'bg-[#E4D161]/20 border-[#E4D161]'
                        }

                        return (
                          <button
                            key={optionLabel}
                            onClick={() => handleSelectAnswer(quizIdx, qIdx, optionLabel)}
                            disabled={submitted}
                            className={`w-full text-left p-3 rounded-lg border-2 transition-all ${optionClass} ${
                              submitted ? 'cursor-default' : 'cursor-pointer'
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <span className={`font-bold text-sm ${
                                submitted && isCorrectOption ? 'text-green-400' :
                                submitted && isSelected && !isCorrect ? 'text-red-400' :
                                isSelected ? 'text-[#E4D161]' : 'text-gray-400'
                              }`}>
                                {optionLabel}.
                              </span>
                              <span className="flex-1 text-gray-200 text-sm">
                                {optionContent}
                              </span>
                              {submitted && (
                                <>
                                  {isCorrectOption && (
                                    <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                                  )}
                                  {isSelected && !isCorrect && (
                                    <X className="w-4 h-4 text-red-400 flex-shrink-0" />
                                  )}
                                </>
                              )}
                            </div>
                          </button>
                        )
                      })}
                    </div>

                    {/* Result info - chỉ hiện sau khi submit */}
                    {submitted && hasAnswered && (
                      <div className={`mt-3 p-3 rounded-lg ${
                        isCorrect ? 'bg-green-500/10' : 'bg-red-500/10'
                      }`}>
                        <div className="flex items-center gap-2 mb-2">
                          {isCorrect ? (
                            <>
                              <Check className="w-4 h-4 text-green-400" />
                              <span className="font-semibold text-green-400 text-sm">Chính xác!</span>
                            </>
                          ) : (
                            <>
                              <X className="w-4 h-4 text-red-400" />
                              <span className="font-semibold text-red-400 text-sm">
                                Sai rồi! Đáp án đúng là: {question.answer}
                              </span>
                            </>
                          )}
                        </div>

                        {/* Explanation */}
                        {question.explanation && (
                          <div className="mt-2 text-xs text-gray-300">
                            <p className="font-semibold text-[#E4D161] mb-1">Giải thích:</p>
                            <p>{question.explanation}</p>
                          </div>
                        )}

                        {/* Quote */}
                        {question.quote && (
                          <div className="mt-2 p-2 bg-[#0D1419] rounded border-l-4 border-blue-400">
                            <div className="flex items-start gap-2">
                              <Quote className="w-3 h-3 text-blue-400 flex-shrink-0 mt-1" />
                              <p className="text-xs text-gray-400 italic">"{question.quote}"</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-4 justify-center">
          {!submitted ? (
            <button
              onClick={handleSubmit}
              disabled={Object.keys(userAnswers).length === 0}
              className="px-6 py-2 bg-[#E4D161] text-[#2E4863] font-semibold rounded-lg hover:bg-[#d4c151] disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors text-sm"
            >
              Nộp bài
            </button>
          ) : (
            <button
              onClick={handleReset}
              className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors text-sm"
            >
              Làm lại
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default PracticePage