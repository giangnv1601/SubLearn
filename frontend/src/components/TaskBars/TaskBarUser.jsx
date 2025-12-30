import Home from './MenuItems/Home'
import LogoSubLearn from './MenuItems/LogoSubLearn'
import SearchBar from './MenuItems/SearchBar'
import Profiles from './MenuItems/Profile'
import Exercises from './MenuItems/Exercises'
import Results from './MenuItems/Results'

const TaskBarUser = () => {
  return (
    <div className='flex justify-between items-center px-6 py-4 bg-[#1D2732] text-white rounded-t-2xl shadow-2xl border-b-2 border-[#E4D161]/20'>
      {/* Logo */}
      <LogoSubLearn/>

      {/* Menu Items User */}
      <div className="hidden md:flex items-center space-x-6">
        <Home />
        <Exercises />
        <Results /> 
      </div>

      {/* Search Bar */}
      <SearchBar/>

      {/* User Profile */}
      <Profiles/>
    </div>  
  )
}

export default TaskBarUser