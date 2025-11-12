import React, { useEffect } from "react"
import { useForm } from "react-hook-form"
import { ChevronDown } from "lucide-react"
import { toast } from "sonner"
import { createMovieApi, updateMovieApi } from "@/api"

function MovieModalNew({ open, initial = {}, onSave, onClose }) {
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
      thumb_url: initial?.thumb_url || "",
      poster_url: initial?.poster_url || "",
      duration: initial?.duration || "",
      year_released: initial?.year_released ?? new Date().getFullYear(),
      level: initial?.level || "medium",
      genre: initial?.genre || "",
      link_m3u8: initial?.link_m3u8 || "",
    },
  })

  // Cập nhập form khi initial thay đổi
  useEffect(() => {
    const defaults = {
      title: initial?.title || "",
      slug: initial?.slug || "",
      description: initial?.description || "",
      thumb_url: initial?.thumb_url || "",
      poster_url: initial?.poster_url || "",
      duration: initial?.duration || "",
      year_released: initial?.year_released ?? new Date().getFullYear(),
      level: initial?.level || "medium",
      genre: initial?.genre || "",
      link_m3u8: initial?.link_m3u8 || "",
    }
    reset(defaults)
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

  const onSubmit = async (data) => {
    // Validate thủ công bổ sung
    if (data.year_released && Number.isNaN(Number(data.year_released))) {
      setError("year_released", { message: "Year must be a number." })
      return
    }

    const payload = {
      ...data,
      year_released: data.year_released ? Number(data.year_released) : null,
      duration: data.duration?.trim() || "Đang cập nhật",
    }

    try {
      let res
      if (initial?._id) {
        res = await updateMovieApi(initial._id, payload)
      } else {
        res = await createMovieApi(payload)
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
      <div className="relative w-full max-w-3xl bg-[#0f1720] rounded-xl shadow-lg border border-white/6 overflow-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <header className="flex items-center justify-between mb-4">
            <h2 id="movie-modal-title" className="text-xl font-semibold text-white">
              {initial?._id ? "Edit Movie" : "Add Movie"}
            </h2>
          </header>

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

            {/* Thumb URL */}
            <div>
              <label className="block text-sm text-gray-200 mb-1">Thumb URL</label>
              <input
                {...register("thumb_url")}
                className="w-full rounded-md bg-[#1b2735] border border-white/10 px-3 py-2.5 text-white placeholder:text-gray-400"
                placeholder="https://..."
              />
            </div>

            {/* Poster URL */}
            <div>
              <label className="block text-sm text-gray-200 mb-1">Poster URL</label>
              <input
                {...register("poster_url")}
                className="w-full rounded-md bg-[#1b2735] border border-white/10 px-3 py-2.5 text-white placeholder:text-gray-400"
                placeholder="https://..."
              />
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

          {/* Buttons */}
          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md border border-white/10 text-gray-200 hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !isDirty}
              className={`px-5 py-2 rounded-md text-black font-semibold shadow-md ${
                isSubmitting || !isDirty
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
