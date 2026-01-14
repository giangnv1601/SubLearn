import axios from "axios"
import { toast } from "sonner"
import { refreshTokenApi } from "@/api"
import { triggerSessionExpired } from "@/contexts/AuthContext"

// Khởi tạo axios instance
let authorizedAxiosInstance = axios.create()
authorizedAxiosInstance.defaults.timeout = 1000 * 60 * 10

// Hàm cập nhập accessToken vào localStorage + axios defaults
const setAccessToken = (token) => {
  localStorage.setItem("accessToken", token)
  authorizedAxiosInstance.defaults.headers.common.Authorization = `Bearer ${token}`
}

let refreshPromise = null
// Hàm refresh accessToken (single-flight)
const refreshAccessTokenSingleFlight = () => {
  if (!refreshPromise) {
    const refreshToken = localStorage.getItem("refreshToken")

    refreshPromise = refreshTokenApi(refreshToken)
      .then((data) => {
        // data = { accessToken }
        setAccessToken(data.accessToken)
        return data.accessToken
      })
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

// Request interceptor
authorizedAxiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken")
    if (accessToken) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
authorizedAxiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Trường hợp không có response
    if (!error.response) {
      toast.error(error.message || "Network error")
      return Promise.reject(error)
    }

    // Tránh loop: nếu chính request refresh-token fail thì không refresh lại nữa
    // (Endpoint: /api/users/refresh-token)
    const isRefreshCall = originalRequest?.url?.includes("/api/users/refresh-token")

    // Trường hợp hết hạn accessToken (status: 410) -> refresh (single-flight) -> retry
    if (
      error.response.status === 410 &&
      !originalRequest?._retry &&
      !isRefreshCall
    ) {
      originalRequest._retry = true

      try {
        const newAccessToken = await refreshAccessTokenSingleFlight()

        // Cập nhật lại header cho chính originalRequest
        originalRequest.headers = originalRequest.headers || {}
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

        return authorizedAxiosInstance(originalRequest)
      } catch (refreshErr) {
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.")

        // Gọi handler logout từ AuthContext
        setTimeout(() => {
          triggerSessionExpired()
        }, 1500)

        return Promise.reject(refreshErr)
      }
    }

    // Hiển thị toast lỗi chung khác
    const message = error?.response?.data?.message || error?.message
    if (error.response.status !== 410) {
      toast.error(message)
    }

    return Promise.reject(error)
  }
)

export default authorizedAxiosInstance
