import { useEffect, useState, useRef, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Play } from 'lucide-react'
import Pagination from '@/components/Pagination/Pagination'
import { fetchMoviesApi } from '@/api'

const ITEMS_PER_PAGE = 10

const capitalizeFirstLetter = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

const HomePage = () => {
  const navigate = useNavigate()

  const [movieBuffer, setMovieBuffer] = useState([])
  const [loading, setLoading] = useState(false)

  // Hero Carousel state
  const [carouselIndex, setCarouselIndex] = useState(0)
  const carouselTimer = useRef(null)

  // Filters & Pagination
  const [levelFilter, setLevelFilter] = useState('all')
  const [genreFilter, setGenreFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    fetchMovies()
  }, [])

  // Auto-play carousel
  useEffect(() => {
    if (movieBuffer.length === 0) return

    const startTimer = () => {
      clearInterval(carouselTimer.current)
      carouselTimer.current = setInterval(() => {
        setCarouselIndex((i) => (i + 1) % Math.min(10, movieBuffer.length))
      }, 4500)
    }

    startTimer()
    return () => clearInterval(carouselTimer.current)
  }, [movieBuffer.length])

  const fetchMovies = async () => {
    setLoading(true)
    try {
      const data = await fetchMoviesApi()
      setMovieBuffer(data || [])
    } catch (error) {
      console.error('Failed to fetch movies:', error)
      setMovieBuffer([])
    } finally {
      setLoading(false)
    }
  }

  // CAROUSEL HANDLERS
  const startCarouselTimer = () => {
    clearInterval(carouselTimer.current)
    carouselTimer.current = setInterval(() => {
      setCarouselIndex((i) => (i + 1) % Math.min(10, movieBuffer.length))
    }, 4500)
  }

  const handlePrevSlide = () => {
    setCarouselIndex((i) => (i - 1 + Math.min(10, movieBuffer.length)) % Math.min(10, movieBuffer.length))
    startCarouselTimer()
  }

  const handleNextSlide = () => {
    setCarouselIndex((i) => (i + 1) % Math.min(10, movieBuffer.length))
    startCarouselTimer()
  }

  const handleDotClick = (index) => {
    setCarouselIndex(index)
    startCarouselTimer()
  }

  // COMPUTED VALUES
  // Top 10 movies for carousel
  const carouselSlides = useMemo(() => {
    if (!movieBuffer.length) {
      return [
        { id: 1, title: 'Catman 2: The Villain Returns', description: 'The story continues...', img: '/assets/hero-cat.jpg' },
        { id: 2, title: 'Dog Days', description: 'A light comedy', img: '/assets/hero-dog.jpg' },
      ]
    }
    return movieBuffer.slice(0, 10).map((movie) => ({
      id: movie._id,
      title: movie.title,
      description: movie.description || '',
      img: movie.poster_url || '',
    }))
  }, [movieBuffer])

  // Filtered movies
  const filteredMovies = useMemo(() => {
    if (!movieBuffer.length) return []

    const lf = (levelFilter || 'all').toLowerCase()
    const gf = (genreFilter || 'all').toLowerCase()

    return movieBuffer.filter((m) => {
      if (!m) return false
      
      if (lf !== 'all') {
        const movieLevel = (m.level || '').toString().toLowerCase()
        if (movieLevel !== lf) return false
      }
      
      if (gf !== 'all') {
        const movieGenre = (m.genre || '').toString().toLowerCase()
        if (!movieGenre.includes(gf)) return false
      }
      
      return true
    })
  }, [movieBuffer, levelFilter, genreFilter])

  // Pagination
  const totalPages = Math.ceil(filteredMovies.length / ITEMS_PER_PAGE)
  
  const paginatedMovies = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredMovies.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredMovies, currentPage])

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [levelFilter, genreFilter])

  return (
    <div>
      {/* Hero Carousel */}
      <div className="relative h-[550px] overflow-hidden shadow-2xl bg-[#020202] rounded-b-2xl">
        {carouselSlides.map((slide, i) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-700 ${
              i === carouselIndex ? 'opacity-100 z-10 scale-100' : 'opacity-0 z-0 scale-105'
            }`}
          >
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center pointer-events-none"
              style={{ 
                backgroundImage: `url(${slide.img})`, 
                filter: 'brightness(.5) contrast(1.05)' 
              }}
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent pointer-events-none" />
            
            {/* Content */}
            <div className="relative z-20 h-full flex items-center">
              <div className="ml-6 md:ml-16 max-w-[720px] px-4 md:px-8">
                <p 
                  className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 leading-tight" 
                  style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.8)' }}
                >
                  {slide.title}
                </p>
                <p 
                  className="text-sm md:text-base text-gray-200 max-w-xl mb-6 line-clamp-3 leading-relaxed" 
                  style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.7)' }}
                >
                  {slide.description}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => navigate(`/client/video/${slide.id}`)}
                    className="group inline-flex items-center gap-2 px-6 py-3 bg-[#E4D161] hover:bg-[#d4c451] text-black rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <Play className="w-5 h-5 fill-black group-hover:scale-110 transition-transform" />
                    Xem ngay
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Previous Button */}
        <button
          onClick={handlePrevSlide}
          aria-label="Previous slide"
          className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 items-center justify-center w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-all duration-300 z-30 group"
        >
          <ChevronLeft className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
        </button>

        {/* Next Button */}
        <button
          onClick={handleNextSlide}
          aria-label="Next slide"
          className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 items-center justify-center w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-all duration-300 z-30 group"
        >
          <ChevronRight className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
        </button>

        {/* Dots Navigation */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-6 flex items-center gap-2 z-30">
          {carouselSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => handleDotClick(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === carouselIndex 
                  ? 'w-8 bg-[#E4D161] scale-110' 
                  : 'w-2 bg-white/60 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Movie Board */}
      <div className="mt-2 px-4 bg-[#1D2732] rounded-b-2xl p-4">
        {/* Loading State */}
        {loading && (
          <div className="text-center py-12 text-gray-400">Đang tải phim...</div>
        )}

        {/* Empty State */}
        {!loading && movieBuffer.length === 0 && (
          <div className="text-center py-12 text-gray-400">Không có phim nào.</div>
        )}

        {/* Movies Content */}
        {!loading && movieBuffer.length > 0 && (
          <>
            {/* Header with Filters */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-2 md:px-4 mb-4">
              <p className="text-[#E4D161] text-lg md:text-2xl font-semibold tracking-wide">
                Danh sách phim ({filteredMovies.length})
              </p>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                {/* Level Filter */}
                <select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  className="flex-1 sm:flex-none p-2 rounded-md bg-gray-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#E4D161]"
                >
                  <option value="all">Tất cả mức độ</option>
                  <option value="easy">Dễ</option>
                  <option value="medium">Trung bình</option>
                  <option value="hard">Khó</option>
                </select>

                {/* Genre Filter */}
                <select
                  value={genreFilter}
                  onChange={(e) => setGenreFilter(e.target.value)}
                  className="flex-1 sm:flex-none p-2 rounded-md bg-gray-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#E4D161]"
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

            {/* Movie Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {paginatedMovies.length === 0 ? (
                <div className="col-span-full text-center text-white py-8">
                  Không tìm thấy phim phù hợp.
                </div>
              ) : (
                paginatedMovies.map((movie) => (
                  <Link
                    to={`/client/video/${movie._id}`}
                    key={movie._id}
                    className="group relative overflow-hidden rounded-xl shadow-lg bg-gradient-to-b from-[#2E4863] to-[#1D2732] cursor-pointer no-underline transition-transform duration-300 hover:scale-105 hover:shadow-2xl"
                  >
                    {/* Thumbnail */}
                    <div className="relative w-full h-48 overflow-hidden">
                      <img
                        src={movie.thumb_url || '/assets/default-movie.png'}
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
                          {capitalizeFirstLetter(movie.level) || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>

            {/* Pagination */}
            {filteredMovies.length > 0 && (
              <Pagination 
                currentPage={currentPage} 
                totalPages={totalPages} 
                onPageChange={setCurrentPage} 
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default HomePage
