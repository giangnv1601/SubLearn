import TaskBarAdmin from '../../layouts/AdminLayout/TaskBarAdmin'
import BoardMHome from '../../components/BoardHome'

const HomePage = () => {
  

  return (
    <div className='min-h-screen bg-[#2E4863]'>
      {/* Task Bar */}
      <TaskBarAdmin />
      
      {/* Board Home */}
      <BoardMHome />
    </div>
    
  )
}

export default HomePage
