import { useEffect, useState, useRef } from 'react'
import { toast } from 'sonner'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

const validateImageFile = (file) => {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    toast.error('Chỉ chấp nhận file JPG, PNG hoặc WebP')
    return false
  }

  if (file.size > MAX_FILE_SIZE) {
    toast.error('Kích thước file tối đa 5MB')
    return false
  }

  return true
}

const EditUserModal = ({ open, user, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    isActive: true,
  })

  const [avatarPreview, setAvatarPreview] = useState('')
  const [avatarFile, setAvatarFile] = useState(null)
  
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (open && user) {
      setFormData({
        fullname: user.fullname || '',
        email: user.email || '',
        isActive: user.isActive ?? true,
      })
      setAvatarPreview(user.avatar || '')
      setAvatarFile(null)
    }
  }, [open, user])

  if (!open || !user) return null

  const hasChanges =
    formData.fullname !== (user.fullname || '') ||
    formData.isActive !== (user.isActive ?? true) ||
    avatarFile !== null

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleToggleActive = () => {
    setFormData((prev) => ({
      ...prev,
      isActive: !prev.isActive,
    }))
  }

  const handleOpenFilePicker = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!validateImageFile(file)) return

    setAvatarFile(file)
    
    const reader = new FileReader()
    reader.onloadend = () => {
      setAvatarPreview(reader.result)
    }
    reader.onerror = () => {
      toast.error('Không thể đọc file ảnh')
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validate fullname
    if (!formData.fullname.trim()) {
      toast.error('Họ tên không được để trống')
      return
    }
    
    if (!hasChanges) return

    // Submit to parent component
    onSubmit({
      fullname: formData.fullname,
      isActive: formData.isActive,
      avatarFile,
    })
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60">
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-xl w-full max-w-lg p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-100">
            Chỉnh sửa người dùng
          </h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar Section */}
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
                onClick={handleOpenFilePicker}
                className="inline-flex items-center px-3 py-1.5 rounded-md border border-gray-600 text-xs text-gray-200 hover:bg-gray-800 transition-colors"
              >
                Đổi ảnh đại diện
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept={ALLOWED_IMAGE_TYPES.join(',')}
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
          </div>

          {/* Fullname Input */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-300">
              Họ tên
            </label>
            <input
              name="fullname"
              value={formData.fullname}
              onChange={handleInputChange}
              required
              className="w-full rounded-md border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-1 focus:ring-yellow-500"
              placeholder="Nhập họ tên"
            />
          </div>

          {/* Email Input (Read-only) */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-300">
              Email
            </label>
            <input
              name="email"
              type="email"
              value={formData.email}
              readOnly
              className="w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-400 cursor-not-allowed"
            />
          </div>

          {/* Active Status Toggle */}
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-200">
                Trạng thái tài khoản
              </span>
              <button
                type="button"
                onClick={handleToggleActive}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                  formData.isActive ? 'bg-emerald-500' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                    formData.isActive ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-400">
              {formData.isActive
                ? 'Đang hoạt động – người dùng có thể đăng nhập.'
                : 'Đã khóa – người dùng không thể đăng nhập.'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-md text-sm border border-gray-600 text-gray-200 hover:bg-gray-800 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={!hasChanges}
              className={`px-4 py-1.5 rounded-md text-sm border text-gray-900 font-medium transition-colors
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