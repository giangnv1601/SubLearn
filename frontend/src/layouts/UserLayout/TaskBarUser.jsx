import Home from '../../components/NavBar/MenuItems/Home'
import MyList from '../../components/NavBar/MenuItems/MyList'
import Quizzes from '../../components/NavBar/MenuItems/Quizzes'
import LogoSubLearn from '../../components/NavBar/LogoSubLearn'
import SearchBar from '../../components/NavBar/SearchBar'
import Profiles from '../../components/NavBar/Profile'

const TaskBarUser = () => {
  return (
    <div className='flex justify-between items-center p-4 bg-[#1D2732] text-white rounded-2px rounded-t-2xl'>
      {/* Logo */}
      <LogoSubLearn/>

      {/* Menu Items User */}
      <div className="hidden md:flex items-center space-x-2">
        <Home />
        <MyList />  
        <Quizzes />
      </div>

      {/* Search Bar */}
      <SearchBar/>

      {/* User Profile */}
      <Profiles/>
    </div>  
  )
}

export default TaskBarUser