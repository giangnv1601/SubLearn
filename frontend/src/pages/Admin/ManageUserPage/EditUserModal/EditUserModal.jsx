import React, { useEffect, useState, useRef } from 'react'
import { toast } from 'sonner'

const EditUserModal = ({ open, user, onClose, onSubmit }) => {
  const [form, setForm] = useState({
    fullname: '',
    email: '',
    isActive: true,
  })

  const [avatarPreview, setAvatarPreview] = useState('')
  const [avatarFile, setAvatarFile] = useState(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (open && user) {
      setForm({
        fullname: user.fullname || '',
        email: user.email || '',
        isActive: user.isActive ?? true,
      })
      setAvatarPreview(user.avatar || '')
      setAvatarFile(null)
    }
  }, [open, user])

  if (!open || !user) return null

  // Hàm thay đổi giá trị input
  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Hàm xử lý khi gạt nút trạng thái
  const handleToggleActive = () => {
    setForm((prev) => ({
      ...prev,
      isActive: !prev.isActive,
    }))
  }

  // Hàm xử lý khi chọn nút đổi ảnh đại diện
  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  // Hàm xử lý khi chọn file ảnh
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    const url = URL.createObjectURL(file)
    setAvatarPreview(url)
  }

  const hasChanges =
    form.fullname !== (user.fullname || '') ||
    form.isActive !== (user.isActive ?? true) ||
    avatarFile !== null

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validate họ tên không được để trống
    if (!form.fullname.trim()) {
      toast.error('Họ tên không được để trống')
      return
    }
    
    if (!hasChanges) return

    // gửi lên parent: fullname + isActive + file avatar (nếu có)
    onSubmit({
      fullname: form.fullname,
      isActive: form.isActive,
      avatarFile,
    })
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60">
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-100">
            Chỉnh sửa người dùng
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar + name + nút đổi ảnh */}
          <div className="flex items-center gap-3 mb-2">
            <div className="relative">
              <img
                src={avatarPreview || user.avatar}
                alt={user.fullname}
                className="w-12 h-12 rounded-full object-cover border border-gray-700"
              />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-base font-medium text-gray-100">
                {user.fullname}
              </span>
              <button
                type="button"
                onClick={handleAvatarClick}
                className="inline-flex items-center px-3 py-1.5 rounded-md border border-gray-600 text-xs text-gray-200 hover:bg-gray-800 transition"
              >
                Đổi ảnh đại diện
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
          </div>

          {/* Họ tên */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-300">
              Họ tên
            </label>
            <input
              name="fullname"
              value={form.fullname}
              onChange={handleChange}
              required
              className="w-full rounded-md border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-1 focus:ring-yellow-500"
              placeholder="Nhập họ tên"
            />
          </div>

          {/* Email - chỉ hiện, không cho sửa */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-300">
              Email
            </label>
            <input
              name="email"
              type="email"
              value={form.email}
              readOnly
              className="w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-400 cursor-not-allowed"
            />
          </div>

          {/* Trạng thái: nút gạt */}
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-200">
                Trạng thái tài khoản
              </span>
              <button
                type="button"
                onClick={handleToggleActive}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                  form.isActive ? 'bg-emerald-500' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                    form.isActive ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-400">
              {form.isActive
                ? 'Đang hoạt động – người dùng có thể đăng nhập.'
                : 'Đã khóa – người dùng không thể đăng nhập.'}
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-md text-sm border border-gray-600 text-gray-200 hover:bg-gray-800 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={!hasChanges}
              className={`px-4 py-1.5 rounded-md text-sm border text-gray-900 font-medium 
                ${
                  hasChanges
                    ? 'border-yellow-400 bg-yellow-400 hover:bg-yellow-300'
                    : 'border-gray-500 bg-gray-700 text-gray-300 cursor-not-allowed'
                }`}
            >
              Cập nhật
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditUserModal