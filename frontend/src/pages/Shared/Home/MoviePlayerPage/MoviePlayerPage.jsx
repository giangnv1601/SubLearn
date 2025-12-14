import Hls from 'hls.js'
import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  fetchMovieByIdApi,
  fetchSubtitlesByMovie,
  genExerciseWithMovieApi,
} from '@/api/index.js'
import { srtToCues, pairCues, findActiveIndex, findSegmentBeforeTime } from '@/utils/helpers.js'
import InfoPanel from './Panels/InfoPanel.jsx'
import PlayerPanel from './Panels/PlayerPanel.jsx'
import SubtitlePanel from './Panels/SubtitlePanel.jsx'

export default function MoviePlayerPage() {
  const { id } = useParams()
  const [movie, setMovie] = useState(null)
  const [subs, setSubs] = useState([])
  const [activeIdx, setActiveIdx] = useState(-1)
  const [loading, setLoading] = useState(false)
  const [subLoading, setSubLoading] = useState(false)
  const [error, setError] = useState(null)
  const [subtitleMode, setSubtitleMode] = useState('both') // 'both' | 'en' | 'vi'

  // state cho bài tập tương tác
  const [exerciseLoading, setExerciseLoading] = useState(false)
  const [exerciseError, setExerciseError] = useState('')
  const [exerciseQuestions, setExerciseQuestions] = useState([])
  const [userAnswers, setUserAnswers] = useState({})
  const [questionResults, setQuestionResults] = useState([])
  const [checkSummary, setCheckSummary] = useState(null)
  const [showResult, setShowResult] = useState(false)

  const exerciseRef = useRef(null) // scroll tới bài tập
  const videoRef = useRef(null)
  const listRef = useRef(null)
  const rowRefs = useRef([])
  const lastCommittedIdx = useRef(-1)

  // Fetch movie info
  useEffect(() => {
    if (!id) return
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const resp = await fetchMovieByIdApi(id)
        const data = resp?.data ?? resp
        setMovie(data)
      } catch {
        setError('Không thể tải dữ liệu phim')
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  // Fetch subtitles
  useEffect(() => {
    if (!id) return
    ;(async () => {
      setSubLoading(true)
      try {
        const res = await fetchSubtitlesByMovie(id, 1)
        // console.log(res)
        const list = res?.data ?? res ?? []
        const enCues = srtToCues(
          list.find((x) => x.language === 'en')?.srtContent || ''
        )
        const viCues = srtToCues(
          list.find((x) => x.language === 'vi')?.srtContent || ''
        )
        // console.log({ enCues })
        setSubs(pairCues(enCues, viCues))
      } finally {
        setSubLoading(false)
      }
    })()
  }, [id])

  // Attach HLS to video and keep 1 highlight
  useEffect(() => {
    const video = videoRef.current
    if (!video || !movie?.link_m3u8) return
    setActiveIdx(-1)
    lastCommittedIdx.current = -1

    const updateActive = () => {
      const t = video.currentTime || 0
      if (!subs.length) return
      let cur = findActiveIndex(subs, t)
      if (cur === -1) cur = lastCommittedIdx.current
      if (cur !== -1) lastCommittedIdx.current = cur
      setActiveIdx((p) => (p !== cur ? cur : p))
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = movie.link_m3u8
      video.addEventListener('timeupdate', updateActive)
      video.addEventListener('seeking', updateActive)
      video.addEventListener('seeked', updateActive)
      video.addEventListener('ratechange', updateActive)
      video.addEventListener('loadedmetadata', updateActive)
      video.addEventListener('ended', () => {
        setActiveIdx(-1)
        lastCommittedIdx.current = -1
      })
      return () => {
        video.removeAttribute('src')
        video.load()
        video.removeEventListener('timeupdate', updateActive)
        video.removeEventListener('seeking', updateActive)
        video.removeEventListener('seeked', updateActive)
        video.removeEventListener('ratechange', updateActive)
        video.removeEventListener('loadedmetadata', updateActive)
      }
    }

    if (Hls.isSupported()) {
      const hls = new Hls()
      hls.loadSource(movie.link_m3u8)
      hls.attachMedia(video)
      hls.on(Hls.Events.ERROR, (_e, data) => {
        if (data?.fatal) {
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) hls.startLoad()
          else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) hls.recoverMediaError()
          else hls.destroy()
        }
      })
      video.addEventListener('timeupdate', updateActive)
      video.addEventListener('seeking', updateActive)
      video.addEventListener('seeked', updateActive)
      video.addEventListener('ratechange', updateActive)
      video.addEventListener('loadedmetadata', updateActive)
      video.addEventListener('ended', () => {
        setActiveIdx(-1)
        lastCommittedIdx.current = -1
      })
      return () => {
        video.removeEventListener('timeupdate', updateActive)
        video.removeEventListener('seeking', updateActive)
        video.removeEventListener('seeked', updateActive)
        video.removeEventListener('ratechange', updateActive)
        video.removeEventListener('loadedmetadata', updateActive)
        hls.destroy()
      }
    }
  }, [movie?.link_m3u8, subs.length])

  // Auto scroll subtitle list
  useEffect(() => {
    if (activeIdx < 0) return
    const el = rowRefs.current[activeIdx],
      wrap = listRef.current
    if (el && wrap) {
      const top = el.offsetTop - wrap.clientHeight / 2 + el.clientHeight / 2
      wrap.scrollTo({ top, behavior: 'smooth' })
    }
  }, [activeIdx])

  // Chuyển phim đến thời điểm time (giây)
  const seekTo = (time) => {
    const video = videoRef.current
    if (video) video.currentTime = time
  }

  const modeBtnClasses = (mode) =>
    `px-4 py-1.5 rounded-full text-sm font-medium transition ${
      subtitleMode === mode
        ? mode === 'both'
          ? 'bg-sky-600 text-white'
          : mode === 'en'
          ? 'bg-emerald-600 text-white'
          : 'bg-amber-600 text-white'
        : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
    }`

  const handleAnswerChange = (qIndex, value) => {
    setUserAnswers((prev) => ({ ...prev, [qIndex]: value }))
  }

  const normalize = (s = '') => s.toString().trim().toLowerCase()

  const handleCheckResult = () => {
    if (!exerciseQuestions.length) return
    let correctCount = 0
    const perQuestion = exerciseQuestions.map((q, idx) => {
      const user = userAnswers[idx]
      let isCorrect = false

      if (q.type === 'mcq') {
        if (user != null) {
          isCorrect = normalize(user) === normalize(q.answer)
        }
      } else if (q.type === 'fill_blank') {
        isCorrect = normalize(user) === normalize(q.answer)
      } else if (q.type === 'true_false') {
        isCorrect = normalize(user) === normalize(q.answer)
      }

      if (isCorrect) correctCount++
      return isCorrect
    })

    setQuestionResults(perQuestion)
    setCheckSummary({
      correctCount,
      total: exerciseQuestions.length,
    })
    setShowResult(true)
  }

  const handleContinueWatching = () => {
    // clear bài tập & tiếp tục play
    setExerciseQuestions([])
    setUserAnswers({})
    setQuestionResults([])
    setCheckSummary(null)
    setExerciseError('')
    setShowResult(false)

    const video = videoRef.current
    if (video) video.play()

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ========= HANDLE EXERCISE CLICK =========
  const handleExerciseClick = async () => {
    const video = videoRef.current
    if (!video || !subs.length) return

    if (!video.paused) video.pause()
    const currentTime = video.currentTime || 0

    const startIdxBoundary = findSegmentBeforeTime(subs, currentTime, 300)
    let endIdx = findActiveIndex(subs, currentTime)
    if (endIdx === -1) {
      for (let i = subs.length - 1; i >= 0; i--) {
        if (subs[i].start <= currentTime) {
          endIdx = i
          break
        }
      }
    }

    const realStartIdx = Math.max(0, startIdxBoundary + 1)
    if (endIdx < realStartIdx) {
      setExerciseError('Không tìm thấy đoạn phụ đề phù hợp để tạo bài tập.')
      return
    }

    const segmentCues = subs.slice(realStartIdx, endIdx + 1)

    const subtitleSegment = segmentCues
      .map((c) => {
        const lines = []
        if (c.en) lines.push(c.en)
        if (c.vi) lines.push(c.vi)
        return lines.join('\n')
      })
      .join('\n\n')

    if (!subtitleSegment.trim()) {
      setExerciseError('Đoạn phụ đề trống, không thể tạo bài tập.')
      return
    }

    try {
      setExerciseLoading(true)
      setExerciseError('')
      setExerciseQuestions([])
      setUserAnswers({})
      setQuestionResults([])
      setShowResult(false)
      setCheckSummary(null)

      const resp = await genExerciseWithMovieApi({ subtitleSegment })
      const data = resp?.data ?? resp

      const questions = Array.isArray(data)
        ? data
        : Array.isArray(data?.questions)
        ? data.questions
        : []

      if (!questions.length || !questions.every((q) => q.type)) {
        console.error('Invalid exercise payload from API:', data)
        throw new Error('API trả về định dạng bài tập không hợp lệ.')
      }

      setExerciseQuestions(questions)
      setTimeout(() => {
        exerciseRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })
      }, 80)
    } catch (err) {
      console.error(err)
      setExerciseError(
        err?.message ||
          err?.response?.data?.message ||
          'Gọi API tạo bài tập bị lỗi.'
      )
    } finally {
      setExerciseLoading(false)
    }
  }

  // ===== Layout =====
  return (
    <div className="min-h-screen bg-[#2E4863] text-white">
      <div className="max-w-[1200px] mx-auto px-4 py-6">
        <h1 className="text-2xl font-semibold text-[#E4D161] mb-3">
          {movie?.title ?? 'Đang tải phim...'}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <PlayerPanel loading={loading} error={error} videoRef={videoRef} />
          <SubtitlePanel
            subLoading={subLoading}
            subs={subs}
            activeIdx={activeIdx}
            rowRefs={rowRefs}
            listRef={listRef}
            seekTo={seekTo}
            mode={subtitleMode}
          />
        </div>

        {/* Nút đổi chế độ phụ đề + bài tập tương tác */}
        <div className="mt-4 flex flex-wrap gap-3 items-center">
          <button
            type="button"
            className={modeBtnClasses('both')}
            onClick={() => setSubtitleMode('both')}
          >
            Xem song ngữ
          </button>
          <button
            type="button"
            className={modeBtnClasses('en')}
            onClick={() => setSubtitleMode('en')}
          >
            Chỉ tiếng Anh
          </button>
          <button
            type="button"
            className={modeBtnClasses('vi')}
            onClick={() => setSubtitleMode('vi')}
          >
            Chỉ tiếng Việt
          </button>

          <button
            type="button"
            onClick={handleExerciseClick}
            className="ml-auto px-4 py-1.5 rounded-full text-sm font-semibold bg-purple-600 hover:bg-purple-700 disabled:opacity-60"
            disabled={exerciseLoading || !subs.length}
            aria-busy={exerciseLoading}
          >
            {exerciseLoading ? 'Đang tạo bài tập…' : 'Bài tập tương tác'}
          </button>

          {exerciseError && (
            <span className="text-sm text-red-300">{exerciseError}</span>
          )}
        </div>

        {/* Thông tin phim & Bài tập tương tác */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <InfoPanel movie={movie} />

          <div ref={exerciseRef} className="w-full">
            {exerciseQuestions.length > 0 ? (
              <div className="bg-[#1B2A36] rounded-md p-6 text-sm text-gray-100">
                <h3 className="text-lg font-semibold mb-4 text-[#E4D161]">
                  Bài tập tương tác
                </h3>

                <ol className="list-decimal list-inside space-y-4">
                  {exerciseQuestions.map((q, idx) => {
                    const isCorrect =
                      showResult && typeof questionResults[idx] === 'boolean'
                        ? questionResults[idx]
                        : null

                    const borderClass =
                      isCorrect === null
                        ? 'border-transparent'
                        : isCorrect
                        ? 'border-emerald-500'
                        : 'border-red-500'

                    return (
                      <li
                        key={idx}
                        className={`border rounded-md px-3 py-2 ${borderClass}`}
                      >
                        {/* Nội dung câu hỏi */}
                        {q.type === 'mcq' && (
                          <>
                            <div className="font-medium mb-2">
                              {q.question}
                            </div>
                            <div className="space-y-1">
                              {q.options?.map((op, i) => (
                                <label
                                  key={i}
                                  className="flex items-center gap-2 cursor-pointer"
                                >
                                  <input
                                    type="radio"
                                    name={`q-${idx}`}
                                    className="accent-purple-500"
                                    checked={userAnswers[idx] === op}
                                    onChange={() =>
                                      handleAnswerChange(idx, op)
                                    }
                                  />
                                  <span>{op}</span>
                                </label>
                              ))}
                            </div>
                          </>
                        )}

                        {q.type === 'fill_blank' && (
                          <>
                            <div className="font-medium mb-2">
                              {q.sentence}
                            </div>
                            <input
                              type="text"
                              className="mt-1 w-full rounded-md bg-[#101820] border border-gray-600 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                              placeholder="Điền từ còn thiếu..."
                              value={userAnswers[idx] || ''}
                              onChange={(e) =>
                                handleAnswerChange(idx, e.target.value)
                              }
                            />
                          </>
                        )}

                        {q.type === 'true_false' && (
                          <>
                            <div className="font-medium mb-2">
                              {q.statement}
                            </div>
                            <div className="flex gap-2">
                              {['True', 'False'].map((val) => {
                                const selected = userAnswers[idx] === val
                                return (
                                  <button
                                    key={val}
                                    type="button"
                                    onClick={() =>
                                      handleAnswerChange(idx, val)
                                    }
                                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                                      selected
                                        ? 'bg-purple-600 border-purple-500'
                                        : 'bg-[#101820] border-gray-600'
                                    }`}
                                  >
                                    {val}
                                  </button>
                                )
                              })}
                            </div>
                          </>
                        )}

                        {showResult && (
                          <div className="mt-2 text-xs text-gray-300">
                            Đáp án đúng:{' '}
                            <span className="font-semibold">{q.answer}</span>
                          </div>
                        )}
                      </li>
                    )
                  })}
                </ol>

                {/* Kết quả & nút hành động */}
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleCheckResult}
                    className="px-4 py-1.5 rounded-full text-sm font-semibold bg-emerald-600 hover:bg-emerald-700"
                  >
                    Kiểm tra kết quả
                  </button>

                  <button
                    type="button"
                    onClick={handleContinueWatching}
                    className="px-4 py-1.5 rounded-full text-sm font-semibold bg-slate-600 hover:bg-slate-700"
                  >
                    Tiếp tục xem
                  </button>

                  {checkSummary && (
                    <span className="text-xs text-gray-200">
                      Đúng {checkSummary.correctCount}/{checkSummary.total} câu
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="hidden lg:block" />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
