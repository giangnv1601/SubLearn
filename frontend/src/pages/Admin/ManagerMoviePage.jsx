import { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, Image, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import MovieModal from '../../components/MovieModal'

import UploadSubtitleModal from '../../components/Subtitles/UploadSubtitleModal'
import { FilePlus2 } from 'lucide-react'
import { fetchMoviesApi, createMovieApi, updateMovieApi, deleteMovieApi } from '../../api'

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
  // callback sau khi upload thành công để refresh
  const handleUploaded = async () => {
    await fetchMovies()
  }

  // Tạo movie mới
  const handleCreateMovie = async (payload) => {
    await createMovieApi(payload)
    await fetchMovies()
  }

  // Cập nhật movie
  const handleUpdateMovie = async (payload) => {
    const id = payload._id || payload.id
    if (!id) {
      toast.error('Missing movie id for update')
      return
    }
    const body = { ...payload }
    delete body._id
    await updateMovieApi(id, body)
    await fetchMovies()
  }

  // Xóa movie theo id
  const handleDeleteMovie = async (id) => {
    if (!id) return
    await deleteMovieApi(id)
    toast.success('Movie deleted successfully')
    await fetchMovies()
  }

  // Open edit modal and set the movie to be edited
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

    // Nếu user không chọn genre -> match all
    // Nếu chọn, kiểm tra xem chuỗi genre của phim có chứa string đã chọn (case-insensitive)
    // (thích hợp khi một phim có nhiều thể loại, ví dụ "Action, Drama")
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
            <div className="relative w-full md:w-72">
              <input
                value={q}
                onChange={(e) => { setQ(e.target.value); setPage(1) }}
                placeholder="Search by title..."
                className="w-full pl-10 pr-3 py-2 rounded-md bg-gray-700 placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-[#E4D161]/40"
              />
            </div>

            <select
              value={genre}
              onChange={(e) => { setGenre(e.target.value); setPage(1) }}
              className="bg-gray-700 text-white px-3 py-2 rounded-md focus:outline-none"
            >
              <option value="">All genres</option>
              <option>Hành Động</option>
              <option>Phiêu Lưu</option>
              <option>Viễn Tưởng</option>
              <option>Khoa Học</option>
              <option>Võ Thuật</option>
            </select>

            <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-[#E4D161] text-black rounded-md font-semibold shadow hover:opacity-95">
              <Plus className="w-4 h-4" /> Add movie
            </button>
          </div>
        </div>

        {/* Table Movie */}
        <div className="bg-gray-900/40 rounded-lg p-4">
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse">
              <thead>
                <tr className="text-left text-sm text-gray-300/90">
                  <th className="px-4 py-3">Stt</th>
                  <th className="px-4 py-3">Thumbnail</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3 hidden lg:table-cell">Genre</th>
                  <th className="px-4 py-3 w-20 hidden sm:table-cell">Year</th>
                  <th className="px-4 py-3">Subtitle</th>
                  <th className="px-4 py-3 w-36 text-center">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-700">
                {paged.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-gray-400">
                      No movies found. Click "Add movie" to create one.
                    </td>
                  </tr>
                ) : paged.map((m, idx) => (
                  <tr key={m._id || m.id} className="hover:bg-gray-800">
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
                    <td className="px-4 py-3 hidden sm:table-cell text-gray-200">{m.year}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => openUploadSubtitle(m)}
                        className="px-3 py-1.5 text-sm rounded-md bg-emerald-500 hover:bg-emerald-600 text-white inline-flex items-center gap-2"
                        title="Upload subtitle (.srt)"
                      >
                        <FilePlus2 className="w-4 h-4" />
                        Upload .srt
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button onClick={() => openEdit(m)} className="px-3 py-1 text-sm rounded-md bg-blue-600 hover:bg-blue-700 text-white inline-flex items-center gap-2">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteMovie(m._id || m.id)}
                          className="px-3 py-1 text-sm rounded-md bg-red-600 hover:bg-red-700 text-white inline-flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
            <div>Showing <strong className="text-gray-200">{filtered.length}</strong> result(s)</div>
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
      <MovieModal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditMovie(null) }}
        handleCreateMovie={handleCreateMovie}
        handleUpdateMovie={handleUpdateMovie}
        handleDeleteMovie={async (id) => { await handleDeleteMovie(id); setEditMovie(null) }}
        initialData={editMovie}
      />
      {/* Upload Subtitle Modal */}
      <UploadSubtitleModal
        isOpen={showSubModal}
        onClose={() => { setShowSubModal(false); setSubMovie(null) }}
        movie={subMovie}
        onUploaded={handleUploaded}
      />
    </div>
  )
}

export default ManagerMovie