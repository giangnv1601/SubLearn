import Home from './MenuItems/Home'
import MyList from './MenuItems/MyList'
import LogoSubLearn from './MenuItems/LogoSubLearn'
import SearchBar from './MenuItems/SearchBar'
import Profiles from './MenuItems/Profile'
import Exercises from './MenuItems/Exercises'

const TaskBarUser = () => {
  return (
    <div className='flex justify-between items-center p-4 bg-[#1D2732] text-white rounded-2px rounded-t-2xl'>
      {/* Logo */}
      <LogoSubLearn/>

      {/* Menu Items User */}
      <div className="hidden md:flex items-center space-x-2">
        <Home />
        <MyList />  
        <Exercises />
      </div>

      {/* Search Bar */}
      <SearchBar/>

      {/* User Profile */}
      <Profiles/>
    </div>  
  )
}

export default TaskBarUser