import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { fetchMoviesApi, fetchQuizzes, updateQuizApi, createQuizApi, deleteQuizApi } from '@/api'

const toLabel = (i) => ['A', 'B', 'C', 'D'][i] ?? 'A'
const toIndex = (ans) => {
  if (Number.isInteger(ans)) return ans
  const map = { A: 0, B: 1, C: 2, D: 3 }
  const k = String(ans || '').trim().toUpperCase()
  return map[k] ?? 0
}

const buildPayloads = (movieId, quizType, raw) => {
  const safe = Array.isArray(raw) ? raw : []
  return safe.map((item) => ({
    movieId: movieId,
    quizType: quizType,
    passage: item.passage ?? null,
    questions: (item.questions || []).map((q) => {
      const opts = (q.options || []).slice(0, 4)
      const ansIdx = toIndex(q.answer)
      return {
        question: q.question || '',
        answer: toLabel(ansIdx),
        explanation: q.explanation || '',
        quote: q.quote || '',
        options: opts.map((content, i) => ({ label: toLabel(i), content: String(content || '') }))
      }
    })
  }))
}

function OptionRow({ idx, value, isCorrect, onChange, onChooseCorrect, onRemove, canRemove }) {
  return (
    <div className="flex items-center gap-2">
      <input type="radio" checked={isCorrect} onChange={() => onChooseCorrect(idx)} />
      <span className="w-6 text-[#E4D161] font-semibold">{toLabel(idx)}.</span>
      <input
        value={value}
        onChange={(e) => onChange(idx, e.target.value)}
        className="flex-1 bg-[#0f1620] border border-white/10 rounded px-2 py-1 text-sm outline-none"
        placeholder={`Nội dung phương án ${toLabel(idx)}`}
      />
      {canRemove && (
        <button type="button" onClick={() => onRemove(idx)} className="text-xs px-2 py-1 rounded bg-red-600/80 hover:bg-red-600">
          Xóa
        </button>
      )}
    </div>
  )
}

function QuestionCard({ q, onUpdate, onDelete, displayIndex }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(() => ({
    question: q.question || '',
    options: Array.isArray(q.options) ? [...q.options] : ['', '', '', ''],
    answer: Number.isInteger(q.answer) ? q.answer : 0,
    explanation: q.explanation || '',
    quote: q.quote || ''
  }))

  useEffect(() => {
    setForm({
      question: q.question || '',
      options: Array.isArray(q.options) ? [...q.options] : ['', '', '', ''],
      answer: Number.isInteger(q.answer) ? q.answer : 0,
      explanation: q.explanation || '',
      quote: q.quote || ''
    })
    setEditing(false)
  }, [q])

  const setField = (k, v) => setForm((s) => ({ ...s, [k]: v }))
  const changeOption = (i, v) => setForm((s) => { const next = [...s.options]; next[i] = v; return { ...s, options: next } })
  const addOption = () => setForm((s) => (s.options.length >= 4 ? s : { ...s, options: [...s.options, ''] }))
  const removeOption = (i) => setForm((s) => { if (s.options.length <= 2) return s; const next = s.options.filter((_, idx) => idx !== i); let ans = s.answer; if (i === ans) ans = 0; if (i < ans) ans = Math.max(0, ans - 1); return { ...s, options: next, answer: ans } })

  const save = () => { onUpdate({ question: form.question.trim(), options: form.options.slice(0, 4).map((x) => String(x || '')), answer: form.answer, explanation: form.explanation, quote: form.quote }); setEditing(false) }
  const cancel = () => { setForm({ question: q.question || '', options: Array.isArray(q.options) ? [...q.options] : ['', '', '', ''], answer: Number.isInteger(q.answer) ? q.answer : 0, explanation: q.explanation || '', quote: q.quote || '' }); setEditing(false) }

  if (!editing) {
    return (
      <div className="bg-[#0f1620] rounded p-3 border border-white/10">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="font-medium"><span className="text-[#E4D161] mr-2">Q{displayIndex}.</span>{q.question || '(Chưa có nội dung câu hỏi)'}</div>
            {Array.isArray(q.options) && q.options.length > 0 && (
              <ul className="list-disc ml-6 mt-2 text-gray-200 space-y-1">
                {q.options.map((op, i) => (
                  <li key={i}>{op || <span className="opacity-50">(trống)</span>} {q.answer === i && <span className="text-emerald-400">(Correct)</span>}</li>
                ))}
              </ul>
            )}
            {(q.explanation || q.quote) && (
              <div className="mt-2 text-sm text-gray-300">
                {q.explanation && (<div><span className="text-gray-400">Explanation: </span>{q.explanation}</div>)}
                {q.quote && <div className="italic text-gray-400">Quote: {q.quote}</div>}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setEditing(true)} className="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20">Edit</button>
            <button type="button" onClick={onDelete} className="text-xs px-2 py-1 rounded bg-red-600/80 hover:bg-red-600">Delete</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#0f1620] rounded p-3 space-y-2 border border-white/10">
      <div className="text-[#E4D161] font-semibold">Q{displayIndex}</div>
      <textarea value={form.question} onChange={(e) => setField('question', e.target.value)} className="w-full bg-[#0b121a] border border-white/10 rounded p-2 text-sm outline-none" placeholder="Nội dung câu hỏi..." rows={2} />
      <div className="grid gap-2">
        {form.options.map((op, i) => (
          <OptionRow key={i} idx={i} value={op} isCorrect={form.answer === i} onChange={changeOption} onChooseCorrect={(idx) => setField('answer', idx)} onRemove={(idx) => removeOption(idx)} canRemove={form.options.length > 2} />
        ))}
      </div>
      {form.options.length < 4 && (<button type="button" onClick={addOption} className="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20">+ Thêm phương án</button>)}
      <div className="grid md:grid-cols-2 gap-2">
        <input value={form.explanation} onChange={(e) => setField('explanation', e.target.value)} className="bg-[#0b121a] border border-white/10 rounded px-2 py-1 text-sm outline-none" placeholder="Giải thích (tuỳ chọn)" />
        <input value={form.quote} onChange={(e) => setField('quote', e.target.value)} className="bg-[#0b121a] border border-white/10 rounded px-2 py-1 text-sm outline-none" placeholder="Quote (tuỳ chọn)" />
      </div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={cancel} className="px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 text-sm">Cancel</button>
        <button type="button" onClick={save} className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-sm">Save</button>
      </div>
    </div>
  )
}

const TypeLabel = ({ type }) => {
  const map = useMemo(() => ({
    reading: 'Reading',
    dialogue_reordering: 'Dialogue Reordering',
    translation: 'Translation (EN→VI options)',
    equivalent: 'Equivalent (VI→EN options)'
  }), [])
  return <>{map[type] || type}</>
}

export default function QuizEditorPage() {
  const { movieId, type } = useParams()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError('')
    ;(async () => {
      try {
        const moviesRes = await fetchMoviesApi()
        const quizzesRes = await fetchQuizzes({ movie_id: movieId, quiz_type: type })
        if (!mounted) return
        const movies = Array.isArray(moviesRes) ? moviesRes : (moviesRes?.data || moviesRes?.items || [])
        const mv = movies.find((m) => String(m._id || m.id) === String(movieId))
        setTitle(mv?.title || '')

        const items = Array.isArray(quizzesRes) ? quizzesRes : (quizzesRes?.data || [])
        const normalized = (Array.isArray(items) ? items : []).map((doc) => ({
          _id: doc._id,
          passage: doc.passage ?? '',
          questions: (doc.questions || []).map((q) => ({
            question: q.question || '',
            options: (q.options || []).map((op) => op?.content || ''),
            answer: Number.isInteger(q.answerIndex) ? q.answerIndex : toIndex(q.answerLetter),
            explanation: q.explanation || '',
            quote: q.quote || ''
          }))
        }))
        setResult(normalized)
      } catch {
        if (!mounted) return
        setResult([{ passage: '', questions: [] }])
      } finally {
        if (mounted) setLoading(false)
      }
    })()
     return () => { mounted = false }
   }, [movieId, type])

  const addQuestion = (quizIdx) => {
    const draft = { question: '', options: ['', '', '', ''], answer: 0, explanation: '', quote: '' }
    const next = [...(result || [])]
    next[quizIdx].questions.push(draft)
    setResult(next)
  }

  const deleteQuestion = (quizIdx, qIdx) => {
    const next = [...(result || [])]
    next[quizIdx].questions.splice(qIdx, 1)
    setResult(next)
  }

  const updateQuestion = (quizIdx, qIdx, nextQ) => {
    const next = [...(result || [])]
    next[quizIdx].questions[qIdx] = nextQ
    setResult(next)
  }

  const saveAll = async () => {
    try {
      setSaving(true)
      setError('')
      const payloads = buildPayloads(movieId, type, result)
      // Try update first when _id exists; fallback to create
      await Promise.all(
        (result || []).map(async (qz, idx) => {
          const p = payloads[idx]
          if (qz._id) {
            try {
              await updateQuizApi(qz._id, p)
              return
            } catch {
              // fallback to create
            }
          }
          await createQuizApi(p)
        })
      )
    } catch (e) {
      setError(e?.response?.data?.message || e.message)
      return
    } finally {
      setSaving(false)
    }
    navigate('/admin/exercise')
  }

   const deleteQuiz = async (quizIdx, quizId) => {
     if (!window.confirm('Bạn có chắc muốn xóa bài này?')) return
     try {
        setSaving(true)
        if (quizId) {
          await deleteQuizApi(quizId)
        }
        const next = [...(result || [])]
        next.splice(quizIdx, 1)
        setResult(next)
     } catch (e) {
       setError(e?.response?.data?.message || e.message)
     } finally {
       setSaving(false)
     }
   }

  return (
    <div className="min-h-screen bg-[#2E4863] text-white">
      <div className="max-w-[1200px] mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold text-[#E4D161]">Edit Quiz • <span className="text-white/90">{title}</span> • <span className="text-white/70"><TypeLabel type={type} /></span></h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 rounded-md font-semibold bg-white/10 hover:bg-white/20 text-white"
            >
              Back
            </button>
            <button
              onClick={saveAll}
              disabled={saving}
              className={`px-4 py-2 rounded-md font-semibold ${
                saving ? 'bg-gray-600 text-white cursor-not-allowed opacity-60' : 'bg-gradient-to-r from-[#F3D96B] to-[#E4D161] text-black hover:scale-[1.02]'
              }`}
            >
              {saving ? 'Đang lưu…' : 'Lưu'}
            </button>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="w-full max-w-[960px]">
            <div className="bg-[#1B2A36] p-4 rounded-md border border-white/10 min-h-[400px]">
              <h2 className="text-lg font-semibold mb-3 text-center">Kết quả</h2>
              {error && <div className="text-red-300 text-sm mb-3 text-center">{error}</div>}
              {loading ? (
                <p className="text-gray-400 text-center">Loading…</p>
              ) : !Array.isArray(result) || !result.length ? (
                <p className="text-gray-400 text-center">Chưa có dữ liệu.</p>
              ) : (
                <div className="space-y-6">
                  {result.map((qz, idx) => (
                    <div key={idx} className="border border-white/10 rounded-md">
                      <div className="px-4 py-2 bg-white/5 font-semibold flex items-center justify-between gap-2">
                        <span>Bài {idx + 1}</span>
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => addQuestion(idx)} className="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20">+ Thêm câu hỏi</button>
                          <button type="button" onClick={() => deleteQuiz(idx, qz._id)} className="text-xs px-2 py-1 rounded bg-red-700 hover:bg-red-800">Xóa bài</button>
                        </div>
                      </div>
                      <div className="p-4 space-y-3">
                        <div>
                          <div className="text-sm text-gray-300 mb-1">Passage:</div>
                          <textarea className="w-full bg-[#0f1620] rounded p-3 text-gray-100 whitespace-pre-wrap outline-none border border-white/10" rows={4} value={qz.passage ?? ''} onChange={(e) => { const next = [...result]; next[idx].passage = e.target.value; setResult(next) }} placeholder="Nhập đoạn Passage cho bài này (tuỳ chọn)..." />
                        </div>
                        {(qz.questions || []).map((qs, i2) => (
                          <QuestionCard key={i2} q={qs} displayIndex={i2 + 1} onUpdate={(nq) => updateQuestion(idx, i2, nq)} onDelete={() => deleteQuestion(idx, i2)} />
                        ))}
                        {(!qz.questions || qz.questions.length === 0) && (
                          <div className="text-xs text-gray-400">Bài chưa có câu hỏi. Hãy bấm “+ Thêm câu hỏi”.</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


