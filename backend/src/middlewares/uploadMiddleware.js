import multer from 'multer'

const LIMIT_COMMON_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOW_COMMON_FILE_TYPES = ['image/jpg', 'image/jpeg', 'image/png']

const customFileAvatar = (req, file, callback) => {
  if (!ALLOW_COMMON_FILE_TYPES.includes(file.mimetype)) {
    const errMessage = 'File type is invalid. Only accept jpg, jpeg and png'
    return callback(new Error(errMessage), false)
  }
  return callback(null, true)
}

const customFileSubtitle = (req, file, callback) => {
  // Cho phép cả mime type và kiểm tra đuôi file .srt
  const allowed = ['application/x-subrip', 'application/octet-stream', 'text/plain', 'text/x-subrip']
  const extOk = (file.originalname || '').toLowerCase().endsWith('.srt')
  if (!allowed.includes(file.mimetype) && !extOk) {
    const errMessage = 'File type is invalid. Only accept .srt subtitle files'
    return callback(new Error(errMessage), false)
  }
  return callback(null, true)
}

const uploadAvatar = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: LIMIT_COMMON_FILE_SIZE },
  fileFilter: customFileAvatar
}).single('avatar')

const uploadSubtitle = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: LIMIT_COMMON_FILE_SIZE },
  fileFilter: customFileSubtitle
}).single('subtitle')

export const uploadMiddleware = { uploadAvatar, uploadSubtitle }