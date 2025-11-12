import { JwtService } from "../services/JwtService.js"
import { env } from "../config/environment.js"

// Xác thực người dùng qua JWT
const isAuthorized = async (req, res, next) => {
  // Lấy accessToken từ header Authorization lưu ở LocalStorage bên FE
  const accessTokenFromHeader = req.headers.authorization
  if (!accessTokenFromHeader) {
    res.status(401).json({ message: 'Unauthorized! (Token not found)' })
    return
  }

  try {
    // Thực hiện giải mã token xem có hợp lệ hay không
    const token = accessTokenFromHeader.split(' ')[1]
    const accessTokenDecoded = await JwtService.verifyToken( token, env.ACCESS_TOKEN_SECRET_SIGNATURE )

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

export const authMiddleware = { isAuthorized }


