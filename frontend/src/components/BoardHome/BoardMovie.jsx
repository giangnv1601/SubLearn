import ListMovie from './BoardMovie/ListMovie'

const BoardMovie = ({ movieBuffer, totalMovies }) => {
  return (
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
      <ListMovie movieBuffer={movieBuffer} />
    </div>
  )
}

export default BoardMovie