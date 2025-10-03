import React, { useState } from 'react'
import { Link } from 'react-router'
import Profiles from '../components/Profile'
import ListItems from '../components/ListItems'
import SearchBar from '../components/SearchBar'
import LogoSubLearn from '../components/LogoSubLearn'
import ReactPlayer from 'react-player'
 
const MoviePlayerPage = () => {


   const [subs] = useState([
     { id: 'vi', label: 'Tiếng Việt', lines: ['00:00 — Xin chào', '00:05 — Hành động tiếp theo'] },
     { id: 'en', label: 'English', lines: ['00:00 — Hello', '00:05 — Next action'] }
   ])

 
   return (
    <div className='min-h-screen bg-[#2E4863]'>
      {/* NavBar */}
      <div className='flex justify-between items-center p-4 bg-[#1D2732] text-white rounded-2px rounded-t-2xl' >
        {/* Logo */}
        <LogoSubLearn/>

        {/* Menu Items */}
        <ListItems/>

        {/* Search Bar */}
        <SearchBar/>

        {/* User Profile */}
        <Profiles/>
      </div>

      {/* Content */}
      <main className="max-w-[1200px] mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-4">
          <h1 className="text-2xl text-[#E4D161] font-semibold">Movie Player</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Player + controls */}
          <section className="lg:col-span-2 space-y-4">
            <div>
              <ReactPlayer src='https://vip.opstream17.com/20250516/18283_1168edfa/index.m3u8' 
                width="100%" height="480px"
                controls
              />
            </div>
          

            <div className="flex items-center gap-3">
              <button className="px-4 py-2 rounded-md bg-[#E4D161] text-black font-medium">Play</button>
              <button className="px-3 py-2 rounded-md bg-gray-800 text-white">Pause</button>
              <button className="px-3 py-2 rounded-md bg-gray-800 text-white">Download</button>

              <div className="ml-auto text-sm text-gray-300">Genre • Year • Difficulty</div>
            </div>

            <div className="bg-[#1B2A36] p-4 rounded-md text-gray-300">
              <h3 className="font-semibold text-white mb-2">Description</h3>
              <p className="text-sm">Mô tả phim sẽ nằm ở đây. Thay bằng dữ liệu thật từ API khi có.</p>
            </div>
          </section>

          {/* Subtitles */}
          <aside className="space-y-4">
            {/* Select */}
            <div className="bg-[#1B2A36] p-4 rounded-md text-gray-300">
              <h2 className="text-xl text-[#E4D161] font-semibold mb-2">Subtitles</h2>
              <div className='flex gap-2 '>
                <button>Vietnamese</button>
                <button>English</button>
                <button>Song ngữ</button>
              </div>
            </div>

            {/* Text subtitle */}
            <div>
              <div className="bg-[#1B2A36] p-4 rounded-md text-gray-300 h-[300px] overflow-y-auto">
                {subs.map(sub => (
                  <div key={sub.id} className="mb-4">
                    <h3 className="font-semibold text-white mb-2">{sub.label}</h3>
                    <ul className="list-disc list-inside text-sm">
                      {sub.lines.map((line, index) => (
                        <li key={index}>{line}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>

  )
 }
 
 export default MoviePlayerPage