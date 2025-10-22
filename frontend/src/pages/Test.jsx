import { useEffect, useMemo, useRef, useState } from 'react'
import axios from 'axios'

const QUIZ_TYPES = [
  { value: 'reading', label: 'Reading' },
  { value: 'dialogue_reordering', label: 'Dialogue Reordering' },
  { value: 'translation', label: 'Translation (EN→VI options)' },
  { value: 'equivalent', label: 'Equivalent (VI→EN options)' },
]

export default function CreateQuizTester() {
  // quiz
  const [quizType, setQuizType] = useState('reading')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  // movies
  const [movies, setMovies] = useState([])
  const [qMovie, setQMovie] = useState('')
  const [selectedMovieId, setSelectedMovieId] = useState('')

  // subtitles for a movie
  const [subsLoading, setSubsLoading] = useState(false)
  const [subList, setSubList] = useState([]) // [{_id, language, srtContent, ...}]
  const [selectedLang, setSelectedLang] = useState('')
  const [subtitle, setSubtitle] = useState('') // content of chosen subtitle (used to generate quiz)

  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

  const fileRef = useRef(null) // (không dùng nữa, giữ nếu sau này cần)

  // fetch all movies on mount (có thể chuyển sang phân trang nếu dataset lớn)
  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get('http://localhost:5001/api/movies')
        setMovies(res.data || [])
      } catch (err) {
        console.error(err)
      }
    })()
  }, [])

  const filteredMovies = useMemo(() => {
    const q = qMovie.trim().toLowerCase()
    if (!q) return movies
    return movies.filter(m => (m.title || '').toLowerCase().includes(q))
  }, [movies, qMovie])

  const loadSubtitles = async () => {
    setSubList([])
    setSubtitle('')
    setSelectedLang('')
    setResult(null)
    setError(null)
    setSaveMsg('')
    if (!selectedMovieId) {
      setError('Hãy chọn một phim trước.')
      return
    }
    setSubsLoading(true)
    try {
      const res = await axios.get(`http://localhost:5001/api/subtitles/movie/${selectedMovieId}?withContent=1`)
      const list = res?.data?.data || []
      setSubList(list)
      if (list.length === 0) {
        setError('Phim này chưa có phụ đề trong DB.')
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err.message
      setError(msg)
    } finally {
      setSubsLoading(false)
    }
  }

  const chooseSub = (lang) => {
    setSelectedLang(lang)
    const found = subList.find(x => x.language === lang)
    setSubtitle(found?.srtContent || '')
    setResult(null)
    setSaveMsg('')
  }

  const submit = async () => {
    if (!subtitle.trim()) {
      setError('Chưa có nội dung phụ đề (hãy chọn phim, tải phụ đề và chọn 1 phụ đề).')
      return
    }
    setError(null)
    setSaveMsg('')
    setLoading(true)
    setResult(null)
    try {
      const res = await axios.post('http://localhost:5001/api/exercises/create', {
        subtitle,
        quizType,
      })
      setResult(res.data?.data || res.data)
    } catch (err) {
      const msg = err?.response?.data?.message || err.message
      setError(msg)
    } finally {
      setLoading(false)
    }
  }
  
  const createExercises = async () => {
    if (!result || !Array.isArray(result) || result.length === 0) {
      setError('Không có dữ liệu quiz để lưu.')
      return
    }
    
    if (!selectedMovieId) {
      setError('Hãy chọn phim trước khi lưu.')
      return
    }

    setSaving(true)
    setSaveMsg('')
    setError(null)

    try {
      // Lưu từng quiz trong result
      const savePromises = result.map(async (quizData, index) => {
        const questions = quizData.questions || []
        
        // Validate questions format
        const formattedQuestions = questions.map(q => ({
          question: q.question || '',
          options: q.options || [],
          correctIndex: q.correctIndex !== undefined ? q.correctIndex : 0,
          explanation: q.explanation || '',
          quote: q.quote || ''
        }))

        const payload = {
          movieId: selectedMovieId,
          quizType: quizType,
          passage: quizData.passage || '',
          questions: formattedQuestions
        }

        const response = await axios.post('http://localhost:5001/api/quizzes', payload)
        return response.data
      })

      const savedQuizzes = await Promise.all(savePromises)
      
      setSaveMsg(`Đã lưu thành công ${savedQuizzes.length} quiz vào database!`)
      
      // Clear form
      setResult(null)
      setSubtitle('')
      setSelectedLang('')
      setSubList([])
      
    } catch (err) {
      const msg = err?.response?.data?.message || err.message
      setError(`Lỗi khi lưu: ${msg}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#2E4863] text-white">
      <div className="max-w-[1200px] mx-auto px-4 py-6">
        <h1 className="text-2xl font-semibold text-[#E4D161] mb-4">Tạo Quiz từ phụ đề theo phim</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: chọn phim & phụ đề */}
          <div className="lg:col-span-1">
            <div className="bg-[#1B2A36] p-4 rounded-md border border-white/10 space-y-4">
              <div>
                <label className="block text-sm mb-1">Chọn loại bài:</label>
                <select
                  value={quizType}
                  onChange={(e) => setQuizType(e.target.value)}
                  className="w-full bg-[#14202A] text-white px-3 py-2 rounded-md focus:outline-none"
                >
                  {QUIZ_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm">Chọn phim:</label>
                <select
                  value={selectedMovieId}
                  onChange={(e) => setSelectedMovieId(e.target.value)}
                  className="w-full bg-[#14202A] text-white px-3 py-2 rounded-md focus:outline-none"
                >
                  <option value="">-- Chọn phim --</option>
                  {filteredMovies.map(m => (
                    <option key={m._id || m.id} value={m._id || m.id}>
                      {m.title}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={loadSubtitles}
                  disabled={!selectedMovieId || subsLoading}
                  className="mt-2 px-3 py-2 bg-[#E4D161] text-black rounded-md font-semibold disabled:opacity-60"
                >
                  {subsLoading ? 'Đang tải phụ đề…' : 'Tải phụ đề'}
                </button>
              </div>

              {/* danh sách phụ đề của phim */}
              {subList.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-sm">Chọn phụ đề (ngôn ngữ):</label>
                  <div className="flex flex-wrap gap-2">
                    {subList.map((s) => (
                      <button
                        key={s._id}
                        type="button"
                        onClick={() => chooseSub(s.language)}
                        className={`px-3 py-1 rounded-md border ${
                          selectedLang === s.language
                            ? 'bg-[#E4D161] text-black border-transparent'
                            : 'bg-[#14202A] text-white border-white/10'
                        }`}
                        title={`Cập nhật: ${new Date(s.updatedAt).toLocaleString()}`}
                      >
                        {s.language.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* preview phụ đề đã chọn */}
              <div>
                <label className="block text-sm mb-1">Preview phụ đề đã chọn:</label>
                <textarea
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  rows={10}
                  placeholder="Chọn 1 phụ đề ở trên để tự điền nội dung vào đây…"
                  className="w-full bg-[#14202A] text-gray-100 rounded-md p-3 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={submit}
                  disabled={loading}
                  className="px-4 py-2 bg-[#E4D161] text-black rounded-md font-semibold disabled:opacity-60"
                >
                  {loading ? 'Đang tạo...' : 'Tạo Quiz'}
                </button>

                {result && (
                  <>
                    <button
                      onClick={createExercises}
                      disabled={saving}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-black rounded-md font-semibold disabled:opacity-60"
                    >
                      {saving ? 'Đang lưu…' : 'Lưu bài tập'}
                    </button>
                  </>
                )}
              </div>

              {error && <div className="text-red-300 text-sm">{error}</div>}
              {saveMsg && (
                <div className="mt-2 p-3 bg-green-900/20 border border-green-500/30 rounded text-green-300 text-sm">
                  {saveMsg}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: result */}
          <div className="lg:col-span-2">
            <div className="bg-[#1B2A36] p-4 rounded-md border border-white/10 min-h-[400px]">
              <h2 className="text-lg font-semibold mb-3">Kết quả</h2>
              {!result ? (
                <p className="text-gray-400">Chưa có kết quả. Hãy chọn phim → tải phụ đề → chọn 1 phụ đề → “Tạo Quiz”.</p>
              ) : (
                <div className="space-y-5">
                  {/* Render từng quiz đẹp */}
                  {Array.isArray(result) && result.map((qz, idx) => (
                    <div key={idx} className="border border-white/10 rounded-md">
                      <div className="px-4 py-2 bg-white/5 font-semibold">Bài {idx + 1}</div>
                      <div className="p-4 space-y-3">
                        {qz.passage && (
                          <div>
                            <div className="text-sm text-gray-300 mb-1">Passage:</div>
                            <div className="bg-[#0f1620] rounded p-3 text-gray-100 whitespace-pre-wrap">
                              {qz.passage}
                            </div>
                          </div>
                        )}
                        {Array.isArray(qz.questions) && qz.questions.map((qs, i2) => (
                          <div key={i2} className="bg-[#0f1620] rounded p-3">
                            <div className="font-medium mb-2">Q{i2 + 1}. {qs.question}</div>
                            {Array.isArray(qs.options) && (
                              <ul className="list-disc ml-6 text-gray-200 space-y-1">
                                {qs.options.map((op, i3) => (
                                  <li key={i3}>{op}</li>
                                ))}
                              </ul>
                            )}
                            <div className="mt-2 text-sm">
                              <span className="text-[#E4D161] font-semibold">Answer:</span>{' '}
                              <span className="text-gray-200">{qs.answer}</span>
                            </div>
                            {qs.explanation && (
                              <div className="mt-1 text-sm text-gray-300">
                                <span className="text-gray-400">Explanation: </span>{qs.explanation}
                              </div>
                            )}
                            {qs.quote && (
                              <div className="mt-1 text-xs text-gray-400 italic">Quote: {qs.quote}</div>
                            )}
                          </div>
                        ))}
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
