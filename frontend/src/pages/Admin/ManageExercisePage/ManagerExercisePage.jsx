import { Plus, Edit, Search, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { fetchQuizzesSummary } from '@/api'
import Pagination from '@/components/Pagination/Pagination'

const ITEMS_PER_PAGE = 5

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

const TypeBadge = ({ label, color = 'bg-gray-700' }) => (
  <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded text-xs ${color} text-white/90`}>
    <span className="w-2 h-2 rounded-full bg-white/60" />
    <span className="font-medium capitalize">{label}</span>
  </span>
)

const ManagerExercisePage = () => {
  const [query, setQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const navigate = useNavigate()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoading(true)
      setError('')
      try {
        const res = await fetchQuizzesSummary()
        const items = Array.isArray(res) ? res : (res?.data || [])
        if (!mounted) return
        const mapped = items.map((it) => ({
          id: it.movieId,
          title: it.title,
          quizCounts: {
            reading: it?.quizCounts?.reading || 0,
            dialogue_reordering: it?.quizCounts?.dialogue_reordering || 0,
            translation: it?.quizCounts?.translation || 0,
            equivalent: it?.quizCounts?.equivalent || 0
          }
        }))
        setData(mapped)
      } catch (e) {
        if (!mounted) return
        setError(e?.response?.data?.message || e.message || 'Failed to load')
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  // Lọc theo tên phim
  const filtered = useMemo(() => {
    if (!query.trim()) return data
    return data.filter((item) => item.title.toLowerCase().includes(query.toLowerCase()))
  }, [data, query])

  // Reset về trang 1 khi search
  useEffect(() => {
    setCurrentPage(1)
  }, [query])

  // Tính toán phân trang
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filtered.slice(start, start + ITEMS_PER_PAGE)
  }, [filtered, currentPage])

  const exerciseTypes = Object.keys(QUIZ_TYPE_LABEL).map((k) => ({
    key: k,
    label: QUIZ_TYPE_LABEL[k],
    color: QUIZ_TYPE_COLOR[k] || 'bg-gray-700'
  }))

  const goEdit = (movieId, quizType) => {
    navigate(`/admin/exercise/${movieId}/${quizType}/edit`)
  }

  return (
    <div className="min-h-screen bg-[#2E4863] text-white">
      <div className="max-w-[1200px] mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
          <h1 className="text-2xl font-semibold text-[#E4D161]">Manage Exercises</h1>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm kiếm theo tên phim..."
                className="w-full pl-9 pr-3 py-2 rounded-md bg-gray-900/40 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E4D161] focus:border-transparent"
              />
            </div>
            <button
              onClick={() => navigate('/admin/exercise/create')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#E4D161] text-black rounded-md font-semibold shadow hover:opacity-95 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" /> Create Quiz
            </button>
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
                    <tr className="border-b border-gray-800 text-sm text-gray-300">
                      <th className="py-3 px-3 font-semibold">Phim</th>
                      <th className="py-3 px-3 font-semibold">Loại bài tập</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.length === 0 && (
                      <tr>
                        <td colSpan={2} className="py-6 px-3 text-center text-gray-400">
                          {query.trim() ? 'Không tìm thấy phim phù hợp.' : 'Không có dữ liệu.'}
                        </td>
                      </tr>
                    )}
                    {paginatedData.map((row) => (
                      <tr key={row.id} className="border-b border-gray-800/70 hover:bg-gray-900/60 transition-colors">
                        <td className="py-3 px-3 align-top max-w-[280px]">{row.title}</td>
                        <td className="py-3 px-3 align-top">
                          <div className="flex flex-col gap-2">
                            {exerciseTypes
                              .filter(t => (Number(row.quizCounts?.[t.key]) || 0) > 0)
                              .map((type) => (
                                <div key={type.key} className="flex items-center justify-between gap-3">
                                  <TypeBadge label={type.label} color={type.color} />
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => goEdit(row.id, type.key)}
                                      className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-700 hover:bg-blue-600 rounded text-xs font-medium text-white"
                                    >
                                      <Edit className="w-4 h-4" /> Sửa
                                    </button>
                                    <button
                                      onClick={() => console.log('Delete', row.id, type.key)}
                                      className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-red-700 hover:bg-red-600 rounded text-xs font-medium text-white"
                                    >
                                      <Trash2 className="w-4 h-4" /> Xóa
                                    </button>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </td>
                      </tr>
                    ))}
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

export default ManagerExercisePage
