const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const uploadDirectory = path.resolve(__dirname, '../../private/equipment');
fs.mkdirSync(uploadDirectory, { recursive: true });

const imageTypes = new Map([
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.png', 'image/png'],
  ['.webp', 'image/webp'],
]);
const documentTypes = new Map([
  ...imageTypes,
  ['.pdf', 'application/pdf'],
]);
const uploadFields = new Set(['equipmentPhoto', 'purchaseInvoice', 'warrantyDocument']);

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, callback) => callback(null, uploadDirectory),
    filename: (_req, file, callback) => callback(null, `equipment-${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`),
  }),
  limits: { fileSize: 5 * 1024 * 1024, files: 3 },
  fileFilter: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const allowedTypes = file.fieldname === 'equipmentPhoto' ? imageTypes : documentTypes;
    if (uploadFields.has(file.fieldname) && allowedTypes.get(extension) === file.mimetype) {
      callback(null, true);
      return;
    }
    callback(new Error('Upload a JPEG, PNG or WebP photo; purchase and warranty documents may also be PDF files.'));
  },
});

const validateEquipmentUploads = async (req, _res, next) => {
  try {
    const files = Object.values(req.files || {}).flat();
    for (const file of files) {
      const content = await fs.promises.readFile(file.path);
      const validSignature = file.mimetype === 'image/jpeg'
        ? content.length >= 3 && content[0] === 0xff && content[1] === 0xd8 && content[2] === 0xff
        : file.mimetype === 'image/png'
          ? content.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
          : file.mimetype === 'image/webp'
            ? content.subarray(0, 4).toString() === 'RIFF' && content.subarray(8, 12).toString() === 'WEBP'
            : file.mimetype === 'application/pdf' && content.subarray(0, 5).toString() === '%PDF-';
      if (!validSignature) {
        const error = new Error('The uploaded file content does not match its file type.');
        error.code = 'INVALID_FILE_CONTENT';
        throw error;
      }
    }
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { upload, uploadDirectory, validateEquipmentUploads };
