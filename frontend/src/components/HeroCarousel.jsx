import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
const HeroCarousel = () => {

  const slides = [
    { id:1, title:'Catman 2: The Villain Returns', subtitle:'The story continues...', img:'/assets/hero-cat.jpg' },
    { id:2, title:'Dog Days', subtitle:'A light comedy', img:'/assets/hero-dog.jpg' }
  ]

  const [index, setIndex] = useState(0)
  const timer = useRef(null)
  useEffect(() => {
    timer.current = setInterval(() => setIndex(i => (i + 1) % slides.length), 4500)
    return () => clearInterval(timer.current)
  }, [slides.length])

  if (!slides.length) return null
  return (
    <div className="relative h-[400px] overflow-hidden shadow-xl bg-[#020202]"> 
      {slides.map((s, i) => (
              <div key={s.id} className={`absolute inset-0 transition-opacity duration-700 ${i === index ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                {/* <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${s.img})`, filter: 'brightness(.48) contrast(.96)' }} />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" /> */}
                <div className="relative z-20 h-full flex items-center">
                  <div className="ml-10 max-w-[720px] px-6 md:px-12">
                    <p className="text-3xl md:text-5xl font-extrabold text-white mb-3">{s.title}</p>
                    <p className="text-gray-300 max-w-lg mb-6">{s.subtitle}</p>
                    <div className="flex gap-3">
                      <button className="px-4 py-2 bg-[#E4D161] text-black rounded-full">Watch now</button>
                      <button className="px-4 py-2 border border-white/20 text-white rounded-full">More info</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <button onClick={() => setIndex((index - 1 + slides.length) % slides.length)} aria-label="Prev" className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 items-center justify-center w-10 h-10 rounded-full bg-white/60">
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <button onClick={() => setIndex((index + 1) % slides.length)} aria-label="Next" className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 items-center justify-center w-10 h-10 rounded-full bg-white/60">
              <ChevronRight className="w-5 h-5 text-white" />
            </button>

            <div className="absolute left-1/2 -translate-x-1/2 bottom-6 flex items-center gap-2 z-30">
              {slides.map((_, i) => <button key={i} onClick={() => setIndex(i)} className={`w-3 h-3 rounded-full ${i === index ? 'bg-[#E4D161] scale-110' : 'bg-white/60'}`} />)}
            </div>
    </div>
  )
}

export default HeroCarousel