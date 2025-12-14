import { useState } from 'react'
import { toast } from 'sonner'
import { X, UploadCloud, FileText } from 'lucide-react'
import { uploadSubtitleApi } from '@/api'


// Hàm định dạng dung lượng file
function formatBytes(bytes = 0) {
  if (bytes === 0) return '0 B'
  const k = 1024, sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export default function UploadSubtitleModal({ isOpen, onClose, movie }) {
  const [language, setLanguage] = useState('en')
  const [file, setFile] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  if (!isOpen) return null

  // Xử lý khi chọn file
  const onPickFile = (e) => {
    const f = e.target.files?.[0]
    if (!f) return setFile(null)
    if (!f.name.toLowerCase().endsWith('.srt')) {
      toast.error('Vui lòng chọn file .srt')
      return
    }
    const max = 5 * 1024 * 1024
    if (f.size > max) {
      toast.error('Dung lượng tối đa 5MB')
      return
    }
    setFile(f)
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!movie?._id || !language || !file) {
      toast.error('Thiếu dữ liệu (movieId / language / file)')
      return
    }
    const form = new FormData()
    form.append('movieId', movie._id)
    form.append('language', language)
    form.append('subtitle', file)

    try {
      setSubmitting(true)
      await uploadSubtitleApi(form)
      toast.success('Upload subtitle thành công')
      onClose()
    } catch (err) {
      const msg = err?.response?.data?.message || err.message
      toast.error(msg)
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-2xl bg-[#1D2732] border border-white/10 shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h3 className="text-white font-semibold">Upload Subtitle (.srt)</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/10">
            <X className="w-5 h-5 text-gray-300" />
          </button>
        </div>

        <form onSubmit={submit} className="p-5 space-y-5">
          <div className="text-sm text-gray-300">
            <div><span className="text-gray-400">Movie:</span> <span className="text-white font-medium">{movie?.title}</span></div>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Ngôn ngữ</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#E4D161] px-3 py-2"
            >
              <option value="en">Tiếng Anh</option>
              <option value="vi">Tiếng Việt</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">File .srt</label>
            {!file ? (
              <label
                htmlFor="subtitle-file"
                className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-dashed border-gray-600 bg-gray-800/60 px-4 py-3 hover:border-gray-500"
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
                <input id="subtitle-file" type="file" accept=".srt" className="hidden" onChange={onPickFile} />
              </label>
            ) : (
              <div className="flex items-center justify-between rounded-xl border border-gray-700 bg-gray-800 px-4 py-3">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-200" />
                  <div className="text-sm">
                    <div className="text-white font-medium truncate max-w-[16rem]">{file.name}</div>
                    <div className="text-gray-400">{formatBytes(file.size)}</div>
                  </div>
                </div>
                <button type="button" onClick={() => setFile(null)} className="px-2.5 py-1.5 text-xs rounded bg-gray-700 hover:bg-gray-600 text-white">
                  Xoá
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl bg-gray-700 text-white hover:bg-gray-600">
              Huỷ
            </button>
            <button
              type="submit"
              disabled={submitting || !file}
              className="inline-flex items-center gap-2 rounded-xl bg-[#E4D161] px-4 py-2 font-semibold text-black disabled:opacity-60 disabled:cursor-not-allowed"
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
