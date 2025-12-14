import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router"
import { Play } from "lucide-react"

const PAGE_SIZE = 20

const BoardMovie = ({ movies = [], movieBuffer = [], totalMovies: totalMoviesProp }) => {
  // Back-compat: nếu bạn vẫn truyền movieBuffer, ưu tiên nó; còn không thì dùng movies
  const rawSource = movieBuffer?.length ? movieBuffer : movies

  // Filters
  const [levelFilter, setLevelFilter] = useState("all")
  const [genreFilter, setGenreFilter] = useState("all")

  const [currentPage, setCurrentPage] = useState(1)

  // Reset về trang 1 khi dữ liệu nguồn hoặc filter thay đổi
  useEffect(() => {
    setCurrentPage(1)
  }, [rawSource, levelFilter, genreFilter])

  // Áp filter lên rawSource
  const source = useMemo(() => {
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

  const totalMovies = typeof totalMoviesProp === "number" ? totalMoviesProp : source.length

  const totalPages = Math.max(1, Math.ceil(totalMovies / PAGE_SIZE))

  const pageItems = useMemo(() => {
    // Nếu bạn đã gọi API phía server trả đúng 20 item theo page,
    // chỉ cần truyền mảng 20 phần tử vào `movies` và set `totalMovies`.
    // Ở chế độ client-side dưới đây, ta tự slice từ `source`.
    const start = (currentPage - 1) * PAGE_SIZE
    const end = start + PAGE_SIZE
    return source.slice(start, end)
  }, [source, currentPage])

  const gotoPage = (p) => {
    if (p < 1 || p > totalPages) return
    setCurrentPage(p)
  }

  // Tạo dãy số trang ngắn gọn: 1 ... prev, current, next ... last
  const renderPages = () => {
    const pages = []
    const add = (n) =>
      pages.push(
        <button
          key={n}
          onClick={() => gotoPage(n)}
          className={`px-3 py-1 rounded-lg text-sm ${
            n === currentPage
              ? "bg-[#E4D161] text-black font-semibold"
              : "bg-gray-700 text-white hover:bg-gray-600"
          }`}
        >
          {n}
        </button>
      )

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) add(i)
    } else {
      add(1)
      if (currentPage > 3) pages.push(<span key="l-ell" className="px-2 text-gray-300">…</span>)
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)
      for (let i = start; i <= end; i++) add(i)
      if (currentPage < totalPages - 2) pages.push(<span key="r-ell" className="px-2 text-gray-300">…</span>)
      add(totalPages)
    }
    return pages
  }

  return (
    <div className="mt-2 px-4 bg-[#1D2732] rounded-b-2xl p-4">
      {/* Header: tổng số & bộ lọc */}
      <div className="flex justify-between items-center px-2 md:px-4">
        <p className="text-[#E4D161] text-lg md:text-2xl font-semibold tracking-wide">
          Đang có {totalMovies} movies
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
        {pageItems.length === 0 ? (
          <div className="col-span-full text-center text-white">No movies found.</div>
        ) : (
          pageItems.map((movie) => (
            <Link
              to={`/movie/${movie._id}`}
              key={movie._id}
              className="group relative overflow-hidden rounded-lg shadow-md bg-[#2E4863] cursor-pointer no-underline"
            >
              <img
                src={movie.thumb_url || "/assets/default-movie.png"}
                alt={movie.slug || movie.title}
                className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />

              {/* Overlay hover */}
              <div className="absolute inset-0 bg-black/0 transition-colors duration-200 group-hover:bg-black/40" />

              {/* Play icon */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <Play className="w-12 h-12 text-transparent stroke-[#E4D161] stroke-2 bg-black/0 rounded-full p-1 opacity-0 transform scale-90 transition-all duration-200 group-hover:opacity-100 group-hover:scale-100" />
              </div>

              <div className="p-3">
                <h2 className="text-white text-base font-semibold mb-1 text-center line-clamp-2">
                  {movie.title}
                </h2>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Phân trang */}
      {totalPages > 1 && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={() => gotoPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded-lg text-sm bg-gray-700 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-600"
          >
            Previous
          </button>

          {renderPages()}

          <button
            onClick={() => gotoPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded-lg text-sm bg-gray-700 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-600"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default BoardMovie
