const multer = require("multer");
const path = require("path");

// استخدام الذاكرة بدل الحفظ على الجهاز
const storage = multer.memoryStorage();

// تحديد أنواع الملفات المسموح بها (صور فقط)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true); // يسمح بتحميل الملف
  } else {
    cb(new Error("Only images are allowed"), false); // يرفض الملف
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: fileFilter, // إضافة التحقق من نوع الملف
});

module.exports = upload;
