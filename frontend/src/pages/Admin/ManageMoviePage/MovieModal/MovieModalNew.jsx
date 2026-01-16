import React, { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { ChevronDown, Upload, X, Image as ImageIcon } from "lucide-react"
import { toast } from "sonner"
import { createMovieApi, updateMovieApi } from "@/api"

function MovieModalNew({ open, initial = {}, onSave, onClose }) {
  const [thumbFile, setThumbFile] = useState(null)
  const [thumbPreview, setThumbPreview] = useState(initial?.thumb_url || "")
  const [posterFile, setPosterFile] = useState(null)
  const [posterPreview, setPosterPreview] = useState(initial?.poster_url || "")

  const {
    register,
    handleSubmit,
    setFocus,
    setError,
    reset,
    formState: { errors, isSubmitting, isDirty }
  } = useForm({
    mode: "onBlur",
    defaultValues: {
      title: initial?.title || "",
      slug: initial?.slug || "",
      description: initial?.description || "",
      duration: initial?.duration || "",
      year_released: initial?.year_released ?? new Date().getFullYear(),
      level: initial?.level || "medium",
      genre: initial?.genre || "",
      link_m3u8: initial?.link_m3u8 || "",
    },
  })

  // Cập nhật form khi initial thay đổi
  useEffect(() => {
    const defaults = {
      title: initial?.title || "",
      slug: initial?.slug || "",
      description: initial?.description || "",
      duration: initial?.duration || "",
      year_released: initial?.year_released ?? new Date().getFullYear(),
      level: initial?.level || "medium",
      genre: initial?.genre || "",
      link_m3u8: initial?.link_m3u8 || "",
    }
    reset(defaults)
    setThumbPreview(initial?.thumb_url || "")
    setPosterPreview(initial?.poster_url || "")
    setThumbFile(null)
    setPosterFile(null)
  }, [initial, open, reset])

  // Auto-focus tiêu đề khi mở
  useEffect(() => {
    if (open) setTimeout(() => setFocus("title"), 0)
  }, [open, setFocus])

  // Khóa scroll nền khi mở
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => (document.body.style.overflow = prev)
  }, [open])

  // Xử lý chọn file thumb
  const handleThumbChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Chỉ chấp nhận file JPG, PNG hoặc WebP')
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước file tối đa 5MB')
      return
    }

    setThumbFile(file)
    
    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setThumbPreview(reader.result)
    }
    reader.onerror = () => {
      toast.error('Không thể đọc file ảnh')
    }
    reader.readAsDataURL(file)
  }

  // Xử lý chọn file poster
  const handlePosterChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Chỉ chấp nhận file JPG, PNG hoặc WebP')
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước file tối đa 5MB')
      return
    }

    setPosterFile(file)
    
    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPosterPreview(reader.result)
    }
    reader.onerror = () => {
      toast.error('Không thể đọc file ảnh')
    }
    reader.readAsDataURL(file)
  }

  // Xóa thumb
  const removeThumb = () => {
    setThumbFile(null)
    setThumbPreview("")
  }

  // Xóa poster
  const removePoster = () => {
    setPosterFile(null)
    setPosterPreview("")
  }

  const onSubmit = async (data) => {
    // Validate thủ công bổ sung
    if (data.year_released && Number.isNaN(Number(data.year_released))) {
      setError("year_released", { message: "Year must be a number." })
      return
    }

    // Tạo FormData để gửi file
    const formData = new FormData()
    formData.append('title', data.title)
    formData.append('slug', data.slug)
    formData.append('description', data.description || '')
    formData.append('duration', data.duration?.trim() || 'Đang cập nhật')
    formData.append('year_released', data.year_released ? Number(data.year_released) : new Date().getFullYear())
    formData.append('level', data.level)
    formData.append('genre', data.genre)
    formData.append('link_m3u8', data.link_m3u8)
    
    // Nếu có file mới thì gửi file, không thì gửi URL cũ
    if (thumbFile) {
      formData.append('thumb_url', thumbFile)
    } else if (initial?.thumb_url) {
      formData.append('thumb_url', initial.thumb_url)
    }
    
    if (posterFile) {
      formData.append('poster_url', posterFile)
    } else if (initial?.poster_url) {
      formData.append('poster_url', initial.poster_url)
    }

    try {
      let res
      if (initial?._id) {
        res = await updateMovieApi(initial._id, formData)
      } else {
        res = await createMovieApi(formData)
      }

      toast.success("Lưu phim thành công")
      await onSave?.(res)
      onClose?.()
    } catch (err) {
      console.error("Save movie error:", err)
      const msg = err?.response?.data?.message || err?.message || "Lỗi khi lưu phim"
      toast.error(msg)
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="movie-modal-title"
    >
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative w-full max-w-lg sm:max-w-xl bg-[#0f1720] rounded-lg sm:rounded-xl shadow-lg border-2 border-white/20 overflow-hidden">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
          <header className="flex items-center justify-between p-4 sm:p-5 border-b border-white">
            <h2 id="movie-modal-title" className="text-lg sm:text-xl font-semibold text-[#E4D161]">
              {initial?._id ? "Edit Movie" : "Add Movie"}
            </h2>
          </header>

          {/* Body */}
          <div className="p-3 sm:p-4 overflow-auto max-h-[68vh]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title */}
              <div>
                <label className="block text-sm text-gray-200 mb-1">Title</label>
                <input
                  {...register("title", { required: "Title is required." })}
                  className={`w-full rounded-md bg-[#1b2735] border px-3 py-2.5 text-white placeholder:text-gray-400 ${
                    errors.title ? "border-red-400" : "border-white/10"
                  }`}
                  placeholder="Movie title"
                />
                {errors.title && (
                  <p className="mt-1 text-xs text-red-300">{errors.title.message}</p>
                )}
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm text-gray-200 mb-1">Slug</label>
                <input
                  {...register("slug", { required: "Slug is required." })}
                  className={`w-full rounded-md bg-[#1b2735] border px-3 py-2.5 text-white placeholder:text-gray-400 ${
                    errors.slug ? "border-red-400" : "border-white/10"
                  }`}
                  placeholder="movie-slug"
                />
                {errors.slug && (
                  <p className="mt-1 text-xs text-red-300">{errors.slug.message}</p>
                )}
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-200 mb-1">Description</label>
                <textarea
                  {...register("description")}
                  className="w-full rounded-md bg-[#1b2735] border border-white/10 px-3 py-2.5 text-white placeholder:text-gray-400 h-28 resize-y"
                  placeholder="Short description"
                />
              </div>

              {/* Thumb Image Upload */}
              <div>
                <label className="block text-sm text-gray-200 mb-1">Thumb Image</label>
                {!thumbPreview ? (
                  <label
                    htmlFor="thumb-upload"
                    className="flex cursor-pointer items-center justify-center gap-2 rounded-md border-2 border-dashed border-gray-600 bg-[#1b2735] px-3 py-8 hover:border-gray-500 transition-colors"
                  >
                    <Upload className="w-5 h-5 text-gray-400" />
                    <div className="text-sm">
                      <div className="text-gray-300">Upload Thumb</div>
                      <div className="text-gray-500 text-xs">JPG, PNG, WebP • Max 5MB</div>
                    </div>
                    <input
                      id="thumb-upload"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      className="hidden"
                      onChange={handleThumbChange}
                    />
                  </label>
                ) : (
                  <div className="relative rounded-md border border-gray-600 bg-[#1b2735] overflow-hidden">
                    <img
                      src={thumbPreview}
                      alt="Thumb preview"
                      className="w-full h-32 object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeThumb}
                      className="absolute top-2 right-2 p-1 rounded-full bg-red-500 hover:bg-red-600 text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Poster Image Upload */}
              <div>
                <label className="block text-sm text-gray-200 mb-1">Poster Image</label>
                {!posterPreview ? (
                  <label
                    htmlFor="poster-upload"
                    className="flex cursor-pointer items-center justify-center gap-2 rounded-md border-2 border-dashed border-gray-600 bg-[#1b2735] px-3 py-8 hover:border-gray-500 transition-colors"
                  >
                    <ImageIcon className="w-5 h-5 text-gray-400" />
                    <div className="text-sm">
                      <div className="text-gray-300">Upload Poster</div>
                      <div className="text-gray-500 text-xs">JPG, PNG, WebP • Max 5MB</div>
                    </div>
                    <input
                      id="poster-upload"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      className="hidden"
                      onChange={handlePosterChange}
                    />
                  </label>
                ) : (
                  <div className="relative rounded-md border border-gray-600 bg-[#1b2735] overflow-hidden">
                    <img
                      src={posterPreview}
                      alt="Poster preview"
                      className="w-full h-32 object-cover"
                    />
                    <button
                      type="button"
                      onClick={removePoster}
                      className="absolute top-2 right-2 p-1 rounded-full bg-red-500 hover:bg-red-600 text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm text-gray-200 mb-1">Duration</label>
                <input
                  {...register("duration")}
                  className="w-full rounded-md bg-[#1b2735] border border-white/10 px-3 py-2.5 text-white placeholder:text-gray-400"
                  placeholder="e.g. 1h 45m"
                />
              </div>

              {/* Year Released */}
              <div>
                <label className="block text-sm text-gray-200 mb-1">Year Released</label>
                <input
                  type="number"
                  {...register("year_released")}
                  className={`w-full rounded-md bg-[#1b2735] border px-3 py-2.5 text-white placeholder:text-gray-400 ${
                    errors.year_released ? "border-red-400" : "border-white/10"
                  }`}
                />
                {errors.year_released && (
                  <p className="mt-1 text-xs text-red-300">{errors.year_released.message}</p>
                )}
              </div>

              {/* Level */}
              <div>
                <label className="block text-sm text-gray-200 mb-1">Level</label>
                <div className="relative">
                  <select
                    {...register("level")}
                    className="appearance-none w-full rounded-md bg-[#1b2735] border border-white/10 px-3 py-2.5 text-white pr-8"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>

                  <ChevronDown
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    size={18}
                    strokeWidth={1.5}
                  />
                </div>
              </div>

              {/* Genre */}
              <div>
                <label className="block text-sm text-gray-200 mb-1">Genre</label>
                <input
                  {...register("genre", { required: "Genre is required." })}
                  className={`w-full rounded-md bg-[#1b2735] border px-3 py-2.5 text-white placeholder:text-gray-400 ${
                    errors.genre ? "border-red-400" : "border-white/10"
                  }`}
                  placeholder="Action, Comedy, ..."
                />
                {errors.genre && (
                  <p className="mt-1 text-xs text-red-300">{errors.genre.message}</p>
                )}
              </div>

              {/* Link URL */}
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-200 mb-1">Link URL</label>
                <input
                  {...register("link_m3u8", { required: "Link URL is required." })}
                  className={`w-full rounded-md bg-[#1b2735] border px-3 py-2.5 text-white placeholder:text-gray-400 ${
                    errors.link_m3u8 ? "border-red-400" : "border-white/10"
                  }`}
                  placeholder="https://..."
                />
                {errors.link_m3u8 && (
                  <p className="mt-1 text-xs text-red-300">{errors.link_m3u8.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-3 sm:p-4 border-t bg-[#0f1720] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md border border-white/10 text-gray-200 hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 sm:px-5 py-2 rounded-md text-black font-semibold shadow-md ${
                isSubmitting
                  ? "bg-gray-600 cursor-not-allowed opacity-60"
                  : "bg-gradient-to-r from-[#F3D96B] to-[#E4D161] hover:scale-[1.02]"
              }`}
            >
              {isSubmitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default MovieModalNew
