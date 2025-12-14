import LogoSubLearn from './MenuItems/LogoSubLearn'
import SearchBar from './MenuItems/SearchBar'
import Profiles from './MenuItems/Profile'
import ManageMovies from './MenuItems/ManageMovies'
import ManageExercises from './MenuItems/ManageExercises'
import ManagerUsers from './MenuItems/ManagerUsers'
import Home from './MenuItems/Home'

const TaskBarAdmin = () => {
  return (
    <div className='flex justify-between items-center p-4 bg-[#1D2732] text-white rounded-2px rounded-t-2xl'>
      {/* Logo */}
        <LogoSubLearn/>

      {/* Menu Items Admin */}
      <div className="hidden md:flex items-center space-x-2">
        <Home />
        <ManagerUsers/>
        <ManageMovies/>
        <ManageExercises/>
      </div>

      {/* Search Bar */}
        <SearchBar/>

      {/* User Profile */}
        <Profiles/>
    </div>  
  )
}

export default TaskBarAdmin