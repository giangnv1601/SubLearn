import { useEffect, useState, useMemo } from 'react'
import { Edit2, Trash2, Search, ChevronDown } from 'lucide-react'
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
      const query = searchQuery.toLowerCase()
      const matchesSearch =
        user.fullname.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)

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
    setConfirmState({
      open: true,
      type: CONFIRM_TYPES.UPDATE,
      userId: editingUser._id,
      payload: formData,
    })
  }

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

  const handleConfirmUpdate = async () => {
    const { userId, payload } = confirmState
    if (!userId || !payload) return

    try {
      setSubmitting(true)

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
      <div className="max-w-[1000px] mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
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
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#1B2A36] border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E4D161] focus:border-transparent text-sm"
              />
            </div>
            
            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
                className="appearance-none bg-[#1B2A36] border border-white/10 rounded-lg px-4 py-2 pr-8 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#E4D161] cursor-pointer"
              >
                <option value={STATUS_FILTERS.ALL}>Trạng thái: Tất cả</option>
                <option value={STATUS_FILTERS.ACTIVE}>Đang hoạt động</option>
                <option value={STATUS_FILTERS.INACTIVE}>Đã khóa</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-[#1B2A36] rounded-xl border border-white/10 overflow-hidden">
          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-10 h-10 border-4 border-[#E4D161] border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-400 mt-3">Đang tải...</p>
            </div>
          )}

          {/* Users Table */}
          {!loading && (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-gray-200 table-fixed">
                <thead>
                  <tr className="text-sm text-[#E4D161] border-b border-white/10 bg-white/5">
                    <th className="py-3 px-4 text-left font-semibold w-[220px]">Người dùng</th>
                    <th className="py-3 px-4 text-left font-semibold w-[260px]">Email</th>
                    <th className="py-3 px-4 text-center font-semibold w-[100px]">Ngày tạo</th>
                    <th className="py-3 px-4 text-center font-semibold w-[100px]">Cập nhật</th>
                    <th className="py-3 px-4 text-center font-semibold w-[120px]">Trạng thái</th>
                    <th className="py-3 px-4 text-center font-semibold w-[140px]">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Empty State */}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-400">
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
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      {/* Avatar + Name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={user.avatar}
                            alt={user.fullname}
                            className="w-10 h-10 rounded-full object-cover border border-white/10"
                          />
                          <span className="font-medium line-clamp-1">
                            {user.fullname}
                          </span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3 px-4">
                        <span className="text-sm break-all line-clamp-1">
                          {user.email}
                        </span>
                      </td>

                      {/* Created Date */}
                      <td className="py-3 px-4 text-center">
                        <span className="text-xs text-gray-400">
                          {formatDate(user.createdAt)}
                        </span>
                      </td>

                      {/* Updated Date */}
                      <td className="py-3 px-4 text-center">
                        <span className="text-xs text-gray-400">
                          {formatDate(user.updatedAt)}
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3 px-4 text-center">
                        <div
                          className={`
                            inline-flex items-center justify-center px-3 py-1.5 
                            rounded-full text-xs font-medium border
                            ${
                              user.isActive
                                ? 'bg-green-500/10 text-green-400 border-green-500/30'
                                : 'bg-red-500/10 text-red-400 border-red-500/30'
                            }
                          `}
                        >
                          <span
                            className={`w-2 h-2 rounded-full mr-2 ${
                              user.isActive ? 'bg-green-400' : 'bg-red-400'
                            }`}
                          />
                          {user.isActive ? 'Hoạt động' : 'Đã khóa'}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEdit(user)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-lg text-xs font-medium text-blue-400 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" /> Sửa
                          </button>
                          <button
                            onClick={() => handleOpenDeleteConfirm(user)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-xs font-medium text-red-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
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
