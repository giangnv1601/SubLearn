import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { changePasswordApi } from "../../../api"
import { toast } from "sonner"

const ChangePasswordPage = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  })
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)

  const onChange = (e) => {
    const { name, value } = e.target
    setForm((s) => ({ ...s, [name]: value }))
  }

  const onSave = async (e) => {
    e.preventDefault()
    setError("")

    if (!form.currentPassword || !form.newPassword || !form.confirmNewPassword) {
      setError("Vui lòng điền đầy đủ các trường.")
      return
    }
    if (form.newPassword.length < 6) {
      setError("Mật khẩu mới phải có ít nhất 6 ký tự.")
      return
    }
    if (form.newPassword !== form.confirmNewPassword) {
      setError("Xác nhận mật khẩu mới không khớp.")
      return
    }

    setSaving(true)
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"))
      const userId = userInfo?.id
      if (!userId) {
        setError("User not found. Please log in again.")
        setSaving(false)
        return
      }

      const payload = {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      }

      const res = await changePasswordApi(userId, payload)
      localStorage.removeItem("accessToken")
      localStorage.removeItem("refreshToken")
      localStorage.removeItem("userInfo")

      toast.success("Password changed. Please log in again.")

      navigate("/login", { replace: true })
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message
      setError(msg)
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
        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="text-white text-3xl md:text-4xl font-semibold">Đổi mật khẩu</h1>
        </div>

        <div className="bg-[#1B2A36] rounded-2xl shadow-lg p-8 text-center border border-white/10">
          <form onSubmit={onSave} className="space-y-6 text-left">
            {/* Current password */}
            <div>
              <label htmlFor="currentPassword" className="block mb-2 text-sm font-medium text-white">
                Mật khẩu hiện tại
              </label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={form.currentPassword}
                onChange={onChange}
                autoComplete="current-password"
                className="mt-1 block w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2.5 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E4D161]"
                placeholder="Nhập mật khẩu hiện tại"
                required
                disabled={saving}
              />
            </div>

            {/* New password */}
            <div>
              <label htmlFor="newPassword" className="block mb-2 text-sm font-medium text-white">
                Mật khẩu mới
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={form.newPassword}
                onChange={onChange}
                autoComplete="new-password"
                className="mt-1 block w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2.5 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E4D161]"
                placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                required
                disabled={saving}
              />
            </div>

            {/* Confirm new password */}
            <div>
              <label htmlFor="confirmNewPassword" className="block mb-2 text-sm font-medium text-white">
                Xác nhận mật khẩu mới
              </label>
              <input
                type="password"
                id="confirmNewPassword"
                name="confirmNewPassword"
                value={form.confirmNewPassword}
                onChange={onChange}
                autoComplete="new-password"
                className="mt-1 block w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2.5 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E4D161]"
                placeholder="Xác nhận mật khẩu mới"
                required
                disabled={saving}
              />
            </div>

            {error && <p className="text-rose-400 text-sm">{error}</p>}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={saving}
                className="w-full flex-1 flex items-center justify-center gap-2 bg-[#E4D161] hover:bg-[#e0c94a] text-black py-2.5 rounded-lg font-medium transition-all duration-200 shadow-sm disabled:opacity-60"
              >
                {saving ? "Đang lưu…" : "Lưu mật khẩu mới"}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="w-full flex-1 flex items-center justify-center gap-2 border border-yellow-300 text-yellow-50 bg-transparent py-2.5 rounded-lg font-medium hover:bg-yellow-300/10 transition-colors duration-150"
                disabled={saving}
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ChangePasswordPage
