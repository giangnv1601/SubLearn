import React from 'react'

const InfoPanel = ({ movie }) => {
  return (
    <div className="bg-[#1B2A36] p-6 rounded-xl shadow-lg text-gray-300 border border-white/5">
      <h3 className="text-xl font-bold text-[#E4D161] mb-4 border-b border-white/10 pb-2">
        Thông tin phim
      </h3>

      <div className="flex flex-col sm:flex-row gap-6">
        {/* Image */}
        <div className="shrink-0 mx-auto sm:mx-0">
          <div className="w-32 sm:w-40 aspect-[2/3] rounded-lg overflow-hidden shadow-md border border-white/10 bg-black/20">
            {movie?.thumb_url ? (
              <img
                src={movie.thumb_url}
                alt={movie?.title || 'Movie poster'}
                className="w-full h-full object-cover"
                onError={(e) => (e.target.style.display = 'none')}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">
                No Image
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="flex-1 space-y-3">
          <div>
            <h4 className="text-2xl font-bold text-white leading-tight">
              {movie?.title || 'Đang tải...'}
            </h4>
            {movie?.level && (
              <span
                className={`inline-block mt-2 text-xs font-bold px-2.5 py-1 rounded-full border 
                  ${movie.level.toLowerCase() === 'easy' ? 'bg-green-600/20 text-green-300 border-green-500/30' :
                    movie.level.toLowerCase() === 'medium' ? 'bg-yellow-600/20 text-yellow-300 border-yellow-500/30' :
                    movie.level.toLowerCase() === 'hard' ? 'bg-red-600/20 text-red-300 border-red-500/30' :
                    'bg-gray-600/20 text-gray-300 border-gray-500/30'}
                `}
              >
                {movie.level}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2 text-sm">
            <div className="px-3 py-1 rounded-full bg-[#14202A] border border-white/10 text-gray-300 flex items-center gap-1">
              <span className="text-[#E4D161]">Năm:</span>
              <span>{movie?.year_released ?? movie?.year ?? 'N/A'}</span>
            </div>
            <div className="px-3 py-1 rounded-full bg-[#14202A] border border-white/10 text-gray-300 flex items-center gap-1">
              <span className="text-[#E4D161]">Thời lượng:</span>
              <span>{movie?.duration ?? movie?.time ?? 'N/A'}</span>
            </div>
            <div className="px-3 py-1 rounded-full bg-[#14202A] border border-white/10 text-gray-300 flex items-center gap-1">
              <span className="text-[#E4D161]">Thể loại:</span>
              <span>{movie?.genre ?? 'Unknown'}</span>
            </div>
          </div>

          <div className="pt-2">
            <h5 className="text-sm font-semibold text-gray-400 mb-1">Mô tả:</h5>
            <div className="text-sm text-gray-300 leading-relaxed max-h-40 overflow-y-auto pr-2 custom-scrollbar">
              {movie?.description ? (
                <p className="whitespace-pre-wrap">{movie.description}</p>
              ) : (
                <p className="italic text-gray-500">Mô tả phim chưa có.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InfoPanel
