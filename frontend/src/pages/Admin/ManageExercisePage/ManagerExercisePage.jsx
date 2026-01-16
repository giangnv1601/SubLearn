import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { Plus, Edit, Search, Trash2, BookOpen, MessageSquare, Languages, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { fetchQuizzesSummary, deleteQuizzesByMovieAndQuizTypeApi } from '@/api'
import Pagination from '@/components/Pagination/Pagination'
import ConfirmDialog from '@/components/ConfirmDialog/ConfirmDialog'

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
  const [loading, setLoading] = useState(true)
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

  const exerciseTypes = Object.keys(QUIZ_TYPE_CONFIG)

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
    const quizTypeLabel = QUIZ_TYPE_CONFIG[quizType]?.label || quizType
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
      <div className="max-w-[1000px] mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-semibold text-[#E4D161]">Manage Exercises</h1>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Tìm kiếm theo tên phim..."
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#1B2A36] border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E4D161] focus:border-transparent text-sm"
              />
            </div>

            {/* Create Button */}
            <button
              onClick={handleCreateQuiz}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#E4D161] text-[#2E4863] rounded-lg font-semibold hover:bg-[#d4c151] transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4" /> Tạo bài tập
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-[#1B2A36] rounded-xl border border-white/10 overflow-hidden">
          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-10 h-10 border-4 border-[#E4D161] border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-400 mt-3">Đang tải...</p>
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="text-center py-12 text-red-400">{error}</div>
          )}

          {/* Data Table */}
          {!loading && !error && (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left table-fixed">
                  <thead>
                    <tr className="text-sm text-[#E4D161] border-b border-white/10 bg-white/5">
                      <th className="py-3 px-4 font-semibold w-[35%]">Phim</th>
                      <th className="py-3 px-4 font-semibold w-[35%]">Loại bài tập</th>
                      <th className="py-3 px-4 font-semibold text-center w-[30%]">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Empty State */}
                    {paginatedData.length === 0 && (
                      <tr>
                        <td colSpan={3} className="py-12 text-center text-gray-400">
                          {searchQuery.trim() ? 'Không tìm thấy phim phù hợp.' : 'Không có dữ liệu.'}
                        </td>
                      </tr>
                    )}

                    {/* Data Rows */}
                    {paginatedData.map((movie) => (
                      <tr
                        key={movie.id}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="py-4 px-4 align-top">
                          <span className="text-sm text-white font-medium">{movie.title}</span>
                        </td>
                        <td className="py-4 px-4 align-top">
                          <div className="flex flex-col gap-2 items-start">
                            {exerciseTypes
                              .filter((type) => movie.quizCounts[type] > 0)
                              .map((type) => (
                                <TypeBadge key={type} type={type} />
                              ))}
                          </div>
                        </td>
                        <td className="py-4 px-4 align-top">
                          <div className="flex flex-col gap-2 items-center">
                            {exerciseTypes
                              .filter((type) => movie.quizCounts[type] > 0)
                              .map((type) => (
                                <div key={type} className="flex gap-2">
                                  <button
                                    onClick={() => handleEditQuiz(movie.id, type)}
                                    disabled={loading}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-lg text-xs font-medium text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                  >
                                    <Edit className="w-3.5 h-3.5" /> Sửa
                                  </button>
                                  <button
                                    onClick={() => handleOpenDeleteConfirm(movie.id, type)}
                                    disabled={loading}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-xs font-medium text-red-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" /> Xóa
                                  </button>
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
