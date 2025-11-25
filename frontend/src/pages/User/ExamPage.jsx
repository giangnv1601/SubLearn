import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Check, X } from 'lucide-react'
import { useSearchParams, useNavigate, useParams } from 'react-router-dom'
import { fetchQuizzes, submitResultApi } from '@/api'
import { toLabel, toIndex } from '@/utils/helpers'
import { toast } from 'sonner'

const TYPE_COLOR = {
  reading: 'bg-emerald-700',
  dialogue_reordering: 'bg-indigo-700',
  translation: 'bg-amber-700',
  equivalent: 'bg-rose-700',
}

const Chip = ({ children, className = '' }) => (
  <span className={`inline-flex items-center px-2 py-0.5 text-xs rounded ${className}`}>{children}</span>
)

// Phẳng hoá mảng docs thành mảng câu hỏi độc lập { docIndex, qIndex, doc, q }
const composeExamFromDocs = (docs = []) =>
  docs.flatMap((doc, di) => (doc.questions || []).map((q, qi) => ({ docIndex: di, qIndex: qi, doc, q })))

export default function ExamPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const movieId = searchParams.get('movieId') || ''
  const type = searchParams.get('type') || ''

  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      if (!movieId || !type) {
        setError('Thiếu movieId hoặc quiz type')
        return
      }
      setLoading(true)
      setError(null)
      try {
        const res = await fetchQuizzes({ movie_id: movieId, quiz_type: type })
        const items = Array.isArray(res) ? res : (res?.data ?? [])
        if (!mounted) return

        // Chuẩn hóa dữ liệu từ BE
        const mapped = (items || []).map((it) => ({
          id: it._id ?? it.id ?? undefined,
          movieId: it.movieId ?? movieId,
          quizType: it.quizType ?? type,
          passage: it.passage ?? '',
          questions: (it.questions || []).map((q) => ({
            question: q.question ?? '',
            answer: toIndex(q.answer),
            explanation: q.explanation ?? '',
            quote: q.quote ?? '',
            options: (q.options || []).map((op, idx) => {
              if (!op) {
                return { label: toLabel(idx), content: '' }
              }
              if (typeof op === 'string') {
                return { label: toLabel(idx), content: op.trim() }
              }
              return {
                label: op.label ?? toLabel(idx),
                content: (op.content ?? op.text ?? '').toString().trim()
              }
            })
          }))
        }))
        console.log('Loaded exam docs:', mapped)
        setDocs(mapped)
      } catch (e) {
        if (!mounted) return
        setError(e?.response?.data?.message || e?.message || 'Lỗi khi tải quiz')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => { mounted = false }
  }, [movieId, type])

  const EXAM_ITEMS = useMemo(() => composeExamFromDocs(docs), [docs])

  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState({})

  useEffect(() => {
    setCurrent(0)
    setAnswers({})
    setSubmitted(false)
    setScore(0)
  }, [docs])

  const total = EXAM_ITEMS.length
  const item = EXAM_ITEMS[current]
  const q = item?.q
  const doc = item?.doc

  const setAnswer = (idx, optIdx) => setAnswers(p => ({ ...p, [idx]: optIdx }))
  const next = () => setCurrent(i => Math.min(i + 1, total - 1))
  const prev = () => setCurrent(i => Math.max(i - 1, 0))

  const answeredCount = Object.keys(answers).length
  const canSubmit = total > 0 && answeredCount === total && !submitted

  const getCorrectIndex = useCallback((question) => {
    if (!question) return undefined
    if (Number.isInteger(question.answer)) return question.answer
    return undefined
  }, [])

  const onSubmit = useCallback(async () => {
    if (!canSubmit) return

    let correct = 0
    EXAM_ITEMS.forEach((it, i) => {
      const correctIdx = getCorrectIndex(it.q)
      if (correctIdx !== undefined && answers[i] === correctIdx) correct += 1
    })

    const totalQuestions = EXAM_ITEMS.length
    const incorrectCount = totalQuestions - correct
    const accuracy = Number(((correct / totalQuestions) * 100).toFixed(2))

    setScore(correct)
    setSubmitted(true)

    try {
      const quizId = docs[0]?.id
      if (!quizId) {
        console.warn('Missing quizId from docs[0]')
        toast.error('Không xác định được quizId để lưu kết quả')
        return
      }

      await submitResultApi({
        quizId,
        correctCount: correct,
        incorrectCount,
        totalQuestions,
        accuracy
      })

      toast.success('Đã lưu kết quả bài thi')
    } catch (err) {
      console.error('submit result error:', err)
      toast.error(err?.response?.data?.message || 'Lỗi khi lưu kết quả')
    }
  }, [canSubmit, EXAM_ITEMS, answers, getCorrectIndex, docs])


  if (loading) {
    return <div className="max-w-[1000px] mx-auto px-4 py-6">Loading exam...</div>
  }

  if (error) {
    return (
      <div className="max-w-[1000px] mx-auto px-4 py-6">
        <div className="text-red-400 mb-4">{error}</div>
      </div>
    )
  }

  if (!EXAM_ITEMS.length) {
    return (
      <div className="max-w-[1000px] mx-auto px-4 py-6">
        <div className="text-gray-400 mb-4">Không có bài thi cho lựa chọn này.</div>
      </div>
    )
  }

  return (
    <div className="max-w-[1000px] mx-auto px-4 py-6">
      {/* Header (kept simple) */}
      <div className="mb-4">
        <h1 className="text-2xl font-semibold text-[#E4D161]">Exam</h1>
        <div className="flex items-center gap-3 text-sm text-white/80 mt-2">
          <Chip className={`${TYPE_COLOR[doc?.quizType || type] || 'bg-gray-700'}`}>{doc?.quizType || type}</Chip>
          {doc?.movieTitle && <span className="font-medium">{doc.movieTitle}</span>}
          {submitted && (
            <span className="ml-auto text-sm text-emerald-400">
              Score: {score}/{total} ({((score / total) * 100).toFixed(1)}%)
            </span>
          )}
        </div>
      </div>

      {/* Main box */}
      <div className="bg-gray-900/40 rounded-lg p-4">
        <div className="text-sm text-white/70 mb-3">Question <span className="font-medium text-white/90">{current + 1}</span> / {total}</div>

        {/* Passage */}
        {doc?.passage && (
          <div className="rounded border border-white/10 bg-white/5 p-3 text-white/90 leading-relaxed whitespace-pre-line mb-4">
            {doc.passage}
          </div>
        )}
        
        {/* Question */}
        <div className="text-white/90 font-medium mb-3">{q?.question}</div>

        {/* Options */}
        <div className="grid gap-2">
          {q?.options?.map((opt, idx) => {
            const selected = answers[current] === idx
            const correctIdx = getCorrectIndex(q)
            const isCorrect = submitted && correctIdx === idx
            const isWrongChoice = submitted && selected && correctIdx !== undefined && idx !== correctIdx
            const base = 'flex items-start gap-3 rounded border border-white/10 p-2 cursor-pointer hover:bg-white/5'
            const stateCls = submitted
              ? isCorrect ? ' ring-1 ring-emerald-500 bg-emerald-600/10' : (isWrongChoice ? ' ring-1 ring-rose-500 bg-rose-600/10' : '')
              : (selected ? ' ring-1 ring-blue-500' : '')
            return (
              <label key={idx} className={`${base}${stateCls}`}>
                <input type="radio" name={`q-${current}`} className="accent-blue-600 mt-0.5" checked={selected} onChange={() => !submitted && setAnswer(current, idx)} />
                <span className="text-xs font-medium text-white/80 w-5 leading-6 select-none">{opt.label}</span>
                <span className="text-sm text-white/90 whitespace-pre-line flex-1">{opt.content}</span>
                {submitted && isCorrect && <Check className="w-4 h-4 text-emerald-400 mt-0.5" />}
                {submitted && isWrongChoice && <X className="w-4 h-4 text-rose-400 mt-0.5" />}
              </label>
            )
          })}
        </div>

        {/* Explanation and Quote */}
        {submitted && (q?.explanation || q?.quote) && (
          <div className="text-sm text-white/80 bg-white/5 border border-white/10 rounded p-3 my-4 space-y-2">
            {q.explanation && <div className="text-white/90"><span className="font-medium text-white/70">Giải thích:</span> {q.explanation}</div>}
            {q.quote && <div className="text-white/90"><span className="font-medium text-white/70">Trích dẫn:</span> <span>{q.quote}</span></div>}
          </div>
        )}

        {/* Navigation */}
        <div className="flex flex-col items-center gap-3 mt-6">
          {/* main pager row */}
          <div className="flex items-center gap-6">
            <button
              onClick={prev}
              disabled={current === 0}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-md border transition-colors duration-150 ${
                current === 0
                  ? 'bg-gray-800/50 text-gray-400 border-gray-800 cursor-not-allowed'
                  : 'bg-white/5 text-white border-white/10 hover:bg-white/8'
              }`}
              title="Previous question"
              aria-label="Previous question"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="ml-1">Prev</span>
            </button>

            <div className="flex items-center gap-2">
              {Array.from({ length: total }).map((_, i) => {
                const correctIdx = getCorrectIndex(EXAM_ITEMS[i].q)
                const answered = answers[i] !== undefined
                const isCorrect = submitted && correctIdx !== undefined && answers[i] === correctIdx
                const isWrong = submitted && correctIdx !== undefined && answers[i] !== correctIdx
                const isCurrent = i === current

                // smoother transform + highlight for current
                const base = 'w-8 h-8 rounded-full text-[12px] flex items-center justify-center border transform transition-all duration-150'
                const stateCls = submitted
                  ? (isCorrect ? ' bg-emerald-600 text-white border-emerald-600' : (isWrong ? ' bg-rose-600 text-white border-rose-600' : ' bg-transparent text-white/70 border-white/10'))
                  : (answered ? ' bg-blue-600 text-white border-blue-600' : ' bg-transparent text-white/70 border-white/10')
                
                const currentCls = isCurrent ? ' scale-110 font-semibold ring-2 ring-white/10 shadow-lg z-10 border-blue-600' : ''

                return (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className={`${base} ${stateCls} ${currentCls}`}
                    aria-label={`Go to question ${i + 1}`}
                    aria-current={isCurrent ? 'true' : undefined}
                  >
                    {i + 1}
                  </button>
                )
              })}
            </div>

            <button
              onClick={next}
              disabled={current === total - 1}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-md border transition-colors duration-150 ${
                current === total - 1
                  ? 'bg-gray-800/50 text-gray-400 border-gray-800 cursor-not-allowed'
                  : 'bg-white/5 text-white border-white/10 hover:bg-white/8'
              }`}
              title="Next question"
              aria-label="Next question"
            >
              <span className="mr-1">Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* actions row */}
          <div className="flex items-center gap-3 text-sm">
            <div className="text-xs text-white/60 mr-2">Answered {Object.keys(answers).length}/{total}</div>
            {!submitted ? (
              <button
                type="button"
                disabled={!canSubmit}
                onClick={onSubmit}
                className="px-4 py-2 rounded text-white bg-amber-600 disabled:opacity-60"
              >
                Submit
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate(-1)}
                aria-label="Back"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-white/10 bg-transparent text-white hover:bg-gray-700 hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              >
                Back
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
