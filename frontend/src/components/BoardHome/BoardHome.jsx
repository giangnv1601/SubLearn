import axios from 'axios'
import { toast } from 'sonner'
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
    try {
      const res = await axios.get('http://localhost:5001/api/movies');
      const mostMovies = res.data.slice(0, 10);
      setMovieBuffer(res.data);
      setTotalMovies(res.data.length);
      setMostMovies(mostMovies);
      console.log(res.data);
      console.log(mostMovies);
    
    } catch (error) {
      console.error('Lỗi xảy ra khi truy xuất movies:', error);
      toast.error('Lỗi xảy ra khi truy xuất movies');
    }
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