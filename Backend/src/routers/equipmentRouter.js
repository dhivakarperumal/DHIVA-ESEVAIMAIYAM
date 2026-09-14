const express = require('express');
const upload = require('../middleware/uploadMiddleware');
const {
  getAllEquipment, getEquipmentById, createEquipment, updateEquipment,
  deleteEquipment, addMaintenance,
} = require('../controllers/equipmentController');

const router = express.Router();
const equipmentUpload = upload.fields([
  { name: 'equipmentPhoto', maxCount: 1 },
  { name: 'purchaseInvoice', maxCount: 1 },
  { name: 'warrantyDocument', maxCount: 1 },
]);

router.route('/').get(getAllEquipment).post(equipmentUpload, createEquipment);
router.route('/:id').get(getEquipmentById).put(equipmentUpload, updateEquipment).delete(deleteEquipment);
router.post('/:id/maintenance', addMaintenance);

module.exports = router;
