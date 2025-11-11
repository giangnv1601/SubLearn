import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, LogOut } from 'lucide-react'
import { fetchProfileByIdApi } from '../../../api'

const Profiles = () => {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (userInfo && userInfo.id) {
          const profileData = await fetchProfileByIdApi(userInfo.id);
          setProfile(profileData);
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = async () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userInfo');
  
    navigate('/login')
  }


  return (
    <div className="relative group flex items-center gap-3">
      {/* Name*/}
      <div className="min-w-0">
        <p className="text-sm font-medium text-white truncate">{profile?.fullname}</p>
        {/* <p className="text-xs text-gray-300 truncate">{profile?.role}</p> */}
      </div>

      {/* Avatar */}
      <button
        className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors focus:outline-none"
        aria-label="User Profile"
      >
        <img
          src={profile?.avatar}
          alt="avatar"
          className="w-10 h-10 rounded-full object-cover border-2 border-[#E4D161] shadow-md"
        />
      </button>

      {/* Dropdown */}
      <div className="absolute right-0 top-full mt-2 w-44 bg-white text-black rounded-md shadow-lg ring-1 ring-black/5 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all">
        <Link to="/profile" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100">
          <User className="w-4 h-4" /> <span>Profile</span>
        </Link>
        <button onClick={handleLogout} className="w-full text-left flex items-center gap-2 px-4 py-2 hover:bg-gray-100">
          <LogOut className="w-4 h-4" /> <span>Logout</span>
        </button>
      </div>
    </div>
  )
}
 
export default Profiles