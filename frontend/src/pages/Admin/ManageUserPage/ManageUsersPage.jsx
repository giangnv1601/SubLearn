import { useEffect, useState, useMemo } from 'react'
import { Edit2, Trash2, Search } from 'lucide-react'
import { toast } from 'sonner'
import { fetchAllUsersApi, deleteUserApi, updateUserApi } from '@/api'
import ConfirmDialog from '@/components/ConfirmDialog/ConfirmDialog'
import EditUserModal from './EditUserModal/EditUserModal'

const STATUS_FILTERS = {
  ALL: 'all',
  ACTIVE: 'active',
  INACTIVE: 'inactive'
}

const CONFIRM_TYPES = {
  DELETE: 'delete',
  UPDATE: 'update'
}

const formatDate = (iso) => {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

const toArray = (data) => {
  return Array.isArray(data) ? data : (data?.data || [])
}

const ManageUsersPage = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState(STATUS_FILTERS.ALL)

  const [editingUser, setEditingUser] = useState(null)

  const [confirmState, setConfirmState] = useState({
    open: false,
    type: null,
    userId: null,
    payload: null,
  })

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const data = await fetchAllUsersApi()
      const userList = toArray(data)
      setUsers(userList)
    } catch (error) {
      console.error('Failed to fetch users:', error)
      toast.error('Lấy danh sách người dùng thất bại. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // Filter by search query
      const query = searchQuery.toLowerCase()
      const matchesSearch =
        user.fullname.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)

      // Filter by status
      const matchesStatus =
        statusFilter === STATUS_FILTERS.ALL ||
        (statusFilter === STATUS_FILTERS.ACTIVE && user.isActive) ||
        (statusFilter === STATUS_FILTERS.INACTIVE && !user.isActive)

      return matchesSearch && matchesStatus
    })
  }, [users, searchQuery, statusFilter])

  const handleSearchChange = (value) => {
    setSearchQuery(value)
  }

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value)
  }

  const handleOpenEdit = (user) => {
    setEditingUser(user)
  }

  const handleCloseEdit = () => {
    setEditingUser(null)
  }

  const handleEditSubmit = (formData) => {
    // Open confirm dialog to confirm update
    setConfirmState({
      open: true,
      type: CONFIRM_TYPES.UPDATE,
      userId: editingUser._id,
      payload: formData, // { fullname, isActive, avatarFile }
    })
  }

  // Hàm xử lý mở hộp thoại xác nhận xóa người dùng
  const handleOpenDeleteConfirm = (user) => {
    setConfirmState({
      open: true,
      type: CONFIRM_TYPES.DELETE,
      userId: user._id,
      payload: null,
    })
  }

  const handleConfirmDelete = async () => {
    const { userId } = confirmState
    if (!userId) return

    try {
      setSubmitting(true)
      await deleteUserApi(userId)
      setUsers((prev) => prev.filter((u) => u._id !== userId))
      toast.success('Xóa người dùng thành công')
    } catch (error) {
      console.error('Failed to delete user:', error)
      const errorMessage = error?.response?.data?.message || 'Xóa người dùng thất bại. Vui lòng thử lại.'
      toast.error(errorMessage)
    } finally {
      setSubmitting(false)
      handleCloseConfirm()
    }
  }

  // Hàm xử lý xác nhận cập nhật người dùng
  const handleConfirmUpdate = async () => {
    const { userId, payload } = confirmState
    if (!userId || !payload) return

    try {
      setSubmitting(true)

      // If avatarFile exists, use FormData
      let body = payload
      if (payload.avatarFile) {
        const formData = new FormData()
        formData.append('fullname', payload.fullname)
        formData.append('isActive', String(payload.isActive))
        formData.append('avatar', payload.avatarFile)
        body = formData
      }

      const response = await updateUserApi(userId, body)
      const updatedUser = response?.data || response

      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, ...updatedUser } : u))
      )
      setEditingUser(null)
      toast.success('Cập nhật người dùng thành công')
    } catch (error) {
      console.error('Failed to update user:', error)
      const errorMessage = error?.response?.data?.message || 'Cập nhật người dùng thất bại. Vui lòng thử lại.'
      toast.error(errorMessage)
    } finally {
      setSubmitting(false)
      handleCloseConfirm()
    }
  }

  // Hàm xử lý đóng hộp thoại xác nhận
  const handleCloseConfirm = () => {
    if (submitting) return
    setConfirmState({ open: false, type: null, userId: null, payload: null })
  }

  const handleConfirm = () => {
    if (confirmState.type === CONFIRM_TYPES.DELETE) {
      handleConfirmDelete()
    } else if (confirmState.type === CONFIRM_TYPES.UPDATE) {
      handleConfirmUpdate()
    }
  }

  return (
    <div className="min-h-screen bg-[#2E4863] text-white">
      <div className="max-w-[1200px] mx-auto px-4 py-6">
        {/* Header */}
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
          <h1 className="text-2xl font-semibold text-[#E4D161]">Manage Users</h1>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên hoặc email..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-md bg-gray-900/40 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E4D161] focus:border-transparent"
              />
            </div>
            
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
              className="bg-gray-900/40 border border-gray-700 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E4D161] focus:border-transparent cursor-pointer [&>option]:bg-gray-800 [&>option]:text-white"
            >
              <option value={STATUS_FILTERS.ALL}>Trạng thái: Tất cả</option>
              <option value={STATUS_FILTERS.ACTIVE}>Đang hoạt động</option>
              <option value={STATUS_FILTERS.INACTIVE}>Đã khóa</option>
            </select>
          </div>
        </header>

        {/* Content */}
        <main className="bg-gray-900/40 rounded-lg p-4 border border-gray-800">
          {/* Loading State */}
          {loading && (
            <div className="text-center py-8">
              <p className="text-gray-400">Đang tải...</p>
            </div>
          )}

          {/* Users Table */}
          {!loading && (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-gray-200 table-fixed">
                <thead>
                  <tr className="border-b border-gray-800 text-sm text-gray-300">
                    <th className="py-3 px-2 text-left w-[220px] whitespace-nowrap">Người dùng</th>
                    <th className="py-3 px-2 text-left w-[260px] whitespace-nowrap">Email</th>
                    <th className="py-3 px-2 text-left w-[120px] whitespace-nowrap">Ngày tạo</th>
                    <th className="py-3 px-2 text-left w-[120px] whitespace-nowrap">Cập nhật</th>
                    <th className="py-3 px-2 text-left w-[150px] whitespace-nowrap">Trạng thái</th>
                    <th className="py-3 px-2 text-right w-[160px] whitespace-nowrap">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Empty State */}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-gray-500 text-sm">
                        {searchQuery || statusFilter !== STATUS_FILTERS.ALL
                          ? 'Không tìm thấy người dùng phù hợp.'
                          : 'Chưa có người dùng nào.'}
                      </td>
                    </tr>
                  )}

                  {/* User Rows */}
                  {filteredUsers.map((user) => (
                    <tr
                      key={user._id}
                      className="border-b border-gray-800/70 hover:bg-gray-900/60 transition-colors"
                    >
                      {/* Avatar + Name */}
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-3">
                          <img
                            src={user.avatar}
                            alt={user.fullname}
                            className="w-10 h-10 rounded-full object-cover border border-gray-700"
                          />
                          <span className="font-medium line-clamp-1">
                            {user.fullname}
                          </span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3 px-2">
                        <span className="text-sm break-all line-clamp-1">
                          {user.email}
                        </span>
                      </td>

                      {/* Created Date */}
                      <td className="py-3 px-2">
                        <span className="text-xs text-gray-300">
                          {formatDate(user.createdAt)}
                        </span>
                      </td>

                      {/* Updated Date */}
                      <td className="py-3 px-2">
                        <span className="text-xs text-gray-300">
                          {formatDate(user.updatedAt)}
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3 px-2">
                        <div
                          className={`
                            w-full inline-flex items-center justify-center px-3 py-1.5 
                            rounded-full text-xs font-medium border
                            ${
                              user.isActive
                                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/60'
                                : 'bg-red-500/10 text-red-300 border-red-500/60'
                            }
                          `}
                        >
                          <span
                            className={`w-2 h-2 rounded-full mr-2 ${
                              user.isActive ? 'bg-emerald-400' : 'bg-red-400'
                            }`}
                          />
                          {user.isActive ? 'Đang hoạt động' : 'Đã khóa'}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-2">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(user)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-700 hover:bg-blue-600 rounded text-xs font-medium text-white transition-colors"
                          >
                            <Edit2 className="w-4 h-4" /> Sửa
                          </button>
                          <button
                            onClick={() => handleOpenDeleteConfirm(user)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-red-700 hover:bg-red-600 rounded text-xs font-medium text-white transition-colors"
                          >
                            <Trash2 className="w-4 h-4" /> Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>

      {/* Edit User Modal */}
      <EditUserModal
        open={!!editingUser}
        user={editingUser}
        onClose={handleCloseEdit}
        onSubmit={handleEditSubmit}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmState.open}
        title={
          confirmState.type === CONFIRM_TYPES.DELETE
            ? 'Xóa người dùng'
            : 'Cập nhật người dùng'
        }
        message={
          confirmState.type === CONFIRM_TYPES.DELETE
            ? 'Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác.'
            : 'Bạn có chắc chắn muốn cập nhật thông tin người dùng này?'
        }
        confirmText={confirmState.type === CONFIRM_TYPES.DELETE ? 'Xóa' : 'Cập nhật'}
        onConfirm={handleConfirm}
        onCancel={handleCloseConfirm}
      />
    </div>
  )
}

export default ManageUsersPage
