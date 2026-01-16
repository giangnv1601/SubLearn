import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Play, Search, BookOpen, MessageSquare, Languages, RefreshCw } from "lucide-react"
import { fetchQuizzesSummary } from '@/api'
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

const TypeBadge = ({ type }) => {
  const config = QUIZ_TYPE_CONFIG[type]
  if (!config) return null
  const Icon = config.icon

  return (
    <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg ${config.bgColor} border ${config.borderColor}`}>
      <Icon className={`w-3.5 h-3.5 ${config.color}`} />
      <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
    </span>
  )
}

const ExercisePage = () => {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetchQuizzesSummary()
        const items = Array.isArray(res) ? res : (res?.data || res?.items || [])
        if (!mounted) return

        const mapped = (items || []).map((it, idx) => {
          const quizCounts = it.quizCounts || {}
          const total = Object.values(quizCounts).reduce((s, v) => s + (Number(v) || 0), 0)
          return {
            id: it.movieId ?? it._id ?? it.id ?? `r${idx}`,
            title: it.title ?? it.movieTitle ?? it.name ?? 'Untitled',
            quizCounts,
            total
          }
        }).filter(r => r.total > 0)

        setRows(mapped)
      } catch (e) {
        if (!mounted) return
        setError(e?.response?.data?.message || e?.message || 'Failed to load exercises')
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  // Lọc theo tên phim
  const filtered = useMemo(() => {
    if (!query.trim()) return rows
    return rows.filter((row) => row.title.toLowerCase().includes(query.toLowerCase()))
  }, [rows, query])

  // Reset về trang 1 khi search
  useEffect(() => {
    setCurrentPage(1)
  }, [query])

  // Tính toán phân trang
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filtered.slice(start, start + ITEMS_PER_PAGE)
  }, [filtered, currentPage])

  const exerciseTypes = Object.keys(QUIZ_TYPE_CONFIG)

  return (
    <div className="min-h-screen bg-[#2E4863] text-white">
      <div className="max-w-[1000px] mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-semibold text-[#E4D161]">Exercises</h1>
          
          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm kiếm theo tên phim..."
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#1B2A36] border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E4D161] focus:border-transparent text-sm"
            />
          </div>
        </div>

        {/* Content */}
        <div className="bg-[#1B2A36] rounded-xl border border-white/10 overflow-hidden">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-10 h-10 border-4 border-[#E4D161] border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-400 mt-3">Đang tải...</p>
            </div>
          )}
          
          {!loading && error && (
            <div className="text-center py-12 text-red-400">{error}</div>
          )}

          {!loading && !error && (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-sm text-[#E4D161] border-b border-white/10 bg-white/5">
                      <th className="py-3 px-4 font-semibold">Phim</th>
                      <th className="py-3 px-4 font-semibold">Loại bài tập</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRows.map((row) => (
                      <tr key={row.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-4 px-4 align-top">
                          <span className="text-sm text-white font-medium">{row.title}</span>
                        </td>
                        <td className="py-4 px-4 align-top">
                          <div className="flex flex-col gap-2">
                            {exerciseTypes
                              .filter(type => (Number(row.quizCounts?.[type]) || 0) > 0)
                              .map((type) => (
                                <div key={type} className="flex items-center justify-between gap-3">
                                  <TypeBadge type={type} />
                                  <button
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#E4D161] hover:bg-[#d4c151] rounded-lg text-xs font-medium text-[#2E4863] transition-colors"
                                    onClick={() => navigate(`/client/practice/${row.id}/${type}`)}
                                  >
                                    <Play className="w-3.5 h-3.5" /> Luyện tập
                                  </button>
                                </div>
                              ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {paginatedRows.length === 0 && (
                      <tr>
                        <td colSpan={2} className="py-12 text-center text-gray-400">
                          {query.trim() ? 'Không tìm thấy phim phù hợp.' : 'Không có bài tập.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="p-4 border-t border-white/10">
                  <Pagination 
                    currentPage={currentPage} 
                    totalPages={totalPages} 
                    onPageChange={setCurrentPage} 
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ExercisePage
