import bcrypt from 'bcrypt'
import User from '../models/userModel.js'

// POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { email, password, fullname } = req.body

    // 1 Kiểm tra email đã tồn tại
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(409).json({ message: 'Email already exists', field: 'email' })
    }

    // 2 Hash mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10)

    // 3 Tạo user mới (avatar, role sẽ lấy mặc định từ schema)
    const newUser = await User.create({
      email,
      password: hashedPassword,
      fullname: fullname.trim()
    })

    // 4 Ẩn password trước khi trả về
    const userSafe = newUser.toObject()
    delete userSafe.password

    res.status(201).json({
      message: 'Registration successful',
      user: userSafe
    })
  } catch (err) {
    console.error('Register error:', err)

    // Duplicate email (MongoDB code 11000)
    if (err?.code === 11000 && err?.keyPattern?.email) {
      return res.status(409).json({ message: 'Email already exists', field: 'email' })
    }

    // Validation errors (mongoose)
    if (err?.name === 'ValidationError') {
      const firstError = Object.values(err.errors)[0]?.message || 'Validation error'
      return res.status(422).json({ message: firstError })
    }

    // Lỗi khác (Internal Server Error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
