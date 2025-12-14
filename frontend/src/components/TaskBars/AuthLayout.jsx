import { Outlet } from 'react-router-dom'
import TaskbarAdmin from './TaskBarAdmin'
import TaskbarClient from './TaskBarUser'

const AuthLayout = () => {
  const user = JSON.parse(localStorage.getItem('userInfo'))
  const role = user?.role
  
  const renderTaskbar = () => {
    if (role === 'admin') return <TaskbarAdmin />
    if (role === 'client') return <TaskbarClient />
    return <TaskbarUser />
  }

  return (
    <div className='min-h-screen bg-[#2E4863]'>
      {renderTaskbar()}
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  )
}

export default AuthLayout