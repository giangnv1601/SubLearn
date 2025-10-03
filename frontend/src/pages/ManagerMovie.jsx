import React, { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { Plus, Edit2, Trash2, Image, ChevronLeft, ChevronRight } from 'lucide-react'
import Profiles from '../components/Profile'
import ListItems from '../components/ListItems'
import SearchBar from '../components/SearchBar'
import LogoSubLearn from '../components/LogoSubLearn'
import axios from 'axios'
import { toast } from 'sonner'

const sampleMovies = [
  { id: 1, title: 'Inception', genre: 'Sci‑Fi', year: 2010, difficulty: 'Hard', thumbnail: 'https://img.youtube.com/vi/wq_qCVZC5go/maxresdefault.jpg' },
  { id: 2, title: 'Dog Days', genre: 'Comedy', year: 2018, difficulty: 'Easy', thumbnail: '/assets/thumb-2.jpg' },
  { id: 3, title: 'The Twins', genre: 'Drama', year: 2022, difficulty: 'Medium', thumbnail: '/assets/thumb-3.jpg' }
]

const ManagerMovie = () => {
  const [movieBuffer, setMovieBuffer] = useState([...sampleMovies])
  const [q, setQ] = useState('')
  const [genre, setGenre] = useState('')
  const [page, setPage] = useState(1)
  const perPage = 8

  useEffect(() => {
    fetchMovies();
  }, [])

  const fetchMovies = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/movies');
      setMovieBuffer(res.data);
      // setTotalMovies(res.data.length);
      // console.log(res.data);
    
    } catch (error) {
      console.error('Lỗi xảy ra khi truy xuất movies:', error);
      toast.error('Lỗi xảy ra khi truy xuất movies');
    }
  }

  const filtered = movieBuffer.filter(m => {
    const matchQ = q.trim() === '' || m.title.toLowerCase().includes(q.toLowerCase())
    const matchGenre = !genre || m.genre === genre
    return matchQ && matchGenre
  })

  const paged = filtered.slice((page - 1) * perPage, page * perPage)
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))

  return (
    <div className="min-h-screen bg-[#2E4863] text-white">
      {/* NavBar */}
      <div className='flex justify-between items-center p-4 bg-[#1D2732] text-white rounded-2px rounded-t-2xl' >
        <LogoSubLearn />
        <ListItems />
        <div className="hidden md:block"><SearchBar /></div>
        <Profiles />
      </div>

      {/* Board Manage Movie */}
      <main className="max-w-[1200px] mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-[#E4D161]">Manage Movies</h1>
            <p className="text-sm text-gray-300 mt-1">Create, edit or remove movies from the catalogue</p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-72">
              <input
                value={q}
                onChange={(e) => { setQ(e.target.value); setPage(1) }}
                placeholder="Search by title..."
                className="w-full pl-10 pr-3 py-2 rounded-md bg-gray-700 placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-[#E4D161]/40"
              />
            </div>

            <select
              value={genre}
              onChange={(e) => { setGenre(e.target.value); setPage(1) }}
              className="bg-gray-700 text-white px-3 py-2 rounded-md focus:outline-none"
            >
              <option value="">All genres</option>
              <option>Action</option>
              <option>Drama</option>
              <option>Comedy</option>
              <option>Sci‑Fi</option>
            </select>

            <Link to="/manage/add" className="inline-flex items-center gap-2 px-4 py-2 bg-[#E4D161] text-black rounded-md font-semibold shadow hover:opacity-95">
              <Plus className="w-4 h-4" /> Add movie
            </Link>
          </div>
        </div>

        <div className="bg-gray-900/40 rounded-lg p-4">
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse">
              <thead>
                <tr className="text-left text-sm text-gray-300/90">
                  <th className="px-4 py-3">Stt</th>
                  <th className="px-4 py-3">Thumbnail</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3 hidden lg:table-cell">Genre</th>
                  <th className="px-4 py-3 w-20 hidden sm:table-cell">Year</th>
                  <th className="px-4 py-3">Difficulty</th>
                  <th className="px-4 py-3 w-36 text-center">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-700">
                {paged.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-gray-400">
                      No movies found. Click "Add movie" to create one.
                    </td>
                  </tr>
                ) : paged.map((m, idx) => (
                  <tr key={m.id} className="hover:bg-gray-800">
                    <td className="px-4 py-3 text-sm text-gray-200">{(page - 1) * perPage + idx + 1}</td>
                    <td className="px-4 py-3">
                      <div className="h-14 w-24 bg-gray-800 rounded overflow-hidden flex items-center justify-center">
                        {m.thumbnail_url ? (
                          <img src={m.thumbnail_url} alt={m.title} className="h-full w-full object-cover" />
                        ) : (
                          <Image className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-100 font-medium">{m.title}</td>
                    <td className="px-4 py-3 hidden lg:table-cell text-gray-200">{m.genre}</td>
                    <td className="px-4 py-3 hidden sm:table-cell text-gray-200">{m.release_year}</td>
                    <td className="px-4 py-3 text-gray-200">{m.difficulty}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button className="px-3 py-1 text-sm rounded-md bg-blue-600 hover:bg-blue-700 text-white inline-flex items-center gap-2">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button className="px-3 py-1 text-sm rounded-md bg-red-600 hover:bg-red-700 text-white inline-flex items-center gap-2">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
            <div>Showing <strong className="text-gray-200">{filtered.length}</strong> result(s)</div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-2 py-1 rounded-md bg-gray-700/60 text-white disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="px-3 py-1 bg-gray-800 rounded-md text-white">{page} / {totalPages}</div>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-2 py-1 rounded-md bg-gray-700/60 text-white disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default ManagerMovie