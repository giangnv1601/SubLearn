import React, { useEffect, useState } from 'react'
import { Edit2, Trash2, Search } from 'lucide-react'
import { fetchAllUsersApi, deleteUserApi, updateUserApi } from '@/api'
import { toast } from 'sonner'
import ConfirmDialog from '@/components/ConfirmDialog/ConfirmDialog'
import EditUserModal from './EditUserModal/EditUserModal'

const formatDate = (iso) => {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

const ManageUsersPage = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // 'all' | 'active' | 'inactive'

  const [editingUser, setEditingUser] = useState(null)

  const [confirmState, setConfirmState] = useState({
    open: false,
    type: null, // 'delete' | 'update'
    userId: null,
    payload: null,
  })

  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        const data = await fetchAllUsersApi()
        const list = Array.isArray(data) ? data : data?.data || []
        setUsers(list)
      } catch (err) {
        toast.error('Lấy danh sách người dùng thất bại. Vui lòng thử lại.')
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const handleEdit = (user) => {
    setEditingUser(user)
  }

  const handleRequestDelete = (user) => {
    setConfirmState({
      open: true,
      type: 'delete',
      userId: user._id,
      payload: null,
    })
  }

  const handleDeleteConfirmed = async () => {
    const { userId } = confirmState
    if (!userId) return

    try {
      setSubmitting(true)
      await deleteUserApi(userId)
      setUsers((prev) => prev.filter((u) => u._id !== userId))
      toast.success('Xóa người dùng thành công')
    } catch (error) {
      console.error('Failed to delete user:', error)
      toast.error(error?.response?.data?.message || 'Xóa người dùng thất bại. Vui lòng thử lại.')
    } finally {
      setSubmitting(false)
      setConfirmState({ open: false, type: null, userId: null, payload: null })
    }
  }

  const handleEditSubmit = (formData) => {
    // Mở confirm dialog để xác nhận cập nhật
    setConfirmState({
      open: true,
      type: 'update',
      userId: editingUser._id,
      payload: formData, // có thể gồm fullname, isActive, avatarFile
    })
  }

  const handleUpdateConfirmed = async () => {
    const { userId, payload } = confirmState
    if (!userId || !payload) return

    try {
      setSubmitting(true)

      // Nếu có avatarFile -> dùng FormData gửi lên BE
      let body = payload
      if (payload.avatarFile) {
        const fd = new FormData()
        fd.append('fullname', payload.fullname)
        fd.append('isActive', String(payload.isActive))
        fd.append('avatar', payload.avatarFile)
        body = fd
      }

      const updated = await updateUserApi(userId, body)
      const updatedUser = updated?.data || updated

      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, ...updatedUser } : u))
      )
      setEditingUser(null)
      toast.success('Cập nhật người dùng thành công')
    } catch (error) {
      console.error('Failed to update user:', error)
      toast.error(error?.response?.data?.message || 'Cập nhật người dùng thất bại. Vui lòng thử lại.')
    } finally {
      setSubmitting(false)
      setConfirmState({ open: false, type: null, userId: null, payload: null })
    }
  }

  const handleConfirmClose = () => {
    if (submitting) return
    setConfirmState({ open: false, type: null, userId: null, payload: null })
  }

  // Lọc users theo search và status
  const filteredUsers = users.filter((user) => {
    // Filter by search query
    const query = searchQuery.toLowerCase()
    const matchesSearch =
      user.fullname.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)

    // Filter by status
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && user.isActive) ||
      (statusFilter === 'inactive' && !user.isActive)

    return matchesSearch && matchesStatus
  })

  const totalUsers = filteredUsers.length

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-4">
        {/* Title */}
        <h1 className="text-2xl font-semibold text-[#E4D161] mb-3">
          Manage Users
        </h1>
        
        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <p className="text-lg text-gray-400">
            Tổng số người dùng:{' '}
            <span className="font-medium text-gray-200">{totalUsers}</span>
          </p>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Search box */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên hoặc email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 rounded-md bg-gray-700 placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-[#E4D161]/40"
              />
            </div>
            
            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-gray-700 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E4D161]/40 cursor-pointer [&>option]:bg-gray-800 [&>option]:text-white"
            >
              <option value="all">Trạng thái: Tất cả</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Đã khóa</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="bg-gray-900/40 rounded-lg p-8 border border-gray-800 text-center">
          <p className="text-gray-400">Đang tải...</p>
        </div>
      )}

      {/* List Users */}
      {!loading && (
        <div className="bg-gray-900/40 rounded-lg p-4 border border-gray-800">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-gray-200 table-fixed">
              <thead>
                <tr className="border-b border-gray-800 text-xs text-gray-300">
                  <th className="py-3 px-2 text-left w-[220px]">Người dùng</th>
                  <th className="py-3 px-2 text-left w-[260px]">Email</th>
                  <th className="py-3 px-2 text-left w-[120px]">Ngày tạo</th>
                  <th className="py-3 px-2 text-left w-[120px]">Cập nhật</th>
                  <th className="py-3 px-13 text-left w-[150px]">Trạng thái</th>
                  <th className="py-3 px-13 text-right w-[160px]">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-6 text-center text-gray-500 text-sm"
                    >
                      {searchQuery || statusFilter !== 'all'
                        ? 'Không tìm thấy người dùng phù hợp.'
                        : 'Chưa có người dùng nào.'}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr
                      key={user._id}
                      className="border-b border-gray-800/70 hover:bg-gray-900/60 transition-colors"
                    >
                      {/* Avatar + name */}
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-3">
                          <img
                            src={user.avatar}
                            alt={user.fullname}
                            className="w-10 h-10 rounded-full object-cover border border-gray-700"
                          />
                          <div className="flex flex-col">
                            <span className="font-medium line-clamp-1">
                              {user.fullname}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3 px-2 align-top">
                        <span className="text-sm break-all line-clamp-1">
                          {user.email}
                        </span>
                      </td>

                      {/* CreatedAt */}
                      <td className="py-3 px-2 align-top">
                        <span className="text-xs text-gray-300">
                          {formatDate(user.createdAt)}
                        </span>
                      </td>

                      {/* UpdatedAt */}
                      <td className="py-3 px-2 align-top">
                        <span className="text-xs text-gray-300">
                          {formatDate(user.updatedAt)}
                        </span>
                      </td>

                      {/* Trạng thái isActive (readonly ở list, chỉnh trong modal) */}
                      <td className="py-3 px-2 align-top">
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
                      <td className="py-3 px-2 align-top">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(user)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-yellow-500/70 text-xs font-medium text-yellow-300 hover:bg-yellow-500/10 transition"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>Sửa</span>
                          </button>
                          <button
                            onClick={() => handleRequestDelete(user)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-red-500/70 text-xs font-medium text-red-300 hover:bg-red-500/10 transition"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Xóa</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit modal */}
      <EditUserModal
        open={!!editingUser}
        user={editingUser}
        onClose={() => setEditingUser(null)}
        onSubmit={handleEditSubmit}
      />

      {/* Confirm dialog */}
      <ConfirmDialog
        open={confirmState.open}
        title={
          confirmState.type === 'delete'
            ? 'Xóa người dùng'
            : 'Cập nhật người dùng'
        }
        message={
          confirmState.type === 'delete'
            ? 'Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác.'
            : 'Bạn có chắc chắn muốn cập nhật thông tin người dùng này?'
        }
        confirmText={confirmState.type === 'delete' ? 'Xóa' : 'Cập nhật'}
        onConfirm={
          confirmState.type === 'delete'
            ? handleDeleteConfirmed
            : handleUpdateConfirmed
        }
        onCancel={handleConfirmClose}
      />
    </div>
  )
}

export default ManageUsersPage
