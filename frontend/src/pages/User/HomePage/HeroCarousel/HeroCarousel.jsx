import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Play } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const HeroCarousel = ({ mostMovies }) => {
  const navigate = useNavigate()
  const slides =
    mostMovies && mostMovies.length > 0
      ? mostMovies.map((movie) => ({
          id: movie._id,
          title: movie.title,
          description: movie.description || '',
          img: movie.poster_url || '',
        }))
      : [
          { id: 1, title: 'Catman 2: The Villain Returns', description: 'The story continues...', img: '/assets/hero-cat.jpg' },
          { id: 2, title: 'Dog Days', description: 'A light comedy', img: '/assets/hero-dog.jpg' },
        ]

  const [index, setIndex] = useState(0)
  const timer = useRef(null)

  const startTimer = () => {
    clearInterval(timer.current)
    timer.current = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length)
    }, 4500)
  }
  
  useEffect(() => {
    startTimer()
    return () => clearInterval(timer.current)
  }, [slides.length, startTimer])

  const prev = () => {
    setIndex((i) => (i - 1 + slides.length) % slides.length)
    startTimer()
  }

  const next = () => {
    setIndex((i) => (i + 1) % slides.length)
    startTimer()
  }

  if (!slides.length) return null

  return (
    <div className="relative h-[550px] overflow-hidden shadow-2xl bg-[#020202] rounded-b-2xl">
      {slides.map((s, i) => (
        <div
          key={s.id}
          className={`absolute inset-0 transition-all duration-700 ${
            i === index ? 'opacity-100 z-10 scale-100' : 'opacity-0 z-0 scale-105'
          }`}
        >
          <div
            className="absolute inset-0 bg-cover bg-center pointer-events-none"
            style={{ backgroundImage: `url(${s.img})`, filter: 'brightness(.5) contrast(1.05)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent pointer-events-none" />
          <div className="relative z-20 h-full flex items-center">
            <div className="ml-6 md:ml-16 max-w-[720px] px-4 md:px-8">
              <p className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 leading-tight" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.8)' }}>
                {s.title}
              </p>
              <p className="text-sm md:text-base text-gray-200 max-w-xl mb-6 line-clamp-3 leading-relaxed" style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.7)' }}>
                {s.description}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => navigate(`/movie/${s.id}`)}
                  className="group inline-flex items-center gap-2 px-6 py-3 bg-[#E4D161] hover:bg-[#d4c451] text-black rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <Play className="w-5 h-5 fill-black group-hover:scale-110 transition-transform" />
                  Watch now
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Nút chuyển slide */}
      <button
        onClick={prev}
        aria-label="Prev"
        className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 items-center justify-center w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-all duration-300 z-30 group"
      >
        <ChevronLeft className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
      </button>

      <button
        onClick={next}
        aria-label="Next"
        className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 items-center justify-center w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-all duration-300 z-30 group"
      >
        <ChevronRight className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
      </button>

      {/* Chấm chuyển slide */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-6 flex items-center gap-2 z-30">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setIndex(i)
              startTimer()
            }}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === index 
                ? 'w-8 bg-[#E4D161] scale-110' 
                : 'w-2 bg-white/60 hover:bg-white/80'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

export default HeroCarousel
