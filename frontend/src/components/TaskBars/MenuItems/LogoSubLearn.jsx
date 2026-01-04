import { Link } from 'react-router'
import LogoSubLearnImage from '@/assets/sublearn.png'
const LogoSubLearn = () => {
  return (
    <div className="flex items-center">
      <Link to="/" className='flex items-center gap-2'>
        <img src={LogoSubLearnImage} alt="SubLearn logo" className="h-13 w-auto object-contain"/>
        <h1 className="text-[#E4D161] text-lg md:text-xl font-semibold tracking-wider">SubLearn</h1>
      </Link>
    </div>
  )
}

export default LogoSubLearn