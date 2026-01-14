import { Link } from "react-router-dom"
import { Edit3, KeyRound } from "lucide-react"
import { useAuth } from "@/contexts"

const ROLE_LABEL = { admin: "Quản trị", client: "Người dùng" }

const fmtDate = (iso) => {
  if (!iso) return "—"
  try {
    return new Date(iso).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  } catch {
    return "—"
  }
}

const ProfilePage = () => {
  const { profile, isLoading } = useAuth()


  return (
    <div className="min-h-screen bg-[#2E4863] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-white text-3xl md:text-4xl font-semibold">Hồ sơ cá nhân</h1>
        </div>

        <div className="bg-[#1B2A36] rounded-2xl shadow-lg p-8 text-center border border-white/10">
          {isLoading ? (
            <div className="animate-pulse">
              <div className="mx-auto mb-4 w-28 h-28 rounded-full bg-white/10" />
              <div className="h-5 bg-white/10 rounded w-2/3 mx-auto mb-2" />
              <div className="h-4 bg-white/10 rounded w-1/2 mx-auto mb-6" />
              <div className="space-y-2 text-left">
                <div className="h-4 bg-white/10 rounded w-3/4" />
                <div className="h-4 bg-white/10 rounded w-2/3" />
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center mb-6">
                <img
                  src={profile?.avatar}
                  alt="User Avatar"
                  className="w-28 h-28 rounded-full border-4 border-[#E4D161] shadow-md mb-4 object-cover"
                />
                <h2 className="text-white text-2xl font-semibold mb-1">
                  {profile?.fullname || "—"}
                </h2>
                <p className="text-gray-300 text-sm">{profile?.email || "—"}</p>
              </div>

              <div className="bg-white/5 rounded-xl p-4 mb-6 text-left space-y-2 border border-white/10">
                <p className="text-gray-200">
                  <span className="font-medium text-[#E4D161]">Ngày đăng ký:</span>{" "}
                  {fmtDate(profile?.createdAt)}
                </p>
                <p className="text-gray-200">
                  <span className="font-medium text-[#E4D161]">Vai trò:</span>{" "}
                  {ROLE_LABEL[profile?.role] || "Người dùng"}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link to={`/profile/edit/${profile?._id || profile?.id}`} className="flex-1">
                    <button className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#F3D96B] to-[#E4D161] text-black py-2.5 rounded-lg font-medium transition-transform duration-150 shadow-md hover:scale-[1.02]">
                      <Edit3 size={18} />
                      Sửa thông tin
                    </button>
                  </Link>
                  <Link to={`/profile/change-password/${profile?._id || profile?.id}`} className="flex-1">
                    <button className="w-full flex items-center justify-center gap-2 border border-yellow-300 text-yellow-50 bg-transparent py-2.5 rounded-lg font-medium hover:bg-yellow-300/10 transition-colors duration-150">
                      <KeyRound size={18} />
                      Đổi mật khẩu
                    </button>
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
