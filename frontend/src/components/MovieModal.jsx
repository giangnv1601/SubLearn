import React, { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import axios from 'axios'

const emptyForm = {
  title: '',
  slug: '',
  originalTitle: '',
  description: '',
  thumb_url: '',
  poster_url: '',
  time: '',
  year: '',
  genre: '',
  link_m3u8: '',
  link_audio: ''
}

export default function MovieModal({ isOpen, onClose, onCreate, onUpdate, onDelete, initialData = null }) {
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setForm(initialData ? {
        title: initialData.title ?? '',
        slug: initialData.slug ?? '',
        originalTitle: initialData.originalTitle ?? '',
        description: initialData.description ?? '',
        thumb_url: initialData.thumb_url ?? '',
        poster_url: initialData.poster_url ?? '',
        time: initialData.time ?? '',
        year: initialData.year ?? '',
        genre: initialData.genre ?? '',
        link_m3u8: initialData.link_m3u8 ?? '',
        link_audio: initialData.link_audio ?? ''
      } : emptyForm)
    }
  }, [isOpen, initialData])

  if (!isOpen) return null

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const postMovie = (payload) => axios.post('http://localhost:5001/api/movies', payload)
  const putMovie = (id, payload) => axios.put(`http://localhost:5001/api/movies/${id}`, payload)
  const deleteMovie = (id) => axios.delete(`http://localhost:5001/api/movies/${id}`)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title || !form.slug || !form.link_m3u8) {
      toast.error('Title, Slug và Link M3U8 là bắt buộc')
      return
    }
    setSaving(true)
    try {
      const payload = { ...form, year: form.year ? Number(form.year) : undefined }

      if (initialData) {
        // edit mode
        if (typeof onUpdate === 'function') {
          await onUpdate({ ...payload, _id: initialData._id || initialData.id })
        } else {
          await putMovie(initialData._id || initialData.id, payload)
        }
        toast.success('Cập nhật movie thành công')
      } else {
        // create mode
        if (typeof onCreate === 'function') {
          await onCreate(payload)
        } else {
          await postMovie(payload)
        }
        toast.success('Thêm movie thành công')
      }

      setForm(emptyForm)
      onClose()
    } catch (err) {
      console.error('Save movie error', err)
      const msg = err?.response?.data?.message || err?.message || 'Lỗi khi lưu movie'
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!initialData) return
    if (!confirm('Bạn có chắc muốn xóa phim này không?')) return
    setDeleting(true)
    try {
      if (typeof onDelete === 'function') {
        await onDelete(initialData._id || initialData.id)
      } else {
        await deleteMovie(initialData._id || initialData.id)
      }
      toast.success('Xóa movie thành công')
      onClose()
    } catch (err) {
      console.error('Delete movie error', err)
      toast.error(err?.response?.data?.message || err?.message || 'Lỗi khi xóa movie')
    } finally {
      setDeleting(false)
    }
  }

  const titleText = initialData ? 'Edit Movie' : 'Add Movie'
  const submitLabel = initialData ? (saving ? 'Updating...' : 'Update') : (saving ? 'Saving...' : 'Save')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-2xl border-2 border-[#E4D161]/50 bg-[#0b1620] rounded-lg p-6 shadow-lg mx-4 max-h-[80vh] overflow-y-auto ring-1 ring-[#2C8ABF]/25">
        <button className="absolute right-3 top-3 text-gray-400" onClick={onClose} aria-label="Close">
          <X />
        </button>

        <h2 className="text-xl font-semibold text-[#E4D161] mb-4">{titleText}</h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input name="title" value={form.title} onChange={handleChange} placeholder="Title" className="p-2 rounded bg-gray-800 w-full" required />
            <input name="slug" value={form.slug} onChange={handleChange} placeholder="Slug" className="p-2 rounded bg-gray-800 w-full" required />
            <input name="originalTitle" value={form.originalTitle} onChange={handleChange} placeholder="Original Title" className="p-2 rounded bg-gray-800 w-full" />
            <input name="time" value={form.time} onChange={handleChange} placeholder="Time (e.g. 1h30m)" className="p-2 rounded bg-gray-800 w-full" />
            <input name="year" value={form.year} onChange={handleChange} placeholder="Year" className="p-2 rounded bg-gray-800 w-full" />
            <input name="genre" value={form.genre} onChange={handleChange} placeholder="Genre" className="p-2 rounded bg-gray-800 w-full" />
          </div>

          <input name="thumb_url" value={form.thumb_url} onChange={handleChange} placeholder="Thumb URL" className="p-2 rounded bg-gray-800 w-full" />
          <input name="poster_url" value={form.poster_url} onChange={handleChange} placeholder="Poster URL" className="p-2 rounded bg-gray-800 w-full" />
          <input name="link_m3u8" value={form.link_m3u8} onChange={handleChange} placeholder="Link M3U8" className="p-2 rounded bg-gray-800 w-full" required />
          <input name="link_audio" value={form.link_audio} onChange={handleChange} placeholder="Link Audio (optional)" className="p-2 rounded bg-gray-800 w-full" />

          <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" className="p-2 rounded bg-gray-800 w-full min-h-[100px]" />

          <div className="flex items-center justify-end gap-3 mt-2">
            {initialData && (
              <button type="button" onClick={handleDelete} disabled={deleting} className="px-4 py-2 rounded bg-red-600 text-white">
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            )}
            <button type="button" onClick={() => { setForm(emptyForm); onClose() }} className="px-4 py-2 rounded bg-gray-700">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 rounded bg-[#E4D161] text-black font-medium">{submitLabel}</button>
          </div>
        </form>
      </div>
    </div>
  )
}