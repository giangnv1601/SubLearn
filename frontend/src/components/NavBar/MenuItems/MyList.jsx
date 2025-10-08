import { Link } from 'react-router'
import { ListCheck } from 'lucide-react'

const MyList = () => {
  return (
    <div>
      <Link to="/my-list" className="flex items-center px-4 py-2 rounded-md text-lg hover:bg-white/5 group">
        <div className="flex items-center gap-2 border-b-2 border-transparent group-hover:border-[#E4D161] transition-colors">
          <ListCheck className="w-6 h-6 text-white transition-colors group-hover:text-[#E4D161]" />
          <span className="text-white transition-colors group-hover:text-[#E4D161]">My List</span>
        </div>
      </Link>
    </div>
  )
}

export default MyList