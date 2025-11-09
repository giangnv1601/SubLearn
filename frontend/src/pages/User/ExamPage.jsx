import React, { useState, useMemo, useEffect, useCallback } from "react"
import { Clock, ChevronLeft, ChevronRight, Check, X } from "lucide-react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { fetchQuizzes, submitExamResult } from '../../api'

const TYPE_COLOR = {
  reading: "bg-emerald-700",
  dialogue_reordering: "bg-indigo-700",
  translation: "bg-amber-700",
  equivalent: "bg-rose-700",
}

const Chip = ({ children, className = "" }) => (
  <span className={`inline-flex items-center px-2 py-0.5 text-xs rounded ${className}`}>{children}</span>
)

const Section = ({ title, right, children }) => (
  <div className="bg-gray-900/40 rounded-lg p-4">
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-lg font-semibold text-white/90">{title}</h2>
      {right}
    </div>
    {children}
  </div>
)

const MAX_QUESTIONS = 10

// Normalize options to objects { label, content }
const normalizeOptions = (opts = []) => {
  return opts.map((op, idx) => {
    if (!op) return { label: String.fromCharCode(65 + idx), content: '' }
    if (typeof op === 'string') return { label: String.fromCharCode(65 + idx), content: op }
    // object shape
    return { label: op.label ?? String.fromCharCode(65 + idx), content: op.content ?? op?.text ?? '' }
  })
}

// Fisher-Yates shuffle (in-place)
const shuffleArray = (arr) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

const composeExamFromDocs = (docs, maxQuestions = MAX_QUESTIONS) => {
  const flat = []
  docs.forEach((doc, di) => {
    ;(doc.questions || []).forEach((q, qi) => {
      flat.push({ docIndex: di, qIndex: qi, doc, q })
    })
  })
  if (flat.length === 0) return []

  // shuffle questions so order is random each time
  const shuffled = shuffleArray([...flat])

  // if there are fewer than maxQuestions, repeat (varianting) after shuffle
  if (shuffled.length >= maxQuestions) return shuffled.slice(0, maxQuestions)

  const result = [...shuffled]
  let i = 0
  while (result.length < maxQuestions) {
    const item = shuffled[i % shuffled.length]
    result.push({ ...item, q: { ...item.q, question: item.q.question + ` (v${Math.floor(result.length / shuffled.length) + 2})` } })
    i++
  }
  return result
}

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
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saveOk, setSaveOk] = useState(false)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      if (!movieId || !type) {
        setError('Missing movieId or type')
        return
      }
      setLoading(true)
      setError(null)
      try {
        const data = await fetchQuizzes({ movie_id: movieId, quiz_type: type })
        const items = Array.isArray(data) ? data : (data?.data || [])
        if (!mounted) return

        // Map backend quiz items -> docs format used by UI
        const mappedDocs = (items || []).map((it) => ({
          movieId: it.movieId ?? movieId,
          quizType: it.quizType ?? type,
          movieTitle: it.movieTitle ?? it.title ?? '',
          passage: it.passage ?? it.passageText ?? '',
          questions: (it.questions || []).map((q) => ({
            // normalize question fields
            question: q.question ?? q.prompt ?? '',
            options: normalizeOptions(q.options || []),
            // support answerIndex or answerLetter
            answerIndex: Number.isInteger(q.answerIndex) ? q.answerIndex : (typeof q.answerLetter === 'string' ? q.answerLetter.charCodeAt(0) - 65 : undefined),
            answerLetter: q.answerLetter ?? (Number.isInteger(q.answerIndex) ? String.fromCharCode(65 + q.answerIndex) : undefined),
            explanation: q.explanation ?? '',
            quote: q.quote ?? ''
          }))
        }))

        // if backend returns per-question docs (no passage grouping), group them into one doc
        let finalDocs = mappedDocs
        if (finalDocs.length === 0 && items.length > 0) {
          // fallback: build a single doc from items
          finalDocs = [{
            movieId,
            quizType: type,
            movieTitle: items[0]?.movieTitle || '',
            passage: items[0]?.passage || '',
            questions: items.flatMap(it => it.questions || [])
          }]
        }

        setDocs(finalDocs)
      } catch (e) {
        if (!mounted) return
        setError(e?.response?.data?.message || e?.message || 'Failed to load exam')
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [movieId, type])

  // compose exam items (fixed length)
  const EXAM_ITEMS = useMemo(() => composeExamFromDocs(docs), [docs])

  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState({}) // { [index]: optionIndex }

  useEffect(() => {
    // reset when docs change
    setCurrent(0)
    setAnswers({})
    setSubmitted(false)
    setScore(0)
    setSaving(false)
    setSaveError('')
    setSaveOk(false)
  }, [docs])

  const total = EXAM_ITEMS.length
  const item = EXAM_ITEMS[current]
  const q = item?.q
  const doc = item?.doc

  const setAnswer = (idx, optIdx) => setAnswers((p) => ({ ...p, [idx]: optIdx }))
  const next = () => setCurrent((i) => Math.min(i + 1, total - 1))
  const prev = () => setCurrent((i) => Math.max(i - 1, 0))

  const answeredCount = Object.keys(answers).length
  const canSubmit = total > 0 && answeredCount === total && !submitted

  const getCorrectIndex = useCallback((question) => {
    if (Number.isInteger(question?.answerIndex)) return question.answerIndex
    if (typeof question?.answerLetter === 'string') return question.answerLetter.charCodeAt(0) - 65
    return undefined
  }, [])

  const onSubmit = useCallback(async () => {
    if (!canSubmit) return
    let correct = 0
    EXAM_ITEMS.forEach((it, i) => {
      const correctIdx = getCorrectIndex(it.q)
      if (correctIdx !== undefined && answers[i] === correctIdx) correct += 1
    })
    setScore(correct)
    setSubmitted(true)

    // Save result
    try {
      setSaving(true)
      setSaveError('')
      setSaveOk(false)
      const items = EXAM_ITEMS.map((it, i) => {
        const correctIdx = getCorrectIndex(it.q)
        return {
          question: it.q.question,
          selectedIndex: answers[i],
          correctIndex: correctIdx,
          isCorrect: answers[i] === correctIdx,
        }
      })
      const payload = {
        movieId: doc?.movieId || movieId,
        quizType: doc?.quizType || type,
        movieTitle: doc?.movieTitle || '',
        totalQuestions: EXAM_ITEMS.length,
        correctCount: correct,
        score: correct, // raw count; backend can compute percentage if needed
        answers: items,
        submittedAt: new Date().toISOString(),
      }
      await submitExamResult(payload)
      setSaveOk(true)
    } catch (e) {
      setSaveError(e?.response?.data?.message || e?.message || 'Lưu kết quả thất bại')
    } finally {
      setSaving(false)
    }
  }, [EXAM_ITEMS, answers, canSubmit, getCorrectIndex, doc, movieId, type])

  const goToFirstIncorrect = useCallback(() => {
    for (let i = 0; i < total; i++) {
      const correctIdx = getCorrectIndex(EXAM_ITEMS[i].q)
      if (correctIdx !== undefined && answers[i] !== correctIdx) {
        setCurrent(i)
        return
      }
    }
    setCurrent(0)
  }, [EXAM_ITEMS, answers, total, getCorrectIndex])

  if (loading) {
    return <div className="max-w-[1000px] mx-auto px-4 py-6">Loading exam...</div>
  }

  if (error) {
    return (
      <div className="max-w-[1000px] mx-auto px-4 py-6">
        <div className="text-red-400 mb-4">{error}</div>
        <button onClick={() => navigate(-1)} className="px-3 py-1 bg-gray-800 rounded">Back</button>
      </div>
    )
  }

  if (!EXAM_ITEMS.length) {
    return (
      <div className="max-w-[1000px] mx-auto px-4 py-6">
        <div className="text-gray-400 mb-4">Không có bài thi cho lựa chọn này.</div>
        <button onClick={() => navigate(-1)} className="px-3 py-1 bg-gray-800 rounded">Back</button>
      </div>
    )
  }

  return (
    <div className="max-w-[1000px] mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-[#E4D161]">Exam</h1>
          <div className="flex flex-wrap items-center gap-2 text-white/80 text-sm">
            <Chip className={`${TYPE_COLOR[doc?.quizType || type] || "bg-gray-700"}`}>
              {doc?.quizType || type}
            </Chip>
            {doc?.movieTitle && (
              <>
                <span className="opacity-80">Movie:</span>
                <span className="font-medium">{doc.movieTitle}</span>
              </>
            )}
            {submitted && (
              <>
                <Chip className="bg-emerald-700/80">Score: {score}/{total}</Chip>
                {saving && <Chip className="bg-white/20">Saving...</Chip>}
                {/* {!saving && saveOk && <Chip className="bg-emerald-700/60">Saved</Chip>}
                {!saving && !!saveError && <Chip className="bg-rose-700/70">Save failed</Chip>} */}
              </>
            )}
          </div>
        </div>

        {/* Static time display for UI only */}
        {/* <div className="flex items-center gap-1 text-white/90 bg-gray-900/60 rounded px-2 py-1">
          <Clock className="w-4 h-4" />
          <span className="tabular-nums">10:00</span>
        </div> */}
      </div>

      <div className="space-y-4">
        <Section
          title={doc?.movieTitle || ""}
          right={
            <div className="text-sm text-white/70">
              Question <span className="font-medium text-white/90">{current + 1}</span> / {total}
            </div>
          }
        >
          {doc?.passage && (
            <div className="rounded border border-white/10 bg-white/5 p-3 text-white/90 leading-relaxed whitespace-pre-line">
              {doc.passage}
            </div>
          )}

          {/* MCQ */}
          <div className="mt-4 space-y-3">
            <div className="text-white/90 font-medium">{q?.question}</div>
            <div className="grid gap-2">
              {q?.options?.map((opt, idx) => {
                const selected = answers[current] === idx
                const correctIdx = getCorrectIndex(q)
                const isCorrect = submitted && correctIdx === idx
                const isWrongChoice = submitted && selected && correctIdx !== undefined && idx !== correctIdx
                const base = "flex items-start gap-3 rounded border border-white/10 p-2 cursor-pointer hover:bg-white/5"
                const stateCls = submitted
                  ? isCorrect
                    ? " ring-1 ring-emerald-500 bg-emerald-600/10"
                    : isWrongChoice
                      ? " ring-1 ring-rose-500 bg-rose-600/10"
                      : ""
                  : (selected ? " ring-1 ring-blue-500" : "")
                return (
                  <label
                    key={idx}
                    className={`${base}${stateCls}`}
                  >
                    <input
                      type="radio"
                      name={`q-${current}`}
                      className="accent-blue-600 mt-0.5"
                      checked={selected}
                      onChange={() => !submitted && setAnswer(current, idx)}
                    />
                    <span className="text-xs font-semibold text-white/80 w-5 leading-6 select-none">{opt.label}</span>
                    <span className="text-sm text-white/90 whitespace-pre-line flex-1">{opt.content}</span>
                    {submitted && isCorrect && <Check className="w-4 h-4 text-emerald-400 mt-0.5" />}
                    {submitted && isWrongChoice && <X className="w-4 h-4 text-rose-400 mt-0.5" />}
                  </label>
                )})}
            </div>
            {submitted && q?.explanation && (
              <div className="text-sm text-white/80 bg-white/5 border border-white/10 rounded p-2">
                <span className="font-medium text-white/90">Giải thích: </span>{q.explanation}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-4">
            <button
              type="button"
              onClick={prev}
              disabled={current === 0}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded bg-gray-700 text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 ${current === 0 ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>

            <div className="flex items-center gap-2 flex-wrap">
              {Array.from({ length: total }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-7 h-7 rounded-full text-[12px] font-medium transition flex items-center justify-center border ${i === current ? "bg-blue-600 text-white border-blue-600" : submitted ? (() => {
                      const correctIdx = getCorrectIndex(EXAM_ITEMS[i].q)
                      const isCorrect = answers[i] === correctIdx
                      return isCorrect ? "bg-emerald-600 text-white border-emerald-600" : "bg-rose-600 text-white border-rose-600"
                    })() : answers[i] !== undefined ? "bg-blue-600 text-white border-blue-600" : "bg-transparent text-white/80 border-white/20"}`}
                  aria-label={`Go to question ${i + 1}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={next}
              disabled={current === total - 1}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded bg-gray-700 text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 ${current === total - 1 ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Footer controls */}
          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="text-xs text-white/60">
              Answered {Object.keys(answers).length}/{total}
            </div>
            <div className="flex items-center gap-2">
              {submitted && (
                <>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    onClick={goToFirstIncorrect}
                  >
                    Review wrong
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 px-3 py-2 rounded bg-gray-700 text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    onClick={() => navigate(-1)}
                  >
                    Back
                  </button>
                </>
              )}
              {!submitted && (
                <button
                  type="button"
                  disabled={!canSubmit}
                  onClick={onSubmit}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded text-white shadow-sm ${canSubmit ? "bg-amber-600 hover:bg-amber-500" : "bg-amber-600 opacity-60 cursor-not-allowed"}`}
                  title={canSubmit ? "Submit your answers" : "Hãy trả lời tất cả câu hỏi"}
                >
                  Submit
                </button>
              )}
            </div>
          </div>
        </Section>
      </div>
    </div>
  )
}
