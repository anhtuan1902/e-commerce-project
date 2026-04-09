const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const AppError = require('../utils/ApiError');

const mime2ext = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../../uploads/avatars');
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    console.log('originalname:', file.originalname);
    console.log('mimetype:', file.mimetype);
    console.log('ext from path.extname:', path.extname(file.originalname));

    const ext = path.extname(file.originalname) || mime2ext[file.mimetype] || '.jpg';
    console.log('final ext:', ext);

    cb(null, `${uuidv4()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) return cb(null, true);
  cb(new AppError('Chỉ chấp nhận file ảnh (jpg, png, webp)', 400));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

module.exports = upload;
