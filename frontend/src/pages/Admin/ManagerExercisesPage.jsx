import { Plus, Edit, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { fetchQuizzesSummary } from '../../api'

const ManagerExercisesPage = () => {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoading(true)
      setError('')
      try {
        const res = await fetchQuizzesSummary()
        // normalise backend shape: res may be array or { data: [...] }
        const items = Array.isArray(res) ? res : (res?.data || [])
        if (!mounted) return
        const mapped = items.map((it) => ({
          id: it.movieId,
          title: it.title,
          quizCounts: {
            reading: it?.quizCounts?.reading || 0,
            dialogue_reordering: it?.quizCounts?.dialogue_reordering || 0,
            translation: it?.quizCounts?.translation || 0,
            equivalent: it?.quizCounts?.equivalent || 0
          }
        }))
        setData(mapped)
      } catch (e) {
        if (!mounted) return
        setError(e?.response?.data?.message || e.message || 'Failed to load')
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const filtered = useMemo(() => {
    if (!query.trim()) return data
    return data.filter((item) => item.title.toLowerCase().includes(query.toLowerCase()))
  }, [data, query])

  const TypeBadge = ({ label, count, color = 'bg-gray-700' }) => (
    <span className={`inline-flex items-center gap-1 ${color} text-white/90 text-xs px-2 py-1 rounded`}>
      <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
      {label}
      <span className="ml-1 inline-flex items-center justify-center min-w-4 h-4 bg-black/30 rounded px-1">{count}</span>
    </span>
  )

  const exerciseTypes = [
    { key: 'reading', label: 'reading', color: 'bg-emerald-700' },
    { key: 'dialogue_reordering', label: 'dialogue_reordering', color: 'bg-indigo-700' },
    { key: 'translation', label: 'translation', color: 'bg-amber-700' },
    { key: 'equivalent', label: 'equivalent', color: 'bg-rose-700' },
  ]

  const goEdit = (movieId, quizType) => {
    navigate(`/admin/exercise/${movieId}/${quizType}/edit`)
  }

  return (
    <div className="min-h-screen bg-[#2E4863] text-white">
      {/* Board Manage Exercises */}
      <div className="max-w-[1200px] mx-auto px-4 py-6">
        {/* Header Board */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
          <h1 className="text-2xl font-semibold text-[#E4D161]">Manage Exercises</h1>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search movie title..."
                className="w-full pl-9 pr-3 py-2 rounded-md bg-gray-900/40 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E4D161] focus:border-transparent"
              />
            </div>
            <button
              onClick={() => navigate('/test')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#E4D161] text-black rounded-md font-semibold shadow hover:opacity-95 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" /> Create Quiz
            </button>
          </div>
        </div>

        {/* Table Movie Quiz */}
        <div className="bg-gray-900/40 rounded-lg p-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-sm text-gray-300">
                  <th className="py-3 px-3 font-semibold">#</th>
                  <th className="py-3 px-3 font-semibold">Title movie</th>
                  <th className="py-3 px-3 font-semibold">Exercise Type</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={5} className="py-6 px-3 text-center text-gray-400">
                      Loading...
                    </td>
                  </tr>
                )}
                {!loading && error && (
                  <tr>
                    <td colSpan={5} className="py-6 px-3 text-center text-red-300">
                      {error}
                    </td>
                  </tr>
                )}
                {!loading && !error && filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 px-3 text-center text-gray-400">
                      No data
                    </td>
                  </tr>
                )}
                {!loading &&
                  !error &&
                  filtered.map((row, index) => (
                    <tr key={row.id} className="border-t border-white/10 hover:bg-white/5">
                      <td className="py-3 px-3 align-top">{index + 1}</td>
                      <td className="py-3 px-3 align-top max-w-[280px]">{row.title}</td>
                      <td className="py-3 px-3 align-top">
                        <div className="flex flex-col gap-2">
                          {exerciseTypes
                            .filter(t => (Number(row.quizCounts?.[t.key]) || 0) > 0)
                            .map((type) => (
                              <div key={type.key} className="flex items-center justify-between gap-3">
                                <TypeBadge label={type.label} count={row.quizCounts[type.key]} color={type.color} />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => goEdit(row.id, type.key)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-700 hover:bg-blue-600 rounded text-xs"
                                  >
                                    <Edit className="w-4 h-4" /> Edit
                                  </button>
                                </div>
                              </div>
                            ))}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ManagerExercisesPage
