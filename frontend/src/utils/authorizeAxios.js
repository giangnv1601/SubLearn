import axios from 'axios'
import { toast } from 'sonner'
import { refreshTokenApi } from '../api'

// Khởi tạo đối tượng axios để custom và cấu hình dự án
let authorizedAxiosInstance = axios.create()

authorizedAxiosInstance.defaults.timeout = 1000 * 60 * 10

// Can thiệp vào request API
authorizedAxiosInstance.interceptors.request.use((config) => {
    // Lấy accessToken từ localStorage va đính kèm vào header
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  }, (error) => {
    return Promise.reject(error);
  }
);

// Can thiệp vào response API
authorizedAxiosInstance.interceptors.response.use((response) => {
    return response;
  }, (error) => {

    // Nếu nhận mã 401 từ BE thì logout luôn
    if(error.response?.status === 401) {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('userInfo')

      window.location.href = '/login'
    }

    // Nếu nhận mã 410 từ BE thì goi api refresh token để làm mới token
    const originalRequest = error.config
    if(error.response?.status === 410 && !originalRequest._retry) {
      originalRequest._retry = true
      const refreshToken = localStorage.getItem('refreshToken')
      // Gọi api refresh token
      return refreshTokenApi(refreshToken)
        .then((data) => {
          // Lưu accessToken mới vào localStorage
          localStorage.setItem('accessToken', data.accessToken)
          authorizedAxiosInstance.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`
          
          return authorizedAxiosInstance(originalRequest)
        })
        .catch((error) => {
          // console.error('Refresh token error:', error)

          // logout
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          localStorage.removeItem('userInfo')
          window.location.href = '/login'
          return Promise.reject(error)
        })
        
    }


    const message = error?.response?.data?.message || error?.message
    // Hiển thị toast lỗi chung cho các lỗi khác ngoài 410
    if (error.response?.status !== 410) {
      toast.error(message)
    }

    return Promise.reject(error)
  });


export default authorizedAxiosInstance
