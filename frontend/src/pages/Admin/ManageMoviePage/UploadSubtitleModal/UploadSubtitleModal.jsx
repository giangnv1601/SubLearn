import { useState } from 'react'
import { toast } from 'sonner'
import { X, UploadCloud, FileText } from 'lucide-react'
import { uploadSubtitleApi } from '@/api'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_FILE_EXTENSION = '.srt'

const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'Tiếng Anh' },
  { value: 'vi', label: 'Tiếng Việt' },
]

function formatBytes(bytes = 0) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export default function UploadSubtitleModal({ isOpen, onClose, movie }) {
  const [language, setLanguage] = useState('en')
  const [file, setFile] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  if (!isOpen) return null

  const handlePickFile = (e) => {
    const selectedFile = e.target.files?.[0]
    
    if (!selectedFile) {
      setFile(null)
      return
    }

    // Validate file extension
    if (!selectedFile.name.toLowerCase().endsWith(ALLOWED_FILE_EXTENSION)) {
      toast.error(`Vui lòng chọn file ${ALLOWED_FILE_EXTENSION}`)
      return
    }

    // Validate file size
    if (selectedFile.size > MAX_FILE_SIZE) {
      toast.error('Dung lượng tối đa 5MB')
      return
    }

    setFile(selectedFile)
  }

  const handleRemoveFile = () => {
    setFile(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate required fields
    if (!movie?._id || !language || !file) {
      toast.error('Thiếu dữ liệu (movieId / language / file)')
      return
    }

    // Prepare FormData
    const formData = new FormData()
    formData.append('movieId', movie._id)
    formData.append('language', language)
    formData.append('subtitle', file)

    try {
      setSubmitting(true)
      await uploadSubtitleApi(formData)
      toast.success('Upload subtitle thành công')
      onClose()
    } catch (err) {
      const errorMessage = err?.response?.data?.message || err.message
      toast.error(errorMessage)
      console.error('Upload subtitle error:', err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg rounded-2xl bg-[#1D2732] border border-white/10 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h3 className="text-white font-semibold">Upload Subtitle (.srt)</h3>
          <button 
            onClick={onClose} 
            className="p-1 rounded hover:bg-white/10 transition-colors"
            type="button"
          >
            <X className="w-5 h-5 text-gray-300" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Movie Info */}
          <div className="text-sm text-gray-300">
            <span className="text-gray-400">Movie:</span>{' '}
            <span className="text-white font-medium">{movie?.title}</span>
          </div>

          {/* Language Select */}
          <div>
            <label className="block text-sm text-gray-300 mb-1">Ngôn ngữ</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#E4D161] px-3 py-2"
            >
              {LANGUAGE_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm text-gray-300 mb-1">File .srt</label>
            {!file ? (
              <label
                htmlFor="subtitle-file"
                className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-dashed border-gray-600 bg-gray-800/60 px-4 py-3 hover:border-gray-500 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <UploadCloud className="w-5 h-5 text-gray-300" />
                  <div className="text-sm">
                    <div className="text-white">Chọn file phụ đề</div>
                    <div className="text-gray-400">.srt • tối đa 5MB</div>
                  </div>
                </div>
                <span className="inline-flex items-center rounded-lg bg-[#E4D161] px-3 py-1.5 text-xs font-semibold text-black">
                  Browse
                </span>
                <input
                  id="subtitle-file"
                  type="file"
                  accept=".srt"
                  className="hidden"
                  onChange={handlePickFile}
                />
              </label>
            ) : (
              <div className="flex items-center justify-between rounded-xl border border-gray-700 bg-gray-800 px-4 py-3">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-200" />
                  <div className="text-sm">
                    <div className="text-white font-medium truncate max-w-[16rem]">
                      {file.name}
                    </div>
                    <div className="text-gray-400">{formatBytes(file.size)}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="px-2.5 py-1.5 text-xs rounded bg-gray-700 hover:bg-gray-600 text-white transition-colors"
                >
                  Xoá
                </button>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-gray-700 text-white hover:bg-gray-600 transition-colors"
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={submitting || !file}
              className="inline-flex items-center gap-2 rounded-xl bg-[#E4D161] px-4 py-2 font-semibold text-black disabled:opacity-60 disabled:cursor-not-allowed hover:bg-[#d4c151] transition-colors"
            >
              {submitting ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-black/40 border-t-black" />
                  Đang upload...
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  Upload
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
