import { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, Image, ChevronLeft, ChevronRight, Search, FilePlus2, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import MovieModalNew from './MovieModal/MovieModalNew'
import UploadSubtitleModal from './UploadSubtitleModal/UploadSubtitleModal.jsx'
import ConfirmDialog from '@/components/ConfirmDialog/ConfirmDialog'
import { fetchMoviesApi, deleteMovieApi } from '@/api'

const ITEMS_PER_PAGE = 10

const GENRE_OPTIONS = [
  'Hành Động',
  'Phiêu Lưu',
  'Viễn Tưởng',
  'Khoa Học',
  'Võ Thuật',
]

const toArray = (res) => (Array.isArray(res) ? res : (res?.data ?? []))

const ManagerMovie = () => {
  const [movieBuffer, setMovieBuffer] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // Trạng thái modal
  const [showMovieModal, setShowMovieModal] = useState(false)
  const [editingMovie, setEditingMovie] = useState(null)

  const [showSubtitleModal, setShowSubtitleModal] = useState(false)
  const [subtitleMovie, setSubtitleMovie] = useState(null)

  // Delete confirmation states
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [movieToDelete, setMovieToDelete] = useState(null)

  useEffect(() => {
    loadMovies()
  }, [])

  const loadMovies = async () => {
    try {
      setLoading(true)
      const data = await fetchMoviesApi()
      setMovieBuffer(toArray(data))
    } catch (error) {
      console.error('Error fetching movies:', error)
      toast.error('Không thể tải danh sách phim')
      setMovieBuffer([])
    } finally {
      setLoading(false)
    }
  }

  // HANDLERS - Movie Modal
  const handleOpenAddMovie = () => {
    setEditingMovie(null)
    setShowMovieModal(true)
  }

  const handleOpenEditMovie = (movie) => {
    setEditingMovie(movie)
    setShowMovieModal(true)
  }

  const handleCloseMovieModal = () => {
    setShowMovieModal(false)
    setEditingMovie(null)
  }

  const handleSaveMovie = async () => {
    await loadMovies()
    handleCloseMovieModal()
  }

  // HANDLERS - Subtitle Modal
  const handleOpenSubtitleModal = (movie) => {
    setSubtitleMovie(movie)
    setShowSubtitleModal(true)
  }

  const handleCloseSubtitleModal = () => {
    setShowSubtitleModal(false)
    setSubtitleMovie(null)
  }

  // HANDLERS - Delete Movie
  const handleOpenDeleteConfirm = (movie) => {
    setMovieToDelete(movie)
    setShowConfirmDelete(true)
  }

  const handleConfirmDelete = async () => {
    if (!movieToDelete) return

    try {
      await deleteMovieApi(movieToDelete._id || movieToDelete.id)
      toast.success('Xóa phim thành công')
      await loadMovies()
    } catch (error) {
      console.error('Error deleting movie:', error)
      toast.error('Không thể xóa phim. Vui lòng thử lại.')
    } finally {
      setShowConfirmDelete(false)
      setMovieToDelete(null)
    }
  }

  const handleCancelDelete = () => {
    setShowConfirmDelete(false)
    setMovieToDelete(null)
  }

  // Lọc và phần trang
  const filteredMovies = movieBuffer.filter(movie => {
    const title = (movie.title || '').toLowerCase()
    const genres = (movie.genre || '').toLowerCase()
    const queryTrim = searchQuery.trim().toLowerCase()
    const genreTrim = selectedGenre.trim().toLowerCase()

    const matchQuery = queryTrim === '' || title.includes(queryTrim)
    const matchGenre = genreTrim === '' || genres.includes(genreTrim)

    return matchQuery && matchGenre
  })

  const totalPages = Math.max(1, Math.ceil(filteredMovies.length / ITEMS_PER_PAGE))
  const paginatedMovies = filteredMovies.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const handleSearchChange = (value) => {
    setSearchQuery(value)
    setCurrentPage(1)
  }

  const handleGenreChange = (value) => {
    setSelectedGenre(value)
    setCurrentPage(1)
  }

  const handlePageChange = (newPage) => {
    setCurrentPage(Math.max(1, Math.min(totalPages, newPage)))
  }

  return (
    <div className="min-h-screen bg-[#2E4863] text-white">
      <div className="max-w-[1000px] mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-semibold text-[#E4D161]">Manage Movies</h1>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Search */}
            <div className="relative flex-1 md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Tìm kiếm theo tên phim..."
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#1B2A36] border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E4D161] focus:border-transparent text-sm"
              />
            </div>

            {/* Genre Filter */}
            <div className="relative">
              <select
                value={selectedGenre}
                onChange={(e) => handleGenreChange(e.target.value)}
                className="appearance-none bg-[#1B2A36] border border-white/10 rounded-lg px-4 py-2 pr-8 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#E4D161] cursor-pointer"
              >
                <option value="">Thể loại: Tất cả</option>
                {GENRE_OPTIONS.map(genre => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Add Movie Button */}
            <button
              onClick={handleOpenAddMovie}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#E4D161] text-[#2E4863] rounded-lg font-semibold hover:bg-[#d4c151] transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4" /> Thêm phim
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#1B2A36] rounded-xl border border-white/10 overflow-hidden">
          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-10 h-10 border-4 border-[#E4D161] border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-400 mt-3">Đang tải...</p>
            </div>
          )}

          {!loading && (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto border-collapse">
                  <thead>
                    <tr className="text-sm text-[#E4D161] border-b border-white/10 bg-white/5">
                      <th className="px-4 py-3 text-left font-semibold">STT</th>
                      <th className="px-4 py-3 text-left font-semibold">Hình ảnh</th>
                      <th className="px-4 py-3 text-left font-semibold">Tên phim</th>
                      <th className="px-4 py-3 text-left font-semibold hidden lg:table-cell">Thể loại</th>
                      <th className="px-4 py-3 text-left font-semibold w-20 hidden sm:table-cell">Năm</th>
                      <th className="px-4 py-3 text-left font-semibold">Phụ đề</th>
                      <th className="px-4 py-3 text-center font-semibold w-36">Hành động</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedMovies.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-4 py-12 text-center text-gray-400">
                          Không tìm thấy phim nào.
                        </td>
                      </tr>
                    ) : (
                      paginatedMovies.map((movie, index) => (
                        <tr
                          key={movie._id || movie.id}
                          className="border-b border-white/5 hover:bg-white/5 transition-colors"
                        >
                          <td className="px-4 py-3 text-sm text-gray-300">
                            {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                          </td>
                          <td className="px-4 py-3">
                            <div className="h-14 w-24 bg-white/5 rounded-lg overflow-hidden flex items-center justify-center border border-white/10">
                              {movie.thumb_url ? (
                                <img
                                  src={movie.thumb_url}
                                  alt={movie.title}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <Image className="w-6 h-6 text-gray-500" />
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-white font-medium">{movie.title}</td>
                          <td className="px-4 py-3 hidden lg:table-cell text-gray-300">{movie.genre}</td>
                          <td className="px-4 py-3 hidden sm:table-cell text-gray-300">
                            {movie.year_released}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => handleOpenSubtitleModal(movie)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 rounded-lg text-xs font-medium text-green-400 transition-colors"
                              title="Tải lên phụ đề (.srt)"
                            >
                              <FilePlus2 className="w-3.5 h-3.5" /> Tải phụ đề
                            </button>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="inline-flex items-center gap-2">
                              <button
                                onClick={() => handleOpenEditMovie(movie)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-lg text-xs font-medium text-blue-400 transition-colors"
                              >
                                <Edit2 className="w-3.5 h-3.5" /> Sửa
                              </button>
                              <button
                                onClick={() => handleOpenDeleteConfirm(movie)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-xs font-medium text-red-400 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Xóa
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="p-4 border-t border-white/10 flex items-center justify-between text-sm text-gray-400">
                  <div>
                    Hiển thị <strong className="text-white">{filteredMovies.length}</strong> kết quả
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage <= 1}
                      className="p-2 rounded-lg bg-white/5 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors border border-white/10"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <div className="px-3 py-1.5 bg-white/5 rounded-lg text-white border border-white/10">
                      {currentPage} / {totalPages}
                    </div>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= totalPages}
                      className="p-2 rounded-lg bg-white/5 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors border border-white/10"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      <MovieModalNew
        open={showMovieModal}
        initial={editingMovie}
        onSave={handleSaveMovie}
        onClose={handleCloseMovieModal}
      />

      <UploadSubtitleModal
        isOpen={showSubtitleModal}
        onClose={handleCloseSubtitleModal}
        movie={subtitleMovie}
      />

      <ConfirmDialog
        open={showConfirmDelete}
        title="Xác nhận xóa phim"
        message={`Bạn có chắc chắn muốn xóa phim "${movieToDelete?.title}"?\n\nHành động này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  )
}

export default ManagerMovie