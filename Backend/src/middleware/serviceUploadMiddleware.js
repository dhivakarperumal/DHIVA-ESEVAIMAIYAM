const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../../uploads/services');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, uploadDir),
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    callback(null, `service-${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`);
  },
});

const imageTypes = /jpeg|jpg|png|webp|gif/;
const imageFilter = (_req, file, callback) => {
  const extensionValid = imageTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeValid = imageTypes.test(file.mimetype);
  callback(null, extensionValid && mimeValid);
};

module.exports = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFilter,
});
