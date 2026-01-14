import { Outlet } from 'react-router-dom'
import { useAuth } from '@/contexts'
import TaskbarAdmin from './TaskBarAdmin'
import TaskbarClient from './TaskBarUser'

const AuthLayout = () => {
  const { user, isLoading } = useAuth()
  const role = user?.role
  
  const renderTaskbar = () => {
    if (isLoading) return null
    if (role === 'admin') return <TaskbarAdmin />
    return <TaskbarClient />
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