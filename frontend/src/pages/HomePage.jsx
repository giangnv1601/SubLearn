import { Link } from 'react-router'
import { List, Play } from 'lucide-react'
import HeroCarousel from '../components/HeroCarousel'
import Profiles from '../components/Profile'
import ListItems from '../components/ListItems'
import { toast } from 'sonner'
import { useEffect, useState } from 'react'
import axios from 'axios'
import SearchBar from '../components/SearchBar'
import LogoSubLearn from '../components/LogoSubLearn'

const HomePage = () => {
  const [movieBuffer, setMovieBuffer] = useState([]);
  const [totalMovies, setTotalMovies] = useState(0);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/movies');
      setMovieBuffer(res.data);
      setTotalMovies(res.data.length);
      // console.log(res.data);
    
    } catch (error) {
      console.error('Lỗi xảy ra khi truy xuất movies:', error);
      toast.error('Lỗi xảy ra khi truy xuất movies');
    }
  }

  return (
    <div className='min-h-screen bg-[#2E4863]'>
      {/* NavBar */}
      <div className='flex justify-between items-center p-4 bg-[#1D2732] text-white rounded-2px rounded-t-2xl' >
        {/* Logo */}
        <LogoSubLearn/>

        {/* Menu Items */}
        <ListItems/>

        {/* Search Bar */}
        <SearchBar/>

        {/* User Profile */}
        <Profiles/>
      </div>

      {/* Board Movis */}
      <div>
        {/* Hero */}
        <HeroCarousel />

        {/* Movie Board */}
        <div className='mt-2 px-4 bg-[#1D2732] rounded-b-2xl p-4'>
          {/* Số movie và Lọc movie */}
          <div className="flex justify-between items-center px-2 md:px-4">
            <p className="text-[#E4D161] text-lg md:text-2xl font-semibold tracking-wide">
              Đang có {totalMovies} movies
            </p>

            {/* Bộ lọc */}
            <div className="flex items-center gap-4">
              <select className="mt-2 p-2 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-[#E4D161]">
                <option value="all">All Levels</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
              <select className="mt-2 p-2 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-[#E4D161]">
                <option value="all">All Genres</option>
                <option value="action">Action</option>
                <option value="comedy">Comedy</option>
                <option value="drama">Drama</option>
                <option value="horror">Horror</option>
                <option value="sci-fi">Sci-Fi</option>
              </select>
            </div>
          </div>
          
          {/* Movie List */}
          <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mt-4'>
            {movieBuffer.length === 0 ? (
              <div className="col-span-full text-center text-white">No movies found.</div>
            ) : (
              movieBuffer.map((movie) => (
                <div
                  key={movie._id || movie.id}
                  className="group relative overflow-hidden rounded-lg shadow-md bg-[#2E4863] cursor-pointer"
                >
                  <img
                    src={movie.thumbnail_url || '/assets/default-movie.png'}
                    alt={movie.title}
                    className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105"
                  />

                  {/* dark overlay on hover */}
                  <div className="absolute inset-0 bg-black/0 transition-colors duration-200 group-hover:bg-black/40" />

                  {/* centered play icon */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <Play className="w-12 h-12 text-transparent stroke-[#E4D161] stroke-2 bg-black/0 rounded-full p-1 opacity-0 transform scale-90 transition-all duration-200 group-hover:opacity-100 group-hover:scale-100" />
                  </div>

                  <div className="p-3">
                    <h2 className="text-white text-base font-semibold mb-1 text-center">{movie.title}</h2>
                    <div className="flex justify-between items-center w-full px-2">
                      <p className="text-gray-300 text-xs text-center">{movie.difficulty}</p>
                      <p className="text-gray-300 text-xs text-center">{movie.genre}</p>
                    </div>
                  </div>
                </div>
              )))
            }
          </div>
        </div>
      </div>

      

    </div>
    
  )
}

export default HomePage
