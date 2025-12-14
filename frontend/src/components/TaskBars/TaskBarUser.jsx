import Home from './MenuItems/Home'
import LogoSubLearn from './MenuItems/LogoSubLearn'
import SearchBar from './MenuItems/SearchBar'
import Profiles from './MenuItems/Profile'
import Exercises from './MenuItems/Exercises'
import Results from './MenuItems/Results'

const TaskBarUser = () => {
  return (
    <div className='flex justify-between items-center p-4 bg-[#1D2732] text-white rounded-2px rounded-t-2xl'>
      {/* Logo */}
      <LogoSubLearn/>

      {/* Menu Items User */}
      <div className="hidden md:flex items-center space-x-2">
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