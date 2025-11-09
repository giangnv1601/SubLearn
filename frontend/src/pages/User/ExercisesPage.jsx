import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Play } from "lucide-react"
import { fetchQuizzesSummary } from '../../api'

const TypeBadge = ({ label, color = "bg-gray-700"  }) => {
  return (
    <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded text-xs ${color}`}>
      <span className="font-medium capitalize">{label}</span>
      {/* <span className="ml-2 text-xs text-gray-300">({count})</span> */}
    </span>
  )
}

const ExercisesPage = () => {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetchQuizzesSummary()
        const items = Array.isArray(res) ? res : (res?.data || res?.items || [])
        if (!mounted) return

        // keep only movies that actually have quizzes (sum of quizCounts > 0)
        const mapped = (items || []).map((it, idx) => {
          const quizCounts = it.quizCounts || {}
          const total = Object.values(quizCounts).reduce((s, v) => s + (Number(v) || 0), 0)
          return {
            id: it.movieId ?? it._id ?? it.id ?? `r${idx}`,
            title: it.title ?? it.movieTitle ?? it.name ?? 'Untitled',
            quizCounts,
            total
          }
        }).filter(r => r.total > 0)

        setRows(mapped)
      } catch (e) {
        if (!mounted) return
        setError(e?.response?.data?.message || e?.message || 'Failed to load exercises')
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  const exerciseTypes = [
    { key: "reading", label: "reading", color: "bg-emerald-700" },
    { key: "dialogue_reordering", label: "dialogue_reordering", color: "bg-indigo-700" },
    { key: "translation", label: "translation", color: "bg-amber-700" },
    { key: "equivalent", label: "equivalent", color: "bg-rose-700" },
  ]

  return (
    <div className="min-h-screen bg-[#2E4863] text-white">
      <div className="max-w-[1200px] mx-auto px-4 py-6">
       {/* Header */}
       <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
         <h1 className="text-2xl font-semibold text-[#E4D161]">Exercises</h1>
       </div>

       {/* Table */}
       <div className="bg-gray-900/40 rounded-lg p-4">
         {loading && <div className="text-center py-6 text-gray-400">Loading...</div>}
         {!loading && error && <div className="text-center py-6 text-red-400">{error}</div>}

         {!loading && !error && (
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
                 {rows.map((row, index) => (
                   <tr key={row.id} className="border-t border-white/10 hover:bg-white/5">
                     <td className="py-3 px-3 align-top">{index + 1}</td>
                     <td className="py-3 px-3 align-top max-w-[280px]">{row.title}</td>
                     <td className="py-3 px-3 align-top">
                       <div className="flex flex-col gap-2">
                         {exerciseTypes
                           .filter(t => (Number(row.quizCounts?.[t.key]) || 0) > 0) // only types that have quizzes
                           .map((type) => (
                             <div key={type.key} className="flex items-center justify-between gap-3">
                               <TypeBadge label={type.label} color={type.color} count={Number(row.quizCounts?.[type.key] || 0)} />
                               <button
                                 className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-700 hover:bg-blue-600 rounded text-xs font-medium text-white"
                                 onClick={() => {
                                   const qs = new URLSearchParams({ movieId: String(row.id), type: type.key }).toString()
                                   navigate(`/client/exam?${qs}`)
                                 }}
                               >
                                 <Play className="w-4 h-4" /> Kiểm tra
                               </button>
                             </div>
                           ))}
                       </div>
                     </td>
                   </tr>
                 ))}
                 {rows.length === 0 && !loading && (
                   <tr>
                     <td colSpan={3} className="py-6 text-center text-gray-400">Không có phần thi.</td>
                   </tr>
                 )}
               </tbody>
             </table>
           </div>
         )}
       </div>
      </div>
    </div>
   )
 }

 export default ExercisesPage
