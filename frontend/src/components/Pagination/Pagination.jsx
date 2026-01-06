import { ChevronLeft, ChevronRight } from 'lucide-react'

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null

  const getPageNumbers = () => {
    const pages = []
    const showPages = 5

    if (totalPages <= showPages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages)
      }
    }
    return pages
  }

  return (
    <div className="flex items-center justify-center gap-1 mt-4">
      {/* Prev Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center justify-center w-7 h-7 rounded-md bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white/10"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
      </button>

      {/* Page Numbers */}
      {getPageNumbers().map((page, idx) => (
        <button
          key={idx}
          onClick={() => typeof page === 'number' && onPageChange(page)}
          disabled={page === '...'}
          className={`flex items-center justify-center min-w-[28px] h-7 px-2 rounded-md text-xs font-medium transition-all duration-200
            ${page === currentPage 
              ? 'bg-gradient-to-r from-[#E4D161] to-[#d4c151] text-gray-900 shadow-md shadow-[#E4D161]/20' 
              : page === '...' 
                ? 'cursor-default text-white/40' 
                : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white'
            }`}
        >
          {page}
        </button>
      ))}

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center justify-center w-7 h-7 rounded-md bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white/10"
      >
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

export default Pagination