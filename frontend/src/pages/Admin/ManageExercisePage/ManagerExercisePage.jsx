import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { Plus, Edit, Search, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { fetchQuizzesSummary, deleteQuizzesByMovieAndQuizTypeApi } from '@/api'
import Pagination from '@/components/Pagination/Pagination'
import ConfirmDialog from '@/components/ConfirmDialog/ConfirmDialog'

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

const normalizeQuizData = (items) => {
  return items.map((item) => ({
    id: item.movieId,
    title: item.title,
    quizCounts: {
      reading: item?.quizCounts?.reading || 0,
      dialogue_reordering: item?.quizCounts?.dialogue_reordering || 0,
      translation: item?.quizCounts?.translation || 0,
      equivalent: item?.quizCounts?.equivalent || 0
    }
  }))
}

const hasAnyQuizzes = (quizCounts) => {
  return Object.values(quizCounts).reduce((sum, count) => sum + count, 0) > 0
}

const ManagerExercisePage = () => {
  const navigate = useNavigate()

  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  
  // Xóa trạng thái 
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    movieId: null,
    quizType: null,
    quizTypeLabel: ''
  })

  useEffect(() => {
    let mounted = true

    const loadData = async () => {
      setLoading(true)
      setError('')

      try {
        const response = await fetchQuizzesSummary()
        const items = Array.isArray(response) ? response : (response?.data || [])
        
        if (!mounted) return

        const normalizedData = normalizeQuizData(items)
        setData(normalizedData)
      } catch (err) {
        if (!mounted) return
        const errorMessage = err?.response?.data?.message || err.message || 'Không thể tải dữ liệu'
        setError(errorMessage)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadData()

    return () => {
      mounted = false
    }
  }, [])

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data
    const lowerQuery = searchQuery.toLowerCase()
    return data.filter((item) => item.title.toLowerCase().includes(lowerQuery))
  }, [data, searchQuery])

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE)

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredData.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredData, currentPage])

  const exerciseTypes = useMemo(() => {
    return Object.keys(QUIZ_TYPE_LABEL).map((key) => ({
      key,
      label: QUIZ_TYPE_LABEL[key],
      color: QUIZ_TYPE_COLOR[key] || 'bg-gray-700'
    }))
  }, [])

  const handleSearchChange = (value) => {
    setSearchQuery(value)
    setCurrentPage(1)
  }

  const handleCreateQuiz = () => {
    navigate('/admin/exercise/add')
  }

  const handleEditQuiz = (movieId, quizType) => {
    navigate(`/admin/exercise/edit/${movieId}/${quizType}`)
  }

  const handleOpenDeleteConfirm = (movieId, quizType) => {
    const quizTypeLabel = QUIZ_TYPE_LABEL[quizType] || quizType
    setConfirmDialog({
      open: true,
      movieId,
      quizType,
      quizTypeLabel
    })
  }

  const handleConfirmDelete = async () => {
    const { movieId, quizType } = confirmDialog
    
    // Close dialog first
    setConfirmDialog({ open: false, movieId: null, quizType: null, quizTypeLabel: '' })
    
    setLoading(true)

    try {
      const response = await deleteQuizzesByMovieAndQuizTypeApi(movieId, quizType)

      if (response.ok) {
        setData((prev) =>
          prev
            .map((item) => {
              if (item.id === movieId) {
                return {
                  ...item,
                  quizCounts: {
                    ...item.quizCounts,
                    [quizType]: 0
                  }
                }
              }
              return item
            })
            .filter((item) => hasAnyQuizzes(item.quizCounts))
        )

        toast.success(response.message || 'Xóa thành công!')
      } else {
        toast.error(response.message || 'Xóa thất bại')
      }
    } catch (err) {
      console.error('Delete error:', err)
      const errorMessage = err?.response?.data?.message || err.message || 'Xóa thất bại'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelDelete = () => {
    setConfirmDialog({ open: false, movieId: null, quizType: null, quizTypeLabel: '' })
  }

  return (
    <div className="min-h-screen bg-[#2E4863] text-white">
      <div className="max-w-[1200px] mx-auto px-4 py-6">
        {/* Header */}
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
          <h1 className="text-2xl font-semibold text-[#E4D161]">Manage Exercises</h1>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Tìm kiếm theo tên phim..."
                className="w-full pl-9 pr-3 py-2 rounded-md bg-gray-900/40 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E4D161] focus:border-transparent"
              />
            </div>

            {/* Create Button */}
            <button
              onClick={handleCreateQuiz}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#E4D161] text-black rounded-md font-semibold shadow hover:opacity-95 transition-opacity whitespace-nowrap"
            >
              <Plus className="w-4 h-4" /> Create Quiz
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="bg-gray-900/40 rounded-lg p-4">
          {/* Loading State */}
          {loading && (
            <div className="text-center py-6 text-gray-400">Đang tải...</div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="text-center py-6 text-red-400">{error}</div>
          )}

          {/* Data Table */}
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
                    {/* Empty State */}
                    {paginatedData.length === 0 && (
                      <tr>
                        <td colSpan={2} className="py-6 px-3 text-center text-gray-400">
                          {searchQuery.trim() ? 'Không tìm thấy phim phù hợp.' : 'Không có dữ liệu.'}
                        </td>
                      </tr>
                    )}

                    {/* Data Rows */}
                    {paginatedData.map((movie) => (
                      <tr
                        key={movie.id}
                        className="border-b border-gray-800/70 hover:bg-gray-900/60 transition-colors"
                      >
                        <td className="py-3 px-3 align-top max-w-[280px]">
                          {movie.title}
                        </td>
                        <td className="py-3 px-3 align-top">
                          <div className="flex flex-col gap-2">
                            {exerciseTypes
                              .filter((type) => movie.quizCounts[type.key] > 0)
                              .map((type) => (
                                <div key={type.key} className="flex items-center justify-between gap-3">
                                  {/* Type Badge */}
                                  <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded text-xs ${type.color} text-white/90`}>
                                    <span className="w-2 h-2 rounded-full bg-white/60" />
                                    <span className="font-medium capitalize">{type.label}</span>
                                  </span>

                                  {/* Action Buttons */}
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleEditQuiz(movie.id, type.key)}
                                      disabled={loading}
                                      className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-700 hover:bg-blue-600 rounded text-xs font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                      <Edit className="w-4 h-4" /> Sửa
                                    </button>
                                    <button
                                      onClick={() => handleOpenDeleteConfirm(movie.id, type.key)}
                                      disabled={loading}
                                      className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-red-700 hover:bg-red-600 rounded text-xs font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
        </main>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        title="Xác nhận xóa bài tập"
        message={`Bạn có chắc chắn muốn xóa tất cả bài tập "${confirmDialog.quizTypeLabel}" của phim này không?\n\nHành động này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  )
}

export default ManagerExercisePage
