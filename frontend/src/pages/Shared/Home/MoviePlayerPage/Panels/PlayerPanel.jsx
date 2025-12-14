import React from 'react'

const PlayerPanel = ({ loading, error, videoRef }) => {
  return (
    <div className="lg:col-span-2">
      <div className="bg-[#1B2A36] rounded-md border border-white/10">
        {loading ? (
          <div className="w-full h-[420px] bg-[#101820] flex items-center justify-center text-gray-400">
            Đang tải…
          </div>
        ) : error ? (
          <div className="w-full h-[420px] bg-[#101820] flex items-center justify-center text-red-400">
            {error}
          </div>
        ) : (
          <video
            ref={videoRef}
            className="w-full h-[420px] bg-black"
            controls
            playsInline
            crossOrigin="anonymous"
          />
        )}
      </div>
    </div>
  )
}

export default PlayerPanel