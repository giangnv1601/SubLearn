import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import ReactPlayer from 'react-player'
import { Settings } from 'lucide-react'
import { toast } from 'sonner'
import { useParams } from 'react-router-dom'
import { fetchMovieByIdApi, createInteractiveQuizByAiApi, getSubtitlesByMovieApi } from '@/api'
import { parseSubtitlesFromText, findActiveIndex, mergeBiSubs, formatTime } from '@/utils/helpers'

const capitalizeFirstLetter = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export default function VideoPlayerPage() {
  const { id } = useParams()
  
  const [movieData, setMovieData] = useState(null)
  const [subtitlesData, setSubtitlesData] = useState({ en: '', vi: '' })
  const [loading, setLoading] = useState(true)

  // Parse phụ đề từ API data
  const bilingualSubtitles = useMemo(() => {
    const enSubs = parseSubtitlesFromText(subtitlesData.en)
    const viSubs = parseSubtitlesFromText(subtitlesData.vi)
    return mergeBiSubs(enSubs, viSubs)
      .slice()
      .sort((a, b) => a.startTime - b.startTime)
  }, [subtitlesData])

  const [subtitleMode, setSubtitleMode] = useState('bilingual')
  const [activeIndex, setActiveIndex] = useState(-1)
  const [showExerciseOptions, setShowExerciseOptions] = useState(false)
  const [exerciseConfig, setExerciseConfig] = useState({
    duration: 3,
    exercises: {
      mcq: 1,
      fill_blank: 1,
      true_false: 1
    }
  })
  const [exerciseData, setExerciseData] = useState(null)
  const [userAnswers, setUserAnswers] = useState({})
  const [showResults, setShowResults] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)

  // Fetch movie data và subtitles khi component mount
  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        toast.error('Không tìm thấy ID phim')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        
        // Fetch movie info và subtitles song song
        const [movieInfo, subtitles] = await Promise.all([
          fetchMovieByIdApi(id),
          getSubtitlesByMovieApi(id)
        ])
        
        setMovieData(movieInfo)
        
        // Parse subtitles data
        const enSubtitle = subtitles.find(sub => sub.language === 'en')
        const viSubtitle = subtitles.find(sub => sub.language === 'vi')
        
        setSubtitlesData({
          en: enSubtitle?.srtContent || '',
          vi: viSubtitle?.srtContent || ''
        })
        
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error)
        toast.error(error.message || 'Không thể tải thông tin phim')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])


  const filteredSubtitles = useMemo(() => {
    if (subtitleMode === 'en') return bilingualSubtitles.map(s => ({ ...s, viText: '' }))
    if (subtitleMode === 'vi') return bilingualSubtitles.map(s => ({ ...s, enText: '' }))
    return bilingualSubtitles
  }, [subtitleMode, bilingualSubtitles])

  const playerRef = useRef(null) // Ref cho ReactPlayer
  const listRef = useRef(null) // Ref cho container danh sách phụ đề
  const itemRefs = useRef([]) // Mảng ref cho từng item phụ đề
  const userScrollingRef = useRef(false) // Trng thái người dùng có đang cuộn không
  const scrollTimerRef = useRef(null) // Thời gian hẹn để phát hiện ngừng cuộn

  // Cập nhật hàm handleTimeUpdate để lưu current time
  const handleTimeUpdate = useCallback(() => {
    const player = playerRef.current
    if (!player) return

    const time = Number(player.currentTime ?? 0)
    setCurrentTime(time)
    
    const index = findActiveIndex(filteredSubtitles, time)
    if (index !== activeIndex) setActiveIndex(index)
  }, [filteredSubtitles, activeIndex])

  // Tính toán xem button có nên disable không
  const isExerciseButtonDisabled = useMemo(() => {
    const requiredSeconds = exerciseConfig.duration * 60 // Chuyển phút sang giây
    return currentTime < requiredSeconds
  }, [currentTime, exerciseConfig.duration])

  // Tính thời gian còn lại cần chờ
  const remainingTime = useMemo(() => {
    const requiredSeconds = exerciseConfig.duration * 60
    const remaining = Math.max(0, requiredSeconds - currentTime)
    const minutes = Math.floor(remaining / 60)
    const seconds = Math.floor(remaining % 60)
    return `${minutes}:${String(seconds).padStart(2, '0')}`
  }, [currentTime, exerciseConfig.duration])

  // Auto-scroll khi activeIndex đổi
  useEffect(() => {
    if (activeIndex < 0) return
    if (userScrollingRef.current) return

    const container = listRef.current
    const element = itemRefs.current[activeIndex] 
    if (!container || !element) return

    // Tính vị trí tương đối của element so với container
    const containerRect = container.getBoundingClientRect()
    const elementRect = element.getBoundingClientRect()
    
    // Khoảng cách từ đầu container đến element hiện tại
    const relativeTop = elementRect.top - containerRect.top + container.scrollTop
    
    container.scrollTo({ 
      top: Math.max(0, relativeTop), 
      behavior: 'smooth' 
    })
  }, [activeIndex])

  // Khi click vào phụ đề -> player tua tới thời điểm đó
  const onSubtitleClick = (sub, idx) => {
    const player = playerRef.current
    if (!player) return

    setActiveIndex(idx)

    const target = Math.max(0, (sub.startTime ?? 0) + 0.01)

    if ('currentTime' in player) player.currentTime = target
    else if (typeof player.seekTo === 'function') player.seekTo(target)
  }

  // Xử lý sự kiện cuộn danh sách phụ đề
  const onListScroll = useCallback(() => {
    userScrollingRef.current = true
    
    if (scrollTimerRef.current) {
      clearTimeout(scrollTimerRef.current)
    }
    
    scrollTimerRef.current = setTimeout(() => {
      userScrollingRef.current = false
    }, 250)
  }, [])

  // Cleanup khi unmount
  useEffect(() => {
    return () => {
      if (scrollTimerRef.current) {
        clearTimeout(scrollTimerRef.current)
      }
    }
  }, [])

  // Lấy đoạn phụ đề từ (currentTime - duration) đến currentTime
  const getSegmentSubtitles = useCallback(() => {
    const player = playerRef.current
    if (!player) return []

    const currentTime = Number(player.currentTime ?? 0)
    const durationInSeconds = exerciseConfig.duration * 60 // Chuyển phút sang giây
    const startTime = Math.max(0, currentTime - durationInSeconds)

    // Lọc các phụ đề trong khoảng thời gian [startTime, currentTime]
    const segmentSubs = bilingualSubtitles.filter(sub => {
      return sub.startTime >= startTime && sub.startTime <= currentTime
    })

    return segmentSubs
  }, [bilingualSubtitles, exerciseConfig.duration])

  // Xử lý khi bấm nút "Bài tập tương tác"
  const handleCreateExercise = useCallback(async () => {
    const player = playerRef.current
    if (!player) {
      toast.error('Player chưa sẵn sàng')
      return
    }

    // Pause player
    if (typeof player.pause === 'function') {
      player.pause()
    }

    // Lấy segment subtitle
    const segmentSubtitles = getSegmentSubtitles()

    if (segmentSubtitles.length === 0) {
      toast.error('Không có phụ đề trong khoảng thời gian đã chọn!')
      return
    }

    // Format subtitle thành text SRT
    const segmentSubtitle = segmentSubtitles
      .map((sub, idx) => {
        const start = formatTime(sub.startTime).replace(/:/g, ':').concat(',000')
        const end = formatTime(sub.endTime).replace(/:/g, ':').concat(',000')
        return `${idx + 1}\n${start} --> ${end}\n${sub.enText || ''}\n${sub.viText || ''}\n`
      })
      .join('\n')

    // Chuẩn bị payload để gọi API
    const payload = {
      segmentSubtitle,
      mcqNum: exerciseConfig.exercises.mcq,
      fill_blankNum: exerciseConfig.exercises.fill_blank,
      true_falseNum: exerciseConfig.exercises.true_false
    }

    // Hiển thị loading toast
    const loadingToastId = toast.loading('Đang tạo bài tập...', { duration: Infinity })

    try {
      const data = await createInteractiveQuizByAiApi(payload)
      
      toast.success(
        `Đã tạo thành công bài tập! Bạn có thể xem và làm bài tập ngay bây giờ.`,
        { id: loadingToastId, duration: 4000 }
      )

      // Hiển thị bài tập
      setExerciseData(data)
      setUserAnswers({})
      setShowResults(false)
      
    } catch (error) {
      console.error('Lỗi khi tạo bài tập:', error)
      toast.error(error.message || 'Có lỗi xảy ra khi tạo bài tập!', { id: loadingToastId })
    }
  }, [getSegmentSubtitles, exerciseConfig])

  // Xử lý khi user chọn đáp án
  const handleAnswerChange = (questionIndex, answer) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }))
  }

  // Kiểm tra đáp án
  const handleCheckAnswers = () => {
    setShowResults(true)
  }

  // Đóng bài tập và tiếp tục xem phim
  const handleContinueWatching = () => {
    const player = playerRef.current
    if (player && typeof player.play === 'function') {
      player.play()
    }
    setExerciseData(null)
    setUserAnswers({})
    setShowResults(false)
  }

  return (
    <div className="min-h-screen bg-[#2E4863] text-white">
      {loading ? (
        <div className="max-w-[1200px] mx-auto px-4 py-6">
          <div className="flex items-center justify-center h-[600px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-300">Đang tải thông tin phim...</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-[1200px] mx-auto px-4 py-6">
          <h1 className="text-2xl font-semibold text-[#E4D161] mb-3">
            {movieData.title}
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Player */}
            <div className="lg:col-span-2">
              <div className="bg-[#1B2A36] rounded-md border border-white/10 overflow-hidden">
                <div className="w-full h-[420px] bg-black">
                  <ReactPlayer
                    ref={playerRef}
                    src={movieData.link_m3u8}
                    controls
                    width="100%"
                    height="100%"
                    onTimeUpdate={handleTimeUpdate}
                  />
                </div>
              </div>
            </div>

            {/* Subtitle  */}
            <div className="flex flex-col">
              <div
                ref={listRef}
                onScroll={onListScroll}
                className="bg-[#1B2A36] rounded-md border border-white/10 h-[420px] overflow-y-auto"
              >
                <ul className="divide-y divide-white/10">
                  {filteredSubtitles.map((subtitle, index) => {
                    const active = index === activeIndex
                    return (
                      <li
                        key={index}
                        ref={(el) => (itemRefs.current[index] = el)}
                        onClick={() => onSubtitleClick(subtitle, index)}
                        className={`p-3 border-l-4 cursor-pointer transition-colors ${
                          active ? "border-l-sky-400 bg-white/10" : "border-transparent hover:bg-white/5"
                        }`}
                      >
                        <div className={`text-[11px] font-mono mb-1 transition-colors ${
                          active ? "text-sky-400 font-semibold" : "text-gray-400"
                        }`}>
                          {formatTime(subtitle.startTime)} <span className="opacity-70">→</span> {formatTime(subtitle.endTime)}
                        </div>
                        {subtitle.enText && (
                          <p className="text-[15px] text-white/90 font-semibold whitespace-pre-wrap mb-1">
                            {subtitle.enText}
                          </p>
                        )}
                        {subtitle.viText && (
                          <p className="text-sm italic text-gray-300 whitespace-pre-wrap">
                            {subtitle.viText}
                          </p>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-4 flex flex-wrap gap-3 items-center">
            <button
              type="button"
              onClick={() => setSubtitleMode('bilingual')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${subtitleMode === 'bilingual' ? 'bg-sky-600 text-white' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'}`}
            >
              Xem song ngữ
            </button>

            <button
              type="button"
              onClick={() => setSubtitleMode('en')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${subtitleMode === 'en' ? 'bg-sky-600 text-white' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'}`}
            >
              Chỉ tiếng Anh
            </button>

            <button
              type="button"
              onClick={() => setSubtitleMode('vi')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${subtitleMode === 'vi' ? 'bg-sky-600 text-white' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'}`}
            >
              Chỉ tiếng Việt
            </button>

            {/* Nút Settings và Tạo bài tập */}
            <div className="ml-auto flex items-center gap-2">
              {/* Nút Settings - Dropdown config */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowExerciseOptions(!showExerciseOptions)}
                  className={`p-2 rounded-full transition ${
                    showExerciseOptions 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                  title="Cài đặt bài tập"
                >
                  <Settings className="w-5 h-5" />
                </button>

                {/* Dropdown Panel */}
                {showExerciseOptions && (
                  <div className="absolute right-0 mt-2 w-80 bg-[#1B2A36] rounded-lg shadow-xl border border-white/10 p-4 z-10">
                    {/* Chọn thời lượng nội dung */}
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Thời lượng nội dung quan tâm
                      </label>
                      <div className="flex gap-2">
                        {[3, 5, 7].map(minutes => (
                          <button
                            key={minutes}
                            type="button"
                            onClick={() => setExerciseConfig(prev => ({ ...prev, duration: minutes }))}
                            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition ${
                              exerciseConfig.duration === minutes
                                ? 'bg-purple-600 text-white'
                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            }`}
                          >
                            {minutes} phút
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Chọn số lượng bài tập */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Số lượng bài tập
                      </label>
                      
                      {/* Trắc nghiệm (MCQ) */}
                      <div className="flex items-center justify-between mb-2 bg-slate-800/50 rounded-md p-2">
                        <span className="text-sm text-gray-300">Trắc nghiệm</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setExerciseConfig(prev => ({
                              ...prev,
                              exercises: { ...prev.exercises, mcq: Math.max(1, prev.exercises.mcq - 1) }
                            }))}
                            disabled={exerciseConfig.exercises.mcq <= 1}
                            className={`w-6 h-6 rounded flex items-center justify-center transition ${
                              exerciseConfig.exercises.mcq <= 1
                                ? 'bg-slate-800 text-gray-600 cursor-not-allowed'
                                : 'bg-slate-700 hover:bg-slate-600 text-white'
                            }`}
                          >
                            <span className="text-lg leading-none">−</span>
                          </button>
                          <span className="w-8 text-center text-sm font-semibold">{exerciseConfig.exercises.mcq}</span>
                          <button
                            type="button"
                            onClick={() => setExerciseConfig(prev => ({
                              ...prev,
                              exercises: { ...prev.exercises, mcq: Math.min(3, prev.exercises.mcq + 1) }
                            }))}
                            disabled={exerciseConfig.exercises.mcq >= 3}
                            className={`w-6 h-6 rounded flex items-center justify-center transition ${
                              exerciseConfig.exercises.mcq >= 3
                                ? 'bg-slate-800 text-gray-600 cursor-not-allowed'
                                : 'bg-slate-700 hover:bg-slate-600 text-white'
                            }`}
                          >
                            <span className="text-lg leading-none">+</span>
                          </button>
                        </div>
                      </div>

                      {/* Điền từ (Fill Blank) */}
                      <div className="flex items-center justify-between mb-2 bg-slate-800/50 rounded-md p-2">
                        <span className="text-sm text-gray-300">Điền từ</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setExerciseConfig(prev => ({
                              ...prev,
                              exercises: { ...prev.exercises, fill_blank: Math.max(1, prev.exercises.fill_blank - 1) }
                            }))}
                            disabled={exerciseConfig.exercises.fill_blank <= 1}
                            className={`w-6 h-6 rounded flex items-center justify-center transition ${
                              exerciseConfig.exercises.fill_blank <= 1
                                ? 'bg-slate-800 text-gray-600 cursor-not-allowed'
                                : 'bg-slate-700 hover:bg-slate-600 text-white'
                            }`}
                          >
                            <span className="text-lg leading-none">−</span>
                          </button>
                          <span className="w-8 text-center text-sm font-semibold">{exerciseConfig.exercises.fill_blank}</span>
                          <button
                            type="button"
                            onClick={() => setExerciseConfig(prev => ({
                              ...prev,
                              exercises: { ...prev.exercises, fill_blank: Math.min(3, prev.exercises.fill_blank + 1) }
                            }))}
                            disabled={exerciseConfig.exercises.fill_blank >= 3}
                            className={`w-6 h-6 rounded flex items-center justify-center transition ${
                              exerciseConfig.exercises.fill_blank >= 3
                                ? 'bg-slate-800 text-gray-600 cursor-not-allowed'
                                : 'bg-slate-700 hover:bg-slate-600 text-white'
                            }`}
                          >
                            <span className="text-lg leading-none">+</span>
                          </button>
                        </div>
                      </div>

                      {/* Đúng/Sai (True/False) */}
                      <div className="flex items-center justify-between bg-slate-800/50 rounded-md p-2">
                        <span className="text-sm text-gray-300">Đúng/Sai</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setExerciseConfig(prev => ({
                              ...prev,
                              exercises: { ...prev.exercises, true_false: Math.max(1, prev.exercises.true_false - 1) }
                            }))}
                            disabled={exerciseConfig.exercises.true_false <= 1}
                            className={`w-6 h-6 rounded flex items-center justify-center transition ${
                              exerciseConfig.exercises.true_false <= 1
                                ? 'bg-slate-800 text-gray-600 cursor-not-allowed'
                                : 'bg-slate-700 hover:bg-slate-600 text-white'
                            }`}
                          >
                            <span className="text-lg leading-none">−</span>
                          </button>
                          <span className="w-8 text-center text-sm font-semibold">{exerciseConfig.exercises.true_false}</span>
                          <button
                            type="button"
                            onClick={() => setExerciseConfig(prev => ({
                              ...prev,
                              exercises: { ...prev.exercises, true_false: Math.min(3, prev.exercises.true_false + 1) }
                            }))}
                            disabled={exerciseConfig.exercises.true_false >= 3}
                            className={`w-6 h-6 rounded flex items-center justify-center transition ${
                              exerciseConfig.exercises.true_false >= 3
                                ? 'bg-slate-800 text-gray-600 cursor-not-allowed'
                                : 'bg-slate-700 hover:bg-slate-600 text-white'
                            }`}
                          >
                            <span className="text-lg leading-none">+</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Nút Tạo bài tập */}
              <button
                type="button"
                onClick={handleCreateExercise}
                disabled={isExerciseButtonDisabled}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${
                  isExerciseButtonDisabled
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
                title={isExerciseButtonDisabled ? `Cần xem thêm ${remainingTime}` : 'Tạo bài tập tương tác'}
              >
                {isExerciseButtonDisabled ? `Chờ ${remainingTime}` : 'Bài tập tương tác'}
              </button>
            </div>
          </div>

          {/* InfoMovie + Exercise */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <div className="bg-[#1B2A36] p-6 rounded-xl shadow-lg text-gray-300 border border-white/5">
              <h3 className="text-xl font-bold text-[#E4D161] mb-4 border-b border-white/10 pb-2">
                Thông tin phim
              </h3>

              <div className="flex flex-col sm:flex-row gap-6">
                <div className="shrink-0 mx-auto sm:mx-0">
                  <div className="w-32 sm:w-40 aspect-[2/3] rounded-lg overflow-hidden shadow-md border border-white/10 bg-black/20">
                    {movieData?.thumb_url ? (
                      <img
                        src={movieData.thumb_url}
                        alt={movieData?.title || 'Movie poster'}
                        className="w-full h-full object-cover"
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">
                        No Image
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-1 space-y-3">
                  <div>
                    <h4 className="text-2xl font-bold text-white leading-tight">
                      {movieData?.title || 'Đang tải...'}
                    </h4>

                    {movieData?.level && (
                      <span
                        className={`inline-block mt-2 text-xs font-bold px-2.5 py-1 rounded-full border 
                          ${
                            movieData.level.toLowerCase() === 'easy'
                              ? 'bg-green-600/20 text-green-300 border-green-500/30'
                              : movieData.level.toLowerCase() === 'medium'
                              ? 'bg-yellow-600/20 text-yellow-300 border-yellow-500/30'
                              : movieData.level.toLowerCase() === 'hard'
                              ? 'bg-red-600/20 text-red-300 border-red-500/30'
                              : 'bg-gray-600/20 text-gray-300 border-gray-500/30'
                          }`}
                      >
                        {capitalizeFirstLetter(movieData.level)}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 text-sm">
                    <div className="px-3 py-1 rounded-full bg-[#14202A] border border-white/10 text-gray-300 flex items-center gap-1">
                      <span className="text-[#E4D161]">Năm:</span>
                      <span>{movieData?.year_released ?? 'N/A'}</span>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-[#14202A] border border-white/10 text-gray-300 flex items-center gap-1">
                      <span className="text-[#E4D161]">Thời lượng:</span>
                      <span>{movieData?.duration ?? 'N/A'}</span>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-[#14202A] border border-white/10 text-gray-300 flex items-center gap-1">
                      <span className="text-[#E4D161]">Thể loại:</span>
                      <span>{movieData?.genre ?? 'Unknown'}</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <h5 className="text-sm font-semibold text-gray-400 mb-1">Mô tả:</h5>
                    <div className="text-sm text-gray-300 leading-relaxed max-h-40 overflow-y-auto pr-2">
                      {movieData?.description ? (
                        <p className="whitespace-pre-wrap">{movieData.description}</p>
                      ) : (
                        <p className="italic text-gray-500">Mô tả phim chưa có.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Exercise */}
            {exerciseData && (
              <div className="bg-[#1B2A36] p-6 rounded-xl shadow-lg border border-white/5">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                  <h3 className="text-xl font-bold text-[#E4D161]">
                    Bài tập tương tác
                  </h3>
                  <span className="text-sm text-gray-400">
                    {Object.keys(userAnswers).length}/{exerciseData.questions?.length || 0} câu
                  </span>
                </div>

                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  {exerciseData.questions?.map((question, index) => {
                    const userAnswer = userAnswers[index]
                    const isCorrect = showResults && userAnswer === question.answer

                    // Multiple Choice Question
                    if (question.type === 'mcq') {
                      return (
                        <div key={index} className="bg-slate-800/50 rounded-lg p-4 space-y-3">
                          <div className="flex items-start gap-2">
                            <span className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                              {index + 1}
                            </span>
                            <div className="flex-1">
                              <p className="text-white font-medium mb-3">{question.question}</p>
                              <div className="space-y-2">
                                {question.options.map((option, optIndex) => {
                                  const isSelected = userAnswer === option
                                  const isCorrectOption = option === question.answer
                                  
                                  return (
                                    <button
                                      key={optIndex}
                                      onClick={() => !showResults && handleAnswerChange(index, option)}
                                      disabled={showResults}
                                      className={`w-full text-left px-4 py-2 rounded-md transition ${
                                        showResults
                                          ? isCorrectOption
                                            ? 'bg-green-600/30 border-2 border-green-500'
                                            : isSelected && !isCorrect
                                            ? 'bg-red-600/30 border-2 border-red-500'
                                            : 'bg-slate-700/50 border border-slate-600'
                                          : isSelected
                                          ? 'bg-purple-600 border-2 border-purple-400'
                                          : 'bg-slate-700 border border-slate-600 hover:bg-slate-600'
                                      }`}
                                    >
                                      <span className="text-white text-sm">{option}</span>
                                    </button>
                                  )
                                })}
                              </div>
                            </div>
                          </div>
                          
                          {showResults && (
                            <div className={`mt-3 p-3 rounded-md ${isCorrect ? 'bg-green-900/30' : 'bg-red-900/30'}`}>
                              <p className={`font-semibold mb-1 ${isCorrect ? 'text-green-300' : 'text-red-300'}`}>
                                {isCorrect ? '✓ Chính xác!' : '✗ Sai rồi!'}
                              </p>
                              {!isCorrect && (
                                <p className="text-sm text-gray-300 mb-1">
                                  Đáp án đúng: <span className="font-semibold text-white">{question.answer}</span>
                                </p>
                              )}
                              <p className="text-sm text-gray-300 italic">{question.explanation}</p>
                            </div>
                          )}
                        </div>
                      )
                    }

                    // Fill in the Blank
                    if (question.type === 'fill_blank') {
                      return (
                        <div key={index} className="bg-slate-800/50 rounded-lg p-4 space-y-3">
                          <div className="flex items-start gap-2">
                            <span className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                              {index + 1}
                            </span>
                            <div className="flex-1">
                              <p className="text-white font-medium mb-3">Điền từ vào chỗ trống:</p>
                              <p className="text-gray-300 mb-3 italic">{question.sentence}</p>
                              <input
                                type="text"
                                value={userAnswer || ''}
                                onChange={(e) => !showResults && handleAnswerChange(index, e.target.value)}
                                disabled={showResults}
                                placeholder="Nhập từ cần điền..."
                                className={`w-full px-4 py-2 rounded-md bg-slate-700 text-white border ${
                                  showResults
                                    ? isCorrect
                                      ? 'border-green-500'
                                      : 'border-red-500'
                                    : 'border-slate-600 focus:border-purple-500 focus:outline-none'
                                }`}
                              />
                            </div>
                          </div>

                          {showResults && (
                            <div className={`mt-3 p-3 rounded-md ${isCorrect ? 'bg-green-900/30' : 'bg-red-900/30'}`}>
                              <p className={`font-semibold mb-1 ${isCorrect ? 'text-green-300' : 'text-red-300'}`}>
                                {isCorrect ? '✓ Chính xác!' : '✗ Sai rồi!'}
                              </p>
                              {!isCorrect && (
                                <p className="text-sm text-gray-300 mb-1">
                                  Đáp án đúng: <span className="font-semibold text-white">{question.answer}</span>
                                </p>
                              )}
                              <p className="text-sm text-gray-300 italic">{question.explanation}</p>
                            </div>
                          )}
                        </div>
                      )
                    }

                    // True/False
                    if (question.type === 'true_false') {
                      return (
                        <div key={index} className="bg-slate-800/50 rounded-lg p-4 space-y-3">
                          <div className="flex items-start gap-2">
                            <span className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                              {index + 1}
                            </span>
                            <div className="flex-1">
                              <p className="text-white font-medium mb-3">{question.statement}</p>
                              <div className="flex gap-3">
                                {['True', 'False'].map((option) => {
                                  const isSelected = userAnswer === option
                                  const isCorrectOption = option === question.answer

                                  return (
                                    <button
                                      key={option}
                                      onClick={() => !showResults && handleAnswerChange(index, option)}
                                      disabled={showResults}
                                      className={`flex-1 px-6 py-2 rounded-md font-medium transition ${
                                        showResults
                                          ? isCorrectOption
                                            ? 'bg-green-600/30 border-2 border-green-500 text-green-200'
                                            : isSelected && !isCorrect
                                            ? 'bg-red-600/30 border-2 border-red-500 text-red-200'
                                            : 'bg-slate-700/50 border border-slate-600 text-gray-400'
                                          : isSelected
                                          ? 'bg-purple-600 border-2 border-purple-400 text-white'
                                          : 'bg-slate-700 border border-slate-600 text-white hover:bg-slate-600'
                                      }`}
                                    >
                                      {option === 'True' ? 'Đúng' : 'Sai'}
                                    </button>
                                  )
                                })}
                              </div>
                            </div>
                          </div>

                          {showResults && (
                            <div className={`mt-3 p-3 rounded-md ${isCorrect ? 'bg-green-900/30' : 'bg-red-900/30'}`}>
                              <p className={`font-semibold mb-1 ${isCorrect ? 'text-green-300' : 'text-red-300'}`}>
                                {isCorrect ? '✓ Chính xác!' : '✗ Sai rồi!'}
                              </p>
                              <p className="text-sm text-gray-300 italic">{question.explanation}</p>
                            </div>
                          )}
                        </div>
                      )
                    }

                    return null
                  })}
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 flex gap-3">
                  {!showResults ? (
                    <button
                      onClick={handleCheckAnswers}
                      className="flex-1 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition"
                    >
                      Kiểm tra
                    </button>
                  ) : (
                    <button
                      onClick={handleContinueWatching}
                      className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition"
                    >
                      Tiếp tục xem
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
