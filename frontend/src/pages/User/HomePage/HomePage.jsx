import { useEffect, useState } from 'react'
import HeroCarousel from './HeroCarousel/HeroCarousel'
import BoardMovie from './BoardMovie/BoardMovie'
import { fetchMoviesApi } from '@/api'

const HomePage = () => {
  const [movieBuffer, setMovieBuffer] = useState([])
  const [mostMovies, setMostMovies] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchMovies()
  }, [])

  const fetchMovies = async () => {
    setLoading(true)
    try {
      const data = await fetchMoviesApi()
      const mostMovies = data.slice(0, 10)
      setMovieBuffer(data)
      setMostMovies(mostMovies)
    } catch (error) {
      console.error('Failed to fetch movies:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Hero */}
      <HeroCarousel mostMovies={mostMovies} />

      {/* Movie Board - phân trang bên trong */}
      <BoardMovie movieBuffer={movieBuffer} loading={loading} />
    </div>
  )
}

export default HomePage
