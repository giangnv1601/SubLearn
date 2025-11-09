import { fetchMoviesApi } from '../../api'
import { useEffect, useState } from 'react'
import HeroCarousel from './HeroCarousel/HeroCarousel'
import BoardMovie from './BoardMovie/BoardMovie'

const BoardMHome = () => {
  const [movieBuffer, setMovieBuffer] = useState([]);
  const [totalMovies, setTotalMovies] = useState(0);
  const [mostMovies, setMostMovies] = useState([]);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    const data = await fetchMoviesApi();
    const mostMovies = data.slice(0, 10);
    setMovieBuffer(data);
    setTotalMovies(data.length);
    setMostMovies(mostMovies);
  }

  return (
    <div>
      {/* Hero */}
      <HeroCarousel mostMovies={mostMovies}/>

      {/* Movie Board */}
      <BoardMovie movieBuffer={movieBuffer} totalMovies={totalMovies} />
    </div>
  )
}

export default BoardMHome