import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { BarChart3, TrendingUp, ListChecks, Search } from 'lucide-react'
import { fetchResultsByUserApi } from '@/api'
import { toast } from 'sonner'
import Pagination from '@/components/Pagination/Pagination'

const ITEMS_PER_PAGE = 5

const AccuracyBadge = ({ value }) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return <span className="text-xs text-slate-300">—</span>

  let cls = 'bg-slate-700 text-slate-100'
  if (value >= 80) cls = 'bg-emerald-600/80 text-white'
  else if (value >= 50) cls = 'bg-amber-500/80 text-white'
  else cls = 'bg-rose-600/80 text-white'

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {value.toFixed(1)}%
    </span>
  )
}

const formatDateTime = (iso) => {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const QUIZ_TYPE_LABEL = {
  reading: 'Đọc hiểu',
  dialogue_reordering: 'Sắp xếp hội thoại',
  translation: 'Dịch câu',
  equivalent: 'Câu tương đương'
}

const QUIZ_TYPE_COLOR = {
  reading: 'bg-emerald-700/80 text-emerald-50',
  dialogue_reordering: 'bg-indigo-700/80 text-indigo-50',
  translation: 'bg-amber-700/80 text-amber-50',
  equivalent: 'bg-rose-700/80 text-rose-50'
}

const QuizTypeBadge = ({ type }) => {
  if (!type) return null
  const cls = QUIZ_TYPE_COLOR[type] || 'bg-slate-700/80 text-slate-100'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {QUIZ_TYPE_LABEL[type] || type}
    </span>
  )
}

export default function ResultPage() {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
  const userId = userInfo?._id || userInfo?.id || null

  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [filterType, setFilterType] = useState('all')
  const [query, setQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetchResultsByUserApi(userId)

      const items = Array.isArray(res) ? res : res?.data || []
      setResults(items)
    } catch (err) {
      console.error('fetch results error:', err)
      const msg = err?.response?.data?.message || err?.message || 'Lỗi khi tải kết quả'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    load()
  }, [load])

  // Lọc theo loại bài tập và tìm kiếm
  const filtered = useMemo(() => {
    let data = results

    // Lọc theo loại quiz
    if (filterType !== 'all') {
      data = data.filter((r) => r.quizType === filterType || r.quiz?.quizType === filterType)
    }

    // Lọc theo tên phim
    if (query.trim()) {
      const q = query.toLowerCase()
      data = data.filter((r) => {
        const title = r.quiz?.title || r.quiz?.movieTitle || r.movieTitle || ''
        return title.toLowerCase().includes(q)
      })
    }

    return data
  }, [results, filterType, query])

  // Reset về trang 1 khi thay đổi filter hoặc search
  useEffect(() => {
    setCurrentPage(1)
  }, [filterType, query])

  // Tính toán phân trang
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginatedResults = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filtered.slice(start, start + ITEMS_PER_PAGE)
  }, [filtered, currentPage])

  // Stats dựa trên toàn bộ filtered (không phải paginated)
  const totalAttempts = filtered.length
  const avgAccuracy = useMemo(() => {
    if (!filtered.length) return 0
    const sum = filtered.reduce((acc, r) => acc + (Number(r.accuracy) || 0), 0)
    return sum / filtered.length
  }, [filtered])

  const bestAccuracy = useMemo(() => {
    if (!filtered.length) return 0
    return filtered.reduce((max, r) => Math.max(max, Number(r.accuracy) || 0), 0)
  }, [filtered])

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-3">
        <h1 className="text-2xl font-semibold text-[#E4D161]">Results</h1>
        
        {/* Search Box */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm kiếm theo tên phim..."
            className="w-full pl-9 pr-3 py-2 rounded-md bg-gray-900/40 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E4D161] focus:border-transparent"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-600/20">
            <ListChecks className="w-5 h-5 text-indigo-300" />
          </div>
          <div>
            <div className="text-xs text-white/60 uppercase tracking-wide">Tổng lượt làm</div>
            <div className="text-xl font-semibold text-white">{totalAttempts}</div>
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-600/20">
            <BarChart3 className="w-5 h-5 text-emerald-300" />
          </div>
          <div>
            <div className="text-xs text-white/60 uppercase tracking-wide">Điểm trung bình</div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-semibold text-white">{Number.isFinite(avgAccuracy) ? avgAccuracy.toFixed(1) : '—'}</span>
              <span className="text-xs text-white/70">%</span>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-600/20">
            <TrendingUp className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="text-xs text-white/60 uppercase tracking-wide">Kết quả tốt nhất</div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-semibold text-white">{Number.isFinite(bestAccuracy) ? bestAccuracy.toFixed(1) : '—'}</span>
              <span className="text-xs text-white/70">%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lọc theo loại Quiz */}
      <div className="flex items-center justify-between mb-4 gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-white/60">Loại bài tập:</span>
          <button
            onClick={() => setFilterType('all')}
            className={`px-2 py-1 rounded-full border text-xs ${
              filterType === 'all'
                ? 'bg-white text-slate-900 border-white'
                : 'bg-transparent text-white/80 border-white/20 hover:border-white/50'
            }`}
          >
            Tất cả
          </button>
          {Object.keys(QUIZ_TYPE_LABEL).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-2 py-1 rounded-full border text-xs ${
                filterType === t
                  ? 'bg-white text-slate-900 border-white'
                  : 'bg-transparent text-white/80 border-white/20 hover:border-white/50'
              }`}
            >
              {QUIZ_TYPE_LABEL[t]}
            </button>
          ))}
        </div>
      </div>

      {/* List results */}
      <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
        {loading ? (
          <div className="p-6 text-sm text-white/70">Đang tải kết quả…</div>
        ) : error ? (
          <div className="p-6 text-sm text-rose-400">{error}</div>
        ) : !filtered.length ? (
          <div className="p-6 text-sm text-white/70">
            {query.trim() || filterType !== 'all'
              ? 'Không tìm thấy kết quả phù hợp.'
              : 'Bạn chưa có kết quả làm bài nào.'}
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {/* Header row */}
            <div className="hidden md:grid md:grid-cols-6 gap-3 px-4 py-2 text-xs text-white/60 bg-white/5">
              <div>Phim/ Loại bài tập</div>
              <div className="text-center">Lần làm</div>
              <div className="text-center">Số câu đúng</div>
              <div className="text-center">Tổng câu</div>
              <div className="text-center">Độ chính xác</div>
              <div className="text-right">Thời gian</div>
            </div>

            {/* Rows - sử dụng paginatedResults thay vì filtered */}
            {paginatedResults.map((r) => {
              const quizType = r.quizType || r.quiz?.quizType
              const title =
                r.quiz?.title ||
                r.quiz?.movieTitle ||
                r.movieTitle ||
                `Quiz ${quizType ? `(${QUIZ_TYPE_LABEL[quizType] || quizType})` : ''}`

              return (
                <div
                  key={r._id}
                  className="px-4 py-3 flex flex-col gap-2 md:grid md:grid-cols-6 md:items-center text-sm text-white/90 hover:bg-white/5"
                >
                  {/* Col 1: Phim/ Bài tập */}
                  <div className="flex flex-col gap-1">
                    <div className="font-medium">{title}</div>
                    <div className="flex items-center gap-2 text-xs text-white/60">
                      <QuizTypeBadge type={quizType} />
                    </div>
                  </div>

                  {/* Col 2: Lần làm */}
                  <div className="hidden md:flex md:justify-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-slate-800/80">
                      lần {r.attempt}
                    </span>
                  </div>

                  {/* Col 3: Số câu đúng */}
                  <div className="hidden md:flex md:justify-center">
                    <span className="font-medium text-emerald-300">{r.correctCount}</span>
                  </div>

                  {/* Col 4: Tổng câu */}
                  <div className="hidden md:flex md:justify-center">
                    <span>{r.totalQuestions}</span>
                  </div>

                  {/* Col 5: Độ chính xác */}
                  <div className="hidden md:flex md:justify-center">
                    <AccuracyBadge value={Number.isFinite(Number(r.accuracy)) ? Number(r.accuracy) : null} />
                  </div>

                  {/* Col 6: Thời gian */}
                  <div className="md:text-right text-xs text-white/70 flex items-center justify-end gap-2">
                    <div>{formatDateTime(r.createdAt)}</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-white/10">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  )
}
