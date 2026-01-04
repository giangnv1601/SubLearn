import LogoSubLearn from './MenuItems/LogoSubLearn'
import Profiles from './MenuItems/Profile'
import ManageMovies from './MenuItems/ManageMovies'
import ManageExercises from './MenuItems/ManageExercises'
import ManagerUsers from './MenuItems/ManagerUsers'

const TaskBarAdmin = () => {
  return (
    <div className='flex justify-between items-center px-6 py-4 bg-[#1D2732] text-white rounded-t-2xl shadow-2xl border-b-2 border-[#E4D161]/20'>
      {/* Logo */}
      <LogoSubLearn/>

      {/* Menu Items Admin */}
      <div className="hidden md:flex items-center space-x-6">
        {/* <Home /> */}
        <ManagerUsers/>
        <ManageMovies/>
        <ManageExercises/>
      </div>

      {/* User Profile */}
        <Profiles/>
    </div>  
  )
}

export default TaskBarAdmin