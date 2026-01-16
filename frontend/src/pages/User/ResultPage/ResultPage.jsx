import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Trophy, 
  TrendingUp, 
  ChevronDown,
  BookOpen,
  MessageSquare,
  Languages,
  RefreshCw,
  BarChart3,
  Calendar,
  RotateCcw
} from 'lucide-react'
import { fetchPracticeResultsByUserApi } from '@/api'
import Pagination from '@/components/Pagination/Pagination'

const ITEMS_PER_PAGE = 5

const QUIZ_TYPE_CONFIG = {
  reading: { 
    label: 'Đọc hiểu', 
    icon: BookOpen,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30'
  },
  dialogue_reordering: { 
    label: 'Sắp xếp hội thoại', 
    icon: MessageSquare,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30'
  },
  translation: { 
    label: 'Dịch câu', 
    icon: Languages,
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30'
  },
  equivalent: { 
    label: 'Câu tương đương', 
    icon: RefreshCw,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30'
  }
}

const formatDateTime = (iso) => {
  if (!iso) return ''
  const date = new Date(iso)
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getScoreColor = (score) => {
  if (score >= 80) return 'text-green-400'
  if (score >= 50) return 'text-yellow-400'
  return 'text-red-400'
}

const getScoreBg = (score) => {
  if (score >= 80) return 'bg-green-500'
  if (score >= 50) return 'bg-yellow-500'
  return 'bg-red-500'
}

const StatCard = ({ icon: Icon, label, value, color = 'text-[#E4D161]' }) => (
  <div className="bg-[#1B2A36] rounded-xl p-4 border border-white/10">
    <div className="flex items-center gap-3">
      <div className={`p-2.5 rounded-lg bg-white/5 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className={`text-xl font-bold ${color}`}>{value}</p>
      </div>
    </div>
  </div>
)

const ResultRow = ({ result, onRetry }) => {
  const config = QUIZ_TYPE_CONFIG[result.quizType] || QUIZ_TYPE_CONFIG.reading
  const Icon = config.icon
  const movieTitle = result.movieId?.title || 'Không rõ phim'

  return (
    <div className="flex items-center gap-4 p-3 bg-[#1B2A36] rounded-lg border border-white/10 hover:border-white/20 transition-all">
      {/* Icon + Title */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Icon className={`w-4 h-4 flex-shrink-0 ${config.color}`} />
        <span className="text-sm text-white truncate" title={`${movieTitle} / ${config.label}`}>
          {movieTitle} <span className="text-gray-500">/</span> <span className={config.color}>{config.label}</span>
        </span>
      </div>

      {/* Attempt */}
      <span className="text-xs text-gray-400 flex-shrink-0">
        Lần {result.attempt}
      </span>

      {/* Score */}
      <div className="flex items-center gap-2 flex-shrink-0 w-24">
        <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full ${getScoreBg(result.score)}`}
            style={{ width: `${result.score}%` }}
          />
        </div>
        <span className={`text-sm font-medium w-10 text-right ${getScoreColor(result.score)}`}>
          {result.score}%
        </span>
      </div>

      {/* Correct count */}
      <span className="text-xs text-gray-400 flex-shrink-0 w-16 text-center">
        {result.correctCount}/{result.totalQuestions}
      </span>

      {/* Date */}
      <div className="flex items-center gap-1 text-xs text-gray-500 flex-shrink-0 w-32">
        <Calendar className="w-3 h-3" />
        <span>{formatDateTime(result.createdAt)}</span>
      </div>

      {/* Retry button */}
      <button
        onClick={() => onRetry(result)}
        className="p-1.5 text-gray-400 hover:text-[#E4D161] transition-colors flex-shrink-0"
        title="Làm lại"
      >
        <RotateCcw className="w-4 h-4" />
      </button>
    </div>
  )
}

const PracticeResultPage = () => {
  const navigate = useNavigate()

  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [quizTypeFilter, setQuizTypeFilter] = useState('all')
  const [movieFilter, setMovieFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    fetchResults()
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [quizTypeFilter, movieFilter])

  const fetchResults = async () => {
    setLoading(true)
    try {
      const response = await fetchPracticeResultsByUserApi()
      setResults(response.data || [])
    } catch (error) {
      console.error('Error fetching practice results:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  // Danh sách phim unique từ kết quả
  const movieList = useMemo(() => {
    const movies = new Map()
    results.forEach(r => {
      const movieId = r.movieId?._id
      const movieTitle = r.movieId?.title
      if (movieId && movieTitle && !movies.has(movieId)) {
        movies.set(movieId, movieTitle)
      }
    })
    return Array.from(movies, ([id, title]) => ({ id, title }))
  }, [results])

  const filteredResults = useMemo(() => {
    return results.filter(r => {
      const matchQuizType = quizTypeFilter === 'all' || r.quizType === quizTypeFilter
      const matchMovie = movieFilter === 'all' || r.movieId?._id === movieFilter
      return matchQuizType && matchMovie
    })
  }, [results, quizTypeFilter, movieFilter])

  const paginatedResults = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredResults.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredResults, currentPage])

  const totalPages = Math.ceil(filteredResults.length / ITEMS_PER_PAGE)

  const stats = useMemo(() => {
    if (results.length === 0) return null

    const totalAttempts = results.length
    const avgScore = Math.round(results.reduce((acc, r) => acc + r.score, 0) / totalAttempts)
    const bestScore = Math.max(...results.map(r => r.score))

    // Thống kê theo loại quiz
    const byQuizType = Object.keys(QUIZ_TYPE_CONFIG).map(type => {
      const typeResults = results.filter(r => r.quizType === type)
      if (typeResults.length === 0) return null
      return {
        type,
        count: typeResults.length,
        avgScore: Math.round(typeResults.reduce((acc, r) => acc + r.score, 0) / typeResults.length),
        bestScore: Math.max(...typeResults.map(r => r.score))
      }
    }).filter(Boolean)

    return { totalAttempts, avgScore, bestScore, byQuizType }
  }, [results])

  const handleRetry = (result) => {
    const movieId = result.movieId?._id || result.movieId
    navigate(`/client/practice/${movieId}/${result.quizType}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#2E4863] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#E4D161] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-300">Đang tải kết quả...</p>
        </div>
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="min-h-screen bg-[#2E4863] text-white">
        <div className="max-w-[1000px] mx-auto px-4 py-6">
          <h1 className="text-2xl font-semibold text-[#E4D161] mb-6">Results</h1>
          <div className="bg-[#1B2A36] rounded-xl p-8 text-center border border-white/10">
            <BarChart3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">Bạn chưa làm bài luyện tập nào.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#2E4863] text-white">
      <div className="max-w-[1000px] mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-[#E4D161]">Results</h1>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <StatCard 
              icon={BarChart3} 
              label="Tổng số lần làm" 
              value={stats.totalAttempts}
              color="text-blue-400"
            />
            <StatCard 
              icon={TrendingUp} 
              label="Điểm trung bình" 
              value={`${stats.avgScore}%`}
              color="text-green-400"
            />
            <StatCard 
              icon={Trophy} 
              label="Điểm cao nhất" 
              value={`${stats.bestScore}%`}
              color="text-yellow-400"
            />
          </div>
        )}

        {/* Quiz Type Stats */}
        {stats?.byQuizType && stats.byQuizType.length > 0 && (
          <div className="bg-[#1B2A36] rounded-xl p-4 border border-white/10 mb-6">
            <h2 className="text-sm font-semibold text-[#E4D161] mb-3 flex items-center gap-2">
              Thống kê theo loại bài
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {stats.byQuizType.map(({ type, count, avgScore, bestScore }) => {
                const config = QUIZ_TYPE_CONFIG[type]
                const Icon = config.icon
                return (
                  <div 
                    key={type}
                    className={`p-3 rounded-lg ${config.bgColor} border ${config.borderColor}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className={`w-4 h-4 ${config.color}`} />
                      <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Số lần:</span>
                        <span className="text-white font-medium">{count}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Trung bình:</span>
                        <span className={getScoreColor(avgScore)}>{avgScore}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Cao nhất:</span>
                        <span className={getScoreColor(bestScore)}>{bestScore}%</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Filter & Title */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h2 className="text-lg font-semibold text-white">
            Lịch sử làm bài
            <span className="text-sm text-gray-400 font-normal ml-2">
              ({filteredResults.length} kết quả)
            </span>
          </h2>
          
          {/* Filters */}
          <div className="flex items-center gap-3">
            {/* Movie Filter */}
            <div className="relative">
              <select
                value={movieFilter}
                onChange={(e) => setMovieFilter(e.target.value)}
                className="appearance-none bg-[#1B2A36] border border-white/10 rounded-lg px-4 py-2 pr-8 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#E4D161] cursor-pointer"
              >
                <option value="all">Tất cả phim</option>
                {movieList.map(({ id, title }) => (
                  <option key={id} value={id}>{title}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Quiz Type Filter */}
            <div className="relative">
              <select
                value={quizTypeFilter}
                onChange={(e) => setQuizTypeFilter(e.target.value)}
                className="appearance-none bg-[#1B2A36] border border-white/10 rounded-lg px-4 py-2 pr-8 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#E4D161] cursor-pointer"
              >
                <option value="all">Tất cả loại bài</option>
                {Object.entries(QUIZ_TYPE_CONFIG).map(([value, { label }]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Results List */}
        <div className="space-y-2 mb-6">
          {paginatedResults.map((result) => (
            <ResultRow 
              key={result._id} 
              result={result} 
              onRetry={handleRetry}
            />
          ))}
        </div>

        {/* Empty Filter Result */}
        {filteredResults.length === 0 && (quizTypeFilter !== 'all' || movieFilter !== 'all') && (
          <div className="bg-[#1B2A36] rounded-xl p-8 text-center border border-white/10">
            <p className="text-gray-400">Không có kết quả phù hợp với bộ lọc.</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  )
}

export default PracticeResultPage