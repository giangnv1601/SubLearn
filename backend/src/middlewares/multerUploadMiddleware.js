import multer from 'multer'

const LIMIT_COMMON_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOW_COMMON_FILE_TYPES = ['image/jpg', 'image/jpeg', 'image/png']

const customFileFilter = (req, file, callback) => {
  if (!ALLOW_COMMON_FILE_TYPES.includes(file.mimetype)) {
    const errMessage = 'File type is invalid. Only accept jpg, jpeg and png'
    return callback(new Error(errMessage), false)
  }
  return callback(null, true)
}

const uploadAvatar = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: LIMIT_COMMON_FILE_SIZE },
  fileFilter: customFileFilter
}).single('avatar')

export const multerUploadMiddleware = { uploadAvatar }
