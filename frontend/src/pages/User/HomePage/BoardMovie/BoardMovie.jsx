import { useMemo, useState } from "react"
import { Link } from "react-router"
import { Play } from "lucide-react"
import Pagination from "@/components/Pagination/Pagination"

const ITEMS_PER_PAGE = 10

const BoardMovie = ({ movieBuffer, loading = false }) => {
  const rawSource = movieBuffer?.length ? movieBuffer : []

  // Filters
  const [levelFilter, setLevelFilter] = useState("all")
  const [genreFilter, setGenreFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)

  // Áp filter lên rawSource
  const filtered = useMemo(() => {
    const lf = (levelFilter || "all").toLowerCase()
    const gf = (genreFilter || "all").toLowerCase()
    return rawSource.filter((m) => {
      if (!m) return false
      if (lf !== "all") {
        const movieLevel = (m.level || "").toString().toLowerCase()
        if (movieLevel !== lf) return false
      }
      if (gf !== "all") {
        const movieGenre = (m.genre || "").toString().toLowerCase()
        if (!movieGenre.includes(gf)) return false
      }
      return true
    })
  }, [rawSource, levelFilter, genreFilter])

  // Reset về trang 1 khi filter thay đổi
  useMemo(() => {
    setCurrentPage(1)
  }, [levelFilter, genreFilter])

  // Tính toán phân trang
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginatedMovies = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filtered.slice(start, start + ITEMS_PER_PAGE)
  }, [filtered, currentPage])

  if (loading) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 py-6">
        <div className="text-center py-12 text-gray-400">Đang tải phim...</div>
      </div>
    )
  }

  if (!movieBuffer || movieBuffer.length === 0) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 py-6">
        <div className="text-center py-12 text-gray-400">Không có phim nào.</div>
      </div>
    )
  }

  return (
    <div className="mt-2 px-4 bg-[#1D2732] rounded-b-2xl p-4">
      {/* Header: tổng số & bộ lọc */}
      <div className="flex justify-between items-center px-2 md:px-4">
        <p className="text-[#E4D161] text-lg md:text-2xl font-semibold tracking-wide">
          Danh sách phim ({filtered.length})
        </p>

        <div className="flex items-center gap-4">
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="mt-2 p-2 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-[#E4D161]"
          >
            <option value="all">Tất cả mức độ</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          <select
            value={genreFilter}
            onChange={(e) => setGenreFilter(e.target.value)}
            className="mt-2 p-2 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-[#E4D161]"
          >
            <option value="all">Tất cả thể loại</option>
            <option value="hành động">Hành Động</option>
            <option value="phiêu lưu">Phiêu Lưu</option>
            <option value="viễn tưởng">Viễn Tưởng</option>
            <option value="khoa học">Khoa Học</option>
            <option value="võ thuật">Võ Thuật</option>
          </select>
        </div>
      </div>

      {/* Danh sách phim */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mt-4">
        {paginatedMovies.length === 0 ? (
          <div className="col-span-full text-center text-white">Không tìm thấy phim phù hợp.</div>
        ) : (
          paginatedMovies.map((movie) => (
            <Link
              to={`/movie/${movie._id}`}
              key={movie._id}
              className="group relative overflow-hidden rounded-xl shadow-lg bg-gradient-to-b from-[#2E4863] to-[#1D2732] cursor-pointer no-underline transition-transform duration-300 hover:scale-105 hover:shadow-2xl"
            >
              {/* Thumbnail */}
              <div className="relative w-full h-48 overflow-hidden">
                <img
                  src={movie.thumb_url || "/assets/default-movie.png"}
                  alt={movie.slug || movie.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Play icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-[#E4D161]/90 flex items-center justify-center opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 shadow-lg">
                    <Play className="w-6 h-6 text-black fill-black ml-0.5" />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                {/* Title */}
                <h2 className="text-white text-sm font-bold mb-2 line-clamp-2 min-h-[40px] leading-tight group-hover:text-[#E4D161] transition-colors">
                  {movie.title}
                </h2>
                
                {/* Genres */}
                {movie.genre && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {movie.genre.split(',').slice(0, 3).map((g, idx) => (
                      <span 
                        key={idx}
                        className="px-2 py-0.5 bg-[#E4D161]/10 text-[#E4D161] text-[10px] font-medium rounded border border-[#E4D161]/30"
                      >
                        {g.trim()}
                      </span>
                    ))}
                  </div>
                )}
                
                {/* Year and Level */}
                <div className="flex items-center justify-between gap-2">
                  <div className="px-2.5 py-1 bg-gray-700/30 rounded text-xs text-gray-300 font-medium">
                    {movie.year_released || 'N/A'}
                  </div>
                  <div className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    movie.level?.toLowerCase() === 'easy' ? 'bg-green-600/20 text-green-300' :
                    movie.level?.toLowerCase() === 'medium' ? 'bg-yellow-600/20 text-yellow-300' :
                    movie.level?.toLowerCase() === 'hard' ? 'bg-red-600/20 text-red-300' :
                    'bg-gray-600/20 text-gray-300'
                  }`}>
                    {movie.level || 'N/A'}
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Pagination */}
      {filtered.length > 0 && (
        <Pagination 
          currentPage={currentPage} 
          totalPages={totalPages} 
          onPageChange={setCurrentPage} 
        />
      )}
    </div>
  )
}

export default BoardMovie
