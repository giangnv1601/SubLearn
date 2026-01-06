import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Play, Search } from "lucide-react"
import { fetchQuizzesSummary } from '@/api'
import Pagination from '@/components/Pagination/Pagination'

const ITEMS_PER_PAGE = 3

const QUIZ_TYPE_LABEL = {
  reading: 'Đọc hiểu',
  dialogue_reordering: 'Sắp xếp hội thoại',
  translation: 'Dịch câu',
  equivalent: 'Câu tương đương'
}

const QUIZ_TYPE_COLOR = {
  reading: 'bg-emerald-700',
  dialogue_reordering: 'bg-indigo-700',
  translation: 'bg-amber-700',
  equivalent: 'bg-rose-700'
}

const TypeBadge = ({ label, color = "bg-gray-700" }) => {
  return (
    <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded text-xs ${color}`}>
      <span className="font-medium capitalize">{label}</span>
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

  const exerciseTypes = [
    ...Object.keys(QUIZ_TYPE_LABEL).map((k) => ({
      key: k,
      label: QUIZ_TYPE_LABEL[k],
      color: QUIZ_TYPE_COLOR[k] || 'bg-gray-700'
    }))
  ]

  return (
    <div className="min-h-screen bg-[#2E4863] text-white">
      <div className="max-w-[1200px] mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
          <h1 className="text-2xl font-semibold text-[#E4D161]">Exercises</h1>
          
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

        {/* Table */}
        <div className="bg-gray-900/40 rounded-lg p-4">
          {loading && <div className="text-center py-6 text-gray-400">Đang tải...</div>}
          {!loading && error && <div className="text-center py-6 text-red-400">{error}</div>}

          {!loading && !error && (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-sm text-gray-300">
                      <th className="py-3 px-3 font-semibold">Phim</th>
                      <th className="py-3 px-3 font-semibold">Loại bài tập</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRows.map((row) => (
                      <tr key={row.id} className="border-t border-white/10 hover:bg-white/5">
                        <td className="py-3 px-3 align-top max-w-[280px]">{row.title}</td>
                        <td className="py-3 px-3 align-top">
                          <div className="flex flex-col gap-2">
                            {exerciseTypes
                              .filter(t => (Number(row.quizCounts?.[t.key]) || 0) > 0)
                              .map((type) => (
                                <div key={type.key} className="flex items-center justify-between gap-3">
                                  <TypeBadge label={type.label} color={type.color} />
                                  <button
                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-700 hover:bg-blue-600 rounded text-xs font-medium text-white"
                                    onClick={() => {
                                      const qs = new URLSearchParams({ movieId: String(row.id), type: type.key }).toString()
                                      navigate(`/client/exam?${qs}`)
                                    }}
                                  >
                                    <Play className="w-4 h-4" /> Kiểm tra
                                  </button>
                                </div>
                              ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {paginatedRows.length === 0 && (
                      <tr>
                        <td colSpan={2} className="py-6 text-center text-gray-400">
                          {query.trim() ? 'Không tìm thấy phim phù hợp.' : 'Không có bài tập.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <Pagination 
                currentPage={currentPage} 
                totalPages={totalPages} 
                onPageChange={setCurrentPage} 
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ExercisePage
