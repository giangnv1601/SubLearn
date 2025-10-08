import { Link } from 'react-router'
import { Play } from 'lucide-react'

const ListMovie = ({ movieBuffer }) => {
  return (
    <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mt-4'>
        {movieBuffer.length === 0 ? (
          <div className="col-span-full text-center text-white">No movies found.</div>
        ) : (
          movieBuffer.map((movie) => (
            <Link
              to={`/movie/${movie._id}`}
              key={movie._id}
              className="group relative overflow-hidden rounded-lg shadow-md bg-[#2E4863] cursor-pointer no-underline"
            >
              <img
                src={ movie.thumb_url || '/assets/default-movie.png'}
                alt={movie.slug}
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
              </div>
            </Link>
          )))
        }
      </div>
  )
}

export default ListMovie