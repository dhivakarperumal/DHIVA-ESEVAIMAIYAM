const express = require('express');
const { getAllServices, getService, createService, updateService, deleteService } = require('../controllers/serviceController');
const serviceUpload = require('../middleware/serviceUploadMiddleware');

const router = express.Router();

router.route('/').get(getAllServices).post(serviceUpload.single('service_image'), createService);
router.route('/:id').get(getService).put(serviceUpload.single('service_image'), updateService).delete(deleteService);

module.exports = router;
