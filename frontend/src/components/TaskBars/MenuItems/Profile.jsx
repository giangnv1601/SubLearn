import { Link, useNavigate } from 'react-router'
import { User, Settings, LogOut } from 'lucide-react'

const Profiles = () => {
  const navigate = useNavigate()

  const handleLogout = async () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userInfo');
  
    navigate('/login')
  }
  return (
    <div className="relative group">
      <button
        className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors focus:outline-none"
        aria-label="User Profile"
      >
        <User className="w-6 h-6 text-white" />
      </button>

      <div className="absolute right-0 mt-2 w-44 bg-white text-black rounded-md shadow-lg ring-1 ring-black/5 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all">
        <Link to="/profile" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100">
          <User className="w-4 h-4" /> <span>Profile</span>
        </Link>
        <Link to="/settings" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100">
          <Settings className="w-4 h-4" /> <span>Settings</span>
        </Link>
        <button onClick={handleLogout} className="w-full text-left flex items-center gap-2 px-4 py-2 hover:bg-gray-100">
          <LogOut className="w-4 h-4" /> <span>Logout</span>
        </button>
      </div>
    </div>
  )
}

export default Profiles