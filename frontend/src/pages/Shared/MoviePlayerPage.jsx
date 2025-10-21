import axios from 'axios'
import ReactPlayer from 'react-player'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import TaskBarUser from '../../components/TaskBars/TaskBarUser'

 
const MoviePlayerPage = () => {
  const { id } = useParams()
  const [movie, setMovie] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) return
    const fetchMovie = async () => {
      setLoading(true)
      try {
        const res = await axios.get(`http://localhost:5001/api/movies/${id}`)
        setMovie(res.data)
      } catch (err) {
        console.error('Lỗi khi lấy movie:', err)
        setError('Không thể tải dữ liệu phim')
      } finally {
        setLoading(false)
      }
    }
    fetchMovie()
  }, [id])
 
  const [subs] = useState([
    { id: 'vi', label: 'Tiếng Việt', lines: ['00:00 — Xin chào', '00:05 — Hành động tiếp theo'] },
    { id: 'en', label: 'English', lines: ['00:00 — Hello', '00:05 — Next action'] }
  ])

 
  return (
    <div className='min-h-screen bg-[#2E4863]'>
      {/* NavBar */}
      <TaskBarUser />

      {/* Content */}
      <div className="max-w-[1200px] mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-4">
          <h1 className="text-2xl text-[#E4D161] font-semibold">{movie?.title ?? 'Loading...'}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Player + controls */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              {loading ? (
                <div className="w-full h-[480px] bg-[#101820] flex items-center justify-center text-gray-400">Loading...</div>
              ) : error ? (
                <div className="w-full h-[480px] bg-[#101820] flex items-center justify-center text-red-400">{error}</div>
              ) : (
                <ReactPlayer src={movie?.link_m3u8} width="100%" height="325px" controls />
              )}
            </div>

            <div className="bg-[#1B2A36] p-4 rounded-md text-gray-300">
              <h2 className="text-lg md:text-xl font-semibold text-white mb-1 truncate">{movie?.title}</h2>
              <p className="text-sm text-gray-400 mb-3 italic">{movie?.originalTitle || ''}</p>

              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="text-xs px-2 py-1 rounded-full bg-[#14202A] text-[#E4D161]">Năm: {movie?.year ?? 'N/A'}</span>
                <span className="text-xs px-2 py-1 rounded-full bg-[#14202A] text-gray-200">Thời lượng: {movie?.time ?? 'N/A'}</span>
                <span className="text-xs px-2 py-1 rounded-full bg-[#14202A] text-gray-200">Thể loại: {movie?.genre ?? 'Unknown'}</span>
              </div>

              <div className="text-sm text-gray-200 leading-relaxed max-h-36 overflow-y-auto mb-2">
                {movie?.description ? (
                  <p className="whitespace-pre-wrap">{movie.description}</p>
                ) : (
                  <p className="text-gray-400">Mô tả phim chưa có.</p>
                )}
              </div>
            </div>
          </div>

          {/* Subtitles */}
          <aside className="space-y-4">
            {/* Select */}
            <div className="bg-[#1B2A36] p-4 rounded-md text-gray-300">
              <p className="text-xl text-[#E4D161] text-center font-semibold mb-2">Subtitles</p>
              <div className='flex gap-2 '>
                <button>Vietnamese</button>
                <button>English</button>
                <button>Song ngữ</button>
              </div>
            </div>

            {/* Text subtitle */}
            <div>
              <div className="bg-[#1B2A36] p-4 rounded-md text-gray-300 h-[300px] overflow-y-auto">
                {subs.map(sub => (
                  <div key={sub.id} className="mb-4">
                    <h3 className="font-semibold text-white mb-2">{sub.label}</h3>
                    <ul className="list-disc list-inside text-sm">
                      {sub.lines.map((line, index) => (
                        <li key={index}>{line}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
     
  )
}
 
export default MoviePlayerPage