import { JwtProvider } from "../providers/JwtProvider.js"
import { env } from "../config/environment.js"

// Xác thực người dùng qua JWT
const isAuthorized = async (req, res, next) => {
  // Set no-cache headers cho protected routes để tránh browser cache auth errors
  res.set({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  })

  // Lấy accessToken từ header Authorization lưu ở LocalStorage bên FE
  const accessTokenFromHeader = req.headers.authorization
  if (!accessTokenFromHeader) {
    res.status(401).json({ message: 'Unauthorized! (Token not found)' })
    return
  }

  try {
    // Thực hiện giải mã token xem có hợp lệ hay không
    const token = accessTokenFromHeader.split(' ')[1]
    const accessTokenDecoded = await JwtProvider.verifyToken( token, env.ACCESS_TOKEN_SECRET_SIGNATURE )

    // Lưu thông tin giải mã được vào req.jwtDecoded để sử dụng cho các tầng xử lý phía sau
    req.jwtDecoded = accessTokenDecoded

    next()
  } catch (error) {
    console.log("Error in authMiddleware:", error)

    // Trường hợp JWT hết hạn
    if (error.name === 'TokenExpiredError') {
      return res.status(410).json({ message: 'Unauthorized! (Token expired)' })
    }

    // Trường hợp JWT không hợp lệ
    res.status(401).json({ message: 'Unauthorized! (Invalid token)' })
  }
}

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.jwtDecoded) {
      return res.status(401).json({ message: 'Unauthorized!' })
    }
    if (!roles.includes(req.jwtDecoded.role)) {
      return res.status(403).json({ message: 'Forbidden! (Insufficient permissions)' })
    }
    next()
  }
}

const isAdmin = requireRole('admin')
const isClient = requireRole('client')
const isAdminOrClient = requireRole('admin', 'client')

export const authMiddleware = { isAuthorized, isAdmin, isClient, isAdminOrClient }



