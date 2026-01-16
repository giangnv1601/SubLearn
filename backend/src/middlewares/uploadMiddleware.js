import multer from 'multer'

const LIMIT_COMMON_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOW_COMMON_FILE_TYPES = ['image/jpg', 'image/jpeg', 'image/png', 'image/webp']

const customFileAvatar = (req, file, callback) => {
  if (!ALLOW_COMMON_FILE_TYPES.includes(file.mimetype)) {
    const errMessage = 'File type is invalid. Only accept jpg, jpeg, png and webp'
    return callback(new Error(errMessage), false)
  }
  return callback(null, true)
}

const customFileSubtitle = (req, file, callback) => {
  const allowed = ['application/x-subrip', 'application/octet-stream', 'text/plain', 'text/x-subrip']
  const extOk = (file.originalname || '').toLowerCase().endsWith('.srt')
  if (!allowed.includes(file.mimetype) && !extOk) {
    const errMessage = 'File type is invalid. Only accept .srt subtitle files'
    return callback(new Error(errMessage), false)
  }
  return callback(null, true)
}

// Upload cho avatar
const uploadAvatar = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: LIMIT_COMMON_FILE_SIZE },
  fileFilter: customFileAvatar
}).single('avatar')

// Upload cho subtitle
const uploadSubtitle = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: LIMIT_COMMON_FILE_SIZE },
  fileFilter: customFileSubtitle
}).single('subtitle')

// Upload cho movie images (thumb và poster)
const uploadMovieImages = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: LIMIT_COMMON_FILE_SIZE },
  fileFilter: customFileAvatar
}).fields([
  { name: 'thumb_url', maxCount: 1 },
  { name: 'poster_url', maxCount: 1 }
])

export const uploadMiddleware = { uploadAvatar, uploadSubtitle, uploadMovieImages }