import { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, Image, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { toast } from 'sonner'
import MovieModalNew from './MovieModal/MovieModalNew'
import UploadSubtitleModal from './UploadSubtitleModal/UploadSubtitleModal.jsx'
import { FilePlus2 } from 'lucide-react'
import { fetchMoviesApi, deleteMovieApi } from '@/api'

const ManagerMovie = () => {
  const [movieBuffer, setMovieBuffer] = useState([])
  const [q, setQ] = useState('')
  const [genre, setGenre] = useState('')
  const [page, setPage] = useState(1)
  const perPage = 10

  const [showModal, setShowModal] = useState(false)
  const [editMovie, setEditMovie] = useState(null)

  const [showSubModal, setShowSubModal] = useState(false)
  const [subMovie, setSubMovie] = useState(null)

  useEffect(() => {
    fetchMovies();
  }, [])

  const fetchMovies = async () => {
    const data = await fetchMoviesApi();
    setMovieBuffer(data);
  }

  const openUploadSubtitle = (movie) => {
    setSubMovie(movie)
    setShowSubModal(true)
  }

  // Xóa movie theo id
  const handleDeleteMovie = async (id) => {
    if (!id) return
    await deleteMovieApi(id)
    toast.success('Xóa phim thành công')
    await fetchMovies()
  }

  // Mở modal sửa movie
  const openEdit = (movie) => {
    setEditMovie(movie)
    setShowModal(true)
  }

  const filtered = movieBuffer.filter(m => {
    const title = (m.title || '').toLowerCase()
    const genres = (m.genre || '').toLowerCase()
    const qTrim = q.trim().toLowerCase()
    const genreTrim = genre.trim().toLowerCase()

    const matchQ = qTrim === '' || title.includes(qTrim)
    const matchGenre = genreTrim === '' || genres.includes(genreTrim)

    return matchQ && matchGenre
  })

  const paged = filtered.slice((page - 1) * perPage, page * perPage)
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))

  return (
    <div className="min-h-screen bg-[#2E4863] text-white">
      {/* Board Manage Movie */}
      <div className="max-w-[1200px] mx-auto px-4 py-6">
        {/* Header Board */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
          <h1 className="text-2xl font-semibold text-[#E4D161]">Manage Movies</h1>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={q}
                onChange={(e) => { setQ(e.target.value); setPage(1) }}
                placeholder="Tìm kiếm theo tên phim..."
                className="w-full pl-9 pr-3 py-2 rounded-md bg-gray-900/40 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E4D161] focus:border-transparent"
              />
            </div>

            <select
              value={genre}
              onChange={(e) => { setGenre(e.target.value); setPage(1) }}
              className="bg-gray-900/40 border border-gray-700 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E4D161] focus:border-transparent cursor-pointer [&>option]:bg-gray-800 [&>option]:text-white"
            >
              <option value="">Thể loại: Tất cả</option>
              <option>Hành Động</option>
              <option>Phiêu Lưu</option>
              <option>Viễn Tưởng</option>
              <option>Khoa Học</option>
              <option>Võ Thuật</option>
            </select>

            <button
              onClick={() => {
                setEditMovie(null)
                setShowModal(true)
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#E4D161] text-black rounded-md font-semibold shadow hover:opacity-95"
            >
              <Plus className="w-4 h-4" /> Add movie
            </button>
          </div>
        </div>

        {/* Table Movie */}
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
                {paged.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-gray-400">
                      Không tìm thấy phim nào.
                    </td>
                  </tr>
                ) : paged.map((m, idx) => (
                  <tr key={m._id || m.id} className="border-b border-gray-800/70 hover:bg-gray-900/60 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-200">{(page - 1) * perPage + idx + 1}</td>
                    <td className="px-4 py-3">
                      <div className="h-14 w-24 bg-gray-800 rounded overflow-hidden flex items-center justify-center">
                        {m.thumb_url ? (
                          <img src={m.thumb_url} alt={m.title} className="h-full w-full object-cover" />
                        ) : (
                          <Image className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-100 font-medium">{m.title}</td>
                    <td className="px-4 py-3 hidden lg:table-cell text-gray-200">{m.genre}</td>
                    <td className="px-4 py-3 hidden sm:table-cell text-gray-200">{m.year_released}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => openUploadSubtitle(m)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 rounded text-xs font-medium text-white"
                        title="Tải lên phụ đề (.srt)"
                      >
                        <FilePlus2 className="w-4 h-4" /> Tải phụ đề
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button onClick={() => openEdit(m)} className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-700 hover:bg-blue-600 rounded text-xs font-medium text-white">
                          <Edit2 className="w-4 h-4" /> Sửa
                        </button>
                        <button
                          onClick={() => handleDeleteMovie(m._id || m.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-red-700 hover:bg-red-600 rounded text-xs font-medium text-white"
                        >
                          <Trash2 className="w-4 h-4" /> Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
            <div>Hiển thị <strong className="text-gray-200">{filtered.length}</strong> kết quả</div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-2 py-1 rounded-md bg-gray-700/60 text-white disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="px-3 py-1 bg-gray-800 rounded-md text-white">{page} / {totalPages}</div>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-2 py-1 rounded-md bg-gray-700/60 text-white disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Movie Modal component */}
      <MovieModalNew
        open={showModal}
        initial={editMovie}
        onSave={async () => {
          // refresh list after modal saved (create/update)
          await fetchMovies()
          setShowModal(false)
          setEditMovie(null)
        }}
        onClose={() => {
          setShowModal(false)
          setEditMovie(null)
        }}
      />
      {/* Upload Subtitle Modal */}
      <UploadSubtitleModal
        isOpen={showSubModal}
        onClose={() => { setShowSubModal(false); setSubMovie(null) }}
        movie={subMovie}
      />
    </div>
  )
}

export default ManagerMovie