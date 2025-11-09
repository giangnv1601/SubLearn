import multer from "multer";

const storage = multer.memoryStorage(); // lưu file trong RAM (chúng ta sẽ parse rồi lưu DB)

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/x-subrip" && !file.originalname.endsWith(".srt")) {
      return cb(new Error("Only .srt files are allowed"));
    }
    cb(null, true);
  },
});

export default upload;