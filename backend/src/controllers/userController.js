import bcrypt from 'bcrypt'
import User from '../models/userModel.js'
import { JwtService } from '../services/JwtService.js'
import { CloudinaryService } from '../services/CloudinaryService.js'
import { env } from '../config/environment.js'

// Đăng ký
export const register = async (req, res) => {
  try {
    let { email, password, fullname } = req.body

    if (!email || !password || !fullname) {
      return res.status(400).json({ message: 'fullname, email and password are required' })
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(409).json({ message: 'Email already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = await User.create({
      email,
      password: hashedPassword,
      fullname
    })

    const userSafe = newUser.toObject()
    delete userSafe.password

    res.status(201).json({ message: 'Registration successful', user: userSafe })
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Đăng nhập
export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    // Trường hợp đúng thông tin tài khoản, tạo token và trả về cho client
    // Tạo thông tin payload để đính kèm trong JWT token: bao gồm id, email, role
    const userInfo = {
      id: user._id,
      email: user.email,
      role: user.role
    }

    // Tạo accessToken
    const accessToken = await JwtService.generateToken(
      userInfo,
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      '1h'
    )

    // Tạo refreshToken
    const refreshToken = await JwtService.generateToken(
      userInfo,
      env.REFRESH_TOKEN_SECRET_SIGNATURE,
      '7d'
    )

    res.status(200).json({ ...userInfo , accessToken, refreshToken })
  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

// Refresh token
export const refreshToken = async (req, res) => {
  try {
    const refreshTokenFromBody = req.body?.refreshToken

    const refreshTokenDecoded = await JwtService.verifyToken(
      refreshTokenFromBody,
      env.REFRESH_TOKEN_SECRET_SIGNATURE
    )

    // Tạo mới accessToken
    const userInfo = {
      id: refreshTokenDecoded.id,
      email: refreshTokenDecoded.email,
      role: refreshTokenDecoded.role
    }

    const accessToken = await JwtService.generateToken(
      userInfo,
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      '1h'
    )

    res.status(200).json({ accessToken })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Refresh token API failed' })
  }
}

// Lấy thông tin người dùng
export const getProfile = async (req, res) => {
  try {
    const userId = req.params.id
    const user = await User.findById(userId).select('-password')

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.status(200).json(user)
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Đổi mật khẩu
export const changePassword = async (req, res) => {
  try {
    const userId = req.params.id
    const { currentPassword, newPassword } = req.body
    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    const isMatch = await bcrypt.compare(currentPassword, user.password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' })
    }
    const hashedNewPassword = await bcrypt.hash(newPassword, 10)
    user.password = hashedNewPassword
    await user.save()
    res.status(200).json({ message: 'Password changed successfully' })
  } catch (error) {
    console.error('Change password error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

export const updateProfile = async (req, res) => {
  try {
    const userId = req.params.id
    const { fullname } = req.body
    const userAvatarFile = req.file

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Nếu có upload file avatar
    if (userAvatarFile) {
      // Upload lên Cloudinary, folder "user/avatars"
      const uploadResult = await CloudinaryService.streamUpload(userAvatarFile.buffer, 'user')

      // Lưu lại URL
      user.avatar = uploadResult.secure_url
    }

    // Nếu có đổi fullname
    if (fullname) {
      user.fullname = fullname
    }

    await user.save()

    res.status(200).json({
      message: 'Profile updated successfully',
      data: {
        fullname: user.fullname,
        avatar: user.avatar
      }
    })
  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
