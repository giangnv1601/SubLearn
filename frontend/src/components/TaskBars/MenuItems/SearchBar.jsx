import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { searchMoviesApi } from '@/api'

const SearchBar = ({ onSelectMovie }) => {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const inputRef = useRef(null)

  const handleChange = (e) => {
    const value = e.target.value
    setQuery(value)

    if (!value.trim()) {
      setResults([])
      setShowDropdown(false)
      setLoading(false)
      return
    }
  }

  const handleClear = () => {
    setQuery('')
    setResults([])
    setShowDropdown(false)
    setLoading(false)
    inputRef.current?.focus()
  }

  useEffect(() => {
    if (!query.trim()) return

    setLoading(true)

    const timer = setTimeout(async () => {
      try {
        const res = await searchMoviesApi(query)
        const data = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : []
        setResults(data)
        setShowDropdown(true)
      } catch (err) {
        console.error('Search movies error:', err)
        setResults([])
        setShowDropdown(false)
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  const handleSelect = (movie) => {
    onSelectMovie?.(movie)
    // clear search state
    setQuery('')
    setResults([])
    setShowDropdown(false)
    inputRef.current?.blur()
    // Chuyển đến trang playerMovie
    const id = movie._id
    if (id) navigate(`/movie/${id}`)
  }

  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Search movies..."
        ref={inputRef}
        value={query}
        onChange={handleChange}
        onFocus={() => {
          if (results.length > 0) setShowDropdown(true)
        }}
        className="w-full px-3 py-2 pr-14 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-[#E4D161]"
      />

      {/* Loading */}
      {loading && (
        <span className="absolute right-12 top-1/2 -translate-y-1/2 text-xs text-gray-300 z-40">
          Loading...
        </span>
      )}

      {/* Button clear */}
      {query && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white flex items-center justify-center w-8 h-8 rounded-md bg-white/10 hover:bg-white/20 z-50"
          aria-label="Clear search"
        >
          ×
        </button>
      )}

      {showDropdown && results.length > 0 && (
        <ul className="absolute z-20 mt-1 w-full max-h-60 overflow-auto bg-gray-800 border border-gray-700 rounded-md shadow-lg">
          {results.map((movie) => (
            <li
              key={movie._id}
              onClick={() => handleSelect(movie)}
              className="px-3 py-2 text-sm text-white hover:bg-gray-700 cursor-pointer flex items-center gap-2"
            >
              {movie.thumb_url && (
                <img
                  src={movie.thumb_url}
                  alt={movie.title}
                  className="w-8 h-10 object-cover rounded"
                />
              )}
              <div className="flex-1">
                <div className="font-medium">{movie.title}</div>
                {movie.year_released && (
                  <div className="text-xs text-gray-400">
                    Năm: {movie.year_released}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {showDropdown && !loading && results.length === 0 && query.trim() && (
        <div className="absolute z-20 mt-1 w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm text-gray-300">
          Không tìm thấy phim
        </div>
      )}
    </div>
  )
}

export default SearchBar
