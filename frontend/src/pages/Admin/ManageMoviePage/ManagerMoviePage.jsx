import { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, Image, ChevronLeft, ChevronRight, Search, FilePlus2 } from 'lucide-react'
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
      const data = await fetchMoviesApi()
      setMovieBuffer(toArray(data))
    } catch (error) {
      console.error('Error fetching movies:', error)
      toast.error('Không thể tải danh sách phim')
      setMovieBuffer([])
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
      <div className="max-w-[1200px] mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
          <h1 className="text-2xl font-semibold text-[#E4D161]">Manage Movies</h1>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Search */}
            <div className="relative flex-1 md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Tìm kiếm theo tên phim..."
                className="w-full pl-9 pr-3 py-2 rounded-md bg-gray-900/40 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E4D161] focus:border-transparent"
              />
            </div>

            {/* Genre Filter */}
            <select
              value={selectedGenre}
              onChange={(e) => handleGenreChange(e.target.value)}
              className="bg-gray-900/40 border border-gray-700 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E4D161] focus:border-transparent cursor-pointer [&>option]:bg-gray-800 [&>option]:text-white"
            >
              <option value="">Thể loại: Tất cả</option>
              {GENRE_OPTIONS.map(genre => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>

            {/* Add Movie Button */}
            <button
              onClick={handleOpenAddMovie}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#E4D161] text-black rounded-md font-semibold shadow hover:opacity-95 transition-opacity"
            >
              <Plus className="w-4 h-4" /> Add movie
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-gray-900/40 rounded-lg p-4">
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse">
              <thead>
                <tr className="border-b border-gray-800 text-sm text-gray-300">
                  <th className="px-4 py-3">STT</th>
                  <th className="px-4 py-3">Hình ảnh</th>
                  <th className="px-4 py-3">Tên phim</th>
                  <th className="px-4 py-3 hidden lg:table-cell">Thể loại</th>
                  <th className="px-4 py-3 w-20 hidden sm:table-cell">Năm</th>
                  <th className="px-4 py-3">Phụ đề</th>
                  <th className="px-4 py-3 w-36 text-center">Hành động</th>
                </tr>
              </thead>

              <tbody>
                {paginatedMovies.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-gray-400">
                      Không tìm thấy phim nào.
                    </td>
                  </tr>
                ) : (
                  paginatedMovies.map((movie, index) => (
                    <tr
                      key={movie._id || movie.id}
                      className="border-b border-gray-800/70 hover:bg-gray-900/60 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm text-gray-200">
                        {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-14 w-24 bg-gray-800 rounded overflow-hidden flex items-center justify-center">
                          {movie.thumb_url ? (
                            <img
                              src={movie.thumb_url}
                              alt={movie.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Image className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-100 font-medium">{movie.title}</td>
                      <td className="px-4 py-3 hidden lg:table-cell text-gray-200">{movie.genre}</td>
                      <td className="px-4 py-3 hidden sm:table-cell text-gray-200">
                        {movie.year_released}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleOpenSubtitleModal(movie)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 rounded text-xs font-medium text-white transition-colors"
                          title="Tải lên phụ đề (.srt)"
                        >
                          <FilePlus2 className="w-4 h-4" /> Tải phụ đề
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => handleOpenEditMovie(movie)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-700 hover:bg-blue-600 rounded text-xs font-medium text-white transition-colors"
                          >
                            <Edit2 className="w-4 h-4" /> Sửa
                          </button>
                          <button
                            onClick={() => handleOpenDeleteConfirm(movie)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-red-700 hover:bg-red-600 rounded text-xs font-medium text-white transition-colors"
                          >
                            <Trash2 className="w-4 h-4" /> Xóa
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
          <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
            <div>
              Hiển thị <strong className="text-gray-200">{filteredMovies.length}</strong> kết quả
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="px-2 py-1 rounded-md bg-gray-700/60 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="px-3 py-1 bg-gray-800 rounded-md text-white">
                {currentPage} / {totalPages}
              </div>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="px-2 py-1 rounded-md bg-gray-700/60 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
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