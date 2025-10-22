import TaskBarAdmin from '../../components/TaskBars/TaskBarAdmin'
import { Plus } from 'lucide-react'

const ManagerExercisesPage = () => {
  return (
    <div className="min-h-screen bg-[#2E4863] text-white">
      {/* Task Bar */}
      <TaskBarAdmin />

      {/* Board Manage Exercises */}
      <div className="max-w-[1200px] mx-auto px-4 py-6">
        {/* Header Board */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
          <h1 className="text-2xl font-semibold text-[#E4D161]">Manage Exercises</h1>
          <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-[#E4D161] text-black rounded-md font-semibold shadow hover:opacity-95">
            <Plus className="w-4 h-4" /> Create Exercise
          </button>
        </div>

        {/* Table Movie */}
        <div className="bg-gray-900/40 rounded-lg p-4">

        </div>
      </div>
    </div>
  )
}

export default ManagerExercisesPage