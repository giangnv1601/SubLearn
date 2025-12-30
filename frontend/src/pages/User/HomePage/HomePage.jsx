import { useEffect, useState } from 'react'
import HeroCarousel from './HeroCarousel/HeroCarousel'
import BoardMovie from './BoardMovie/BoardMovie'
import { fetchMoviesApi } from '@/api'

const HomePage = () => {
  const [movieBuffer, setMovieBuffer] = useState([]);
  const [mostMovies, setMostMovies] = useState([]);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    const data = await fetchMoviesApi();
    const mostMovies = data.slice(0, 10);
    setMovieBuffer(data);
    setMostMovies(mostMovies);
  }
  return (
    <div >
      {/* Hero */}
      <HeroCarousel mostMovies={mostMovies}/>

      {/* Movie Board */}
      <BoardMovie movieBuffer={movieBuffer}/>
    </div>
    
  )
}

export default HomePage
