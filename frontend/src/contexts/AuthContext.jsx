import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react"
import { toast } from "sonner"
import { loginUserApi, registerUserApi, fetchProfileByIdApi } from "@/api"

const AuthContext = createContext(null)

// Biến global để axios interceptor có thể gọi khi session expired
let globalLogoutHandler = null

export const setGlobalLogoutHandler = (handler) => {
  globalLogoutHandler = handler
}

export const triggerSessionExpired = () => {
  if (globalLogoutHandler) {
    globalLogoutHandler()
  }
}

// Custom hook để sử dụng AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Xóa dữ liệu xác thực
  const clearAuthData = useCallback(() => {
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
    localStorage.removeItem("userInfo")
    setUser(null)
    setProfile(null)
    setIsAuthenticated(false)
  }, [])

  // Đăng ký global logout handler cho axios interceptor
  useEffect(() => {
    setGlobalLogoutHandler(() => {
      clearAuthData()
      window.location.href = "/login"
    })

    return () => {
      setGlobalLogoutHandler(null)
    }
  }, [clearAuthData])

  // Sync logout giữa các browser tabs
  // Khi user logout ở tab khác, tab này cũng sẽ logout
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "accessToken" && e.newValue === null && isAuthenticated) {
        clearAuthData()
        window.location.href = "/login"
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [clearAuthData, isAuthenticated])

  // Lưu dữ liệu xác thực
  const saveAuthData = useCallback((userData, accessToken, refreshToken) => {
    localStorage.setItem("userInfo", JSON.stringify(userData))
    localStorage.setItem("accessToken", accessToken)
    localStorage.setItem("refreshToken", refreshToken)
    setUser(userData)
    setIsAuthenticated(true)
  }, [])

  // Fetch profile đầy đủ từ API
  const fetchProfile = useCallback(async (userId) => {
    if (!userId) return null
    try {
      const profileData = await fetchProfileByIdApi(userId)
      const data = profileData?.data ?? profileData
      setProfile(data)
      return data
    } catch (error) {
      console.error("Error fetching profile:", error)
      return null
    }
  }, [])

  // Khởi tạo trạng thái từ localStorage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUser = localStorage.getItem("userInfo")
        const accessToken = localStorage.getItem("accessToken")

        if (storedUser && accessToken) {
          const userData = JSON.parse(storedUser)
          setUser(userData)
          setIsAuthenticated(true)
          
          // Fetch profile đầy đủ
          await fetchProfile(userData.id)
        }
      } catch (error) {
        console.error("Error initializing auth:", error)
        clearAuthData()
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [clearAuthData, fetchProfile])

  // Đăng nhập
  const login = useCallback(async (credentials) => {
    try {
      const res = await loginUserApi(credentials)

      const userData = {
        id: res.id,
        email: res.email,
        role: res.role
      }

      saveAuthData(userData, res.accessToken, res.refreshToken)
      
      // Fetch profile đầy đủ sau khi đăng nhập
      await fetchProfile(userData.id)

      return { success: true, user: userData }
    } catch (error) {
      const message = error?.response?.data?.message || "Đăng nhập thất bại"
      return { success: false, error: message }
    }
  }, [saveAuthData, fetchProfile])

  // Đăng ký
  const register = useCallback(async (userData) => {
    try {
      const response = await registerUserApi(userData)
      return { success: true, data: response }
    } catch (error) {
      const message = error?.response?.data?.message || "Đăng ký thất bại"
      return { success: false, error: message }
    }
  }, [])

  // Đăng xuất
  const logout = useCallback((showToast = true) => {
    clearAuthData()
    if (showToast) {
      toast.success("Đã đăng xuất")
    }
  }, [clearAuthData])

  // Cập nhật profile (gọi sau khi edit profile thành công)
  const updateProfile = useCallback((updatedData) => {
    setProfile(prev => ({ ...prev, ...updatedData }))
    
    // Cập nhật user state nếu có fullname hoặc avatar
    if (updatedData.fullname || updatedData.avatar) {
      setUser(prev => ({
        ...prev,
        fullname: updatedData.fullname || prev?.fullname,
        avatar: updatedData.avatar || prev?.avatar
      }))
    }
    
    // Cập nhật localStorage
    const currentUser = JSON.parse(localStorage.getItem("userInfo") || "{}")
    const newUserInfo = { ...currentUser, ...updatedData }
    localStorage.setItem("userInfo", JSON.stringify(newUserInfo))
  }, [])

  // Refresh profile từ API
  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      return await fetchProfile(user.id)
    }
    return null
  }, [user?.id, fetchProfile])

  // Kiểm tra role
  const isAdmin = useCallback(() => {
    return user?.role === "admin"
  }, [user])

  const isClient = useCallback(() => {
    return user?.role === "client"
  }, [user])

  const value = {
    user,
    profile,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    refreshProfile,
    clearAuthData,
    isAdmin,
    isClient
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext
