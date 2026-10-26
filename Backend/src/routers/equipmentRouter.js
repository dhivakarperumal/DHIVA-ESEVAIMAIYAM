const express = require('express');
const fs = require('fs');
const { authenticate, authorize } = require('../security/authMiddleware');
const { upload, validateEquipmentUploads } = require('../middleware/equipmentUploadMiddleware');
const {
  getAllEquipment, getEquipmentById, createEquipment, updateEquipment,
  deleteEquipment, addMaintenance, getEquipmentFile,
} = require('../controllers/equipmentController');

const router = express.Router();
const equipmentUpload = upload.fields([
  { name: 'equipmentPhoto', maxCount: 1 },
  { name: 'purchaseInvoice', maxCount: 1 },
  { name: 'warrantyDocument', maxCount: 1 },
]);
const asyncRoute = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);

router.use(authenticate, authorize('Super Admin', 'Admin', 'Manager'));
router.route('/').get(asyncRoute(getAllEquipment)).post(equipmentUpload, validateEquipmentUploads, asyncRoute(createEquipment));
router.get('/:id/files/:fileType', asyncRoute(getEquipmentFile));
router.route('/:id').get(asyncRoute(getEquipmentById)).put(equipmentUpload, validateEquipmentUploads, asyncRoute(updateEquipment)).delete(asyncRoute(deleteEquipment));
router.post('/:id/maintenance', asyncRoute(addMaintenance));

router.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  const files = Object.values(req.files || {}).flat();
  Promise.all(files.map((file) => fs.promises.unlink(file.path).catch((cleanupError) => {
    if (cleanupError.code !== 'ENOENT') console.error('Unable to remove failed equipment upload:', cleanupError);
  }))).catch((cleanupError) => console.error('Unable to clean equipment uploads:', cleanupError));
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ success: false, message: 'Equipment documents cannot exceed 5 MB.' });
  }
  if (error.code?.startsWith('LIMIT_') || error.code === 'INVALID_FILE_CONTENT' || String(error.message || '').startsWith('Upload a JPEG')) {
    return res.status(400).json({ success: false, message: error.message || 'Invalid equipment upload.' });
  }
  console.error('Equipment request failed:', error);
  return res.status(500).json({ success: false, message: 'Unable to process equipment request.' });
});

module.exports = router;
