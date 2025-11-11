import { useEffect, useRef, useState } from "react"
import { Camera } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"
import { fetchProfileByIdApi, updateProfileApi } from "../../api"

export default function EditProfilePage() {
  const { id: routeId } = useParams()
  const navigate = useNavigate()
  const fileRef = useRef(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const [userId, setUserId] = useState(null)
  const [fullname, setFullname] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [avatarFile, setAvatarFile] = useState(null)
  const [email, setEmail] = useState("")
  const [createdAt, setCreatedAt] = useState("")

  const fmtDate = (iso) => (iso ? new Date(iso).toLocaleDateString("vi-VN") : "—")

  useEffect(() => {
    let alive = true
    const load = async () => {
      setLoading(true)
      setError("")
      try {
        // determine user id: route param (edit link) or current user from localStorage
        const userInfo =  JSON.parse(localStorage.getItem("userInfo"))
        const userId = userInfo?.id

        if (!userId) {
          if (alive) {
            setError("Không tìm thấy người dùng. Vui lòng đăng nhập.")
            setLoading(false)
          }
          return
        }

        setUserId(userId)

        // fetch profile
        const data = await fetchProfileByIdApi(userId)

        if (!alive) return

        setFullname(data?.fullname || "")
        setAvatarUrl(data?.avatar ||  "/assets/default-avatar.png")
        setEmail(data?.email || "")
        setCreatedAt(data?.createdAt || "")
      } catch (err) {
        if (!alive) return
        console.error("Load profile failed:", err)
        setError(err?.response?.data?.message || err?.message || "Không thể tải thông tin.")
      } finally {
        if (alive) setLoading(false)
      }
    }

    load()
    return () => {
      alive = false
    }
  }, [routeId])

  const triggerPick = () => fileRef.current?.click()
  const onPickFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setAvatarUrl(url)
    setAvatarFile(file)
  }

  const onSave = async (e) => {
    e.preventDefault()
    setError("")
    setSaving(true)
    try {
      if (!userId) {
        setError("Không tìm thấy người dùng.")
        setSaving(false)
        return
      }
      if (!fullname || fullname.trim().length < 2) {
        setError("Họ tên phải ít nhất 2 ký tự.")
        setSaving(false)
        return
      }

      let payload
      if (avatarFile) {
        const fd = new FormData()
        fd.append("fullname", fullname.trim())
        fd.append("avatar", avatarFile)
        payload = fd
      } else {
        payload = { fullname: fullname.trim() }
      }

      await updateProfileApi(userId, payload)

      toast.success("Cập nhật hồ sơ thành công")
      navigate("/profile")
    } catch (err) {
      console.error("Update profile failed:", err)
      const msg = err?.response?.data?.message || err?.message || "Cập nhật thất bại"
      setError(msg)
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  const onCancel = () => {
    navigate(-1, { replace: true })
  }

  return (
    <div className="min-h-screen bg-[#2E4863] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-white text-3xl md:text-4xl font-semibold">Sửa thông tin</h1>
        </div>
        <div className="bg-[#1B2A36] rounded-2xl shadow-lg p-8 text-center border border-white/10">
          {loading ? (
            <div className="space-y-4 animate-pulse">
              <div className="w-28 h-28 rounded-full bg-white/10 mx-auto" />
              <div className="h-4 bg-white/10 rounded" />
              <div className="h-4 bg-white/10 rounded w-2/3" />
            </div>
          ) : (
            <form onSubmit={onSave} className="space-y-6 text-left">
              {/* Avatar + Họ tên */}
              <div className="flex items-center gap-4">
                <div className="relative mx-auto sm:mx-0">
                  <img
                    src={avatarUrl}
                    alt="avatar"
                    className="w-28 h-28 rounded-full object-cover border-4 border-[#E4D161] shadow-md"
                    onError={(e) => {
                      e.currentTarget.onerror = null
                      e.currentTarget.src = "/assets/default-avatar.png"
                    }}
                  />
                  <button
                    type="button"
                    onClick={triggerPick}
                    className="absolute -right-2 -bottom-2 bg-white/90 border rounded-md px-3 py-1 flex items-center gap-2 text-sm shadow-sm hover:bg-white transition"
                  >
                    <Camera className="w-4 h-4" /> Thay ảnh
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPickFile} />
                </div>

                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-200">Họ tên</label>
                  <input
                    value={fullname}
                    onChange={(e) => setFullname(e.target.value)}
                    placeholder="Nhập họ tên"
                    className="mt-1 block w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2.5 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E4D161]"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-200">Email</label>
                <input value={email} disabled className="mt-1 block w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2.5 text-gray-300" />
              </div>

              {/* Ngày đăng ký */}
              <div>
                <label className="block text-sm font-medium text-gray-200">Ngày đăng ký</label>
                <input value={fmtDate(createdAt)} disabled className="mt-1 block w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2.5 text-gray-300" />
              </div>

              {error && <div className="text-rose-400 text-sm">{error}</div>}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button type="submit" disabled={saving} className="flex-1 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#F3D96B] to-[#E4D161] text-black py-2.5 rounded-lg font-medium transition-transform duration-150 shadow-md hover:scale-[1.02] disabled:opacity-60">
                  {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
                <button type="button" onClick={onCancel} className="flex-1 w-full border border-yellow-300 text-yellow-50 bg-transparent py-2.5 rounded-lg font-medium hover:bg-yellow-300/10 transition-colors duration-150">
                  Hủy
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
