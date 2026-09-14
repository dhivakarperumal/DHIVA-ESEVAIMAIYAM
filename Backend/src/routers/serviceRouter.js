const express = require('express');
const { getAllServices, getService, createService, updateService, deleteService } = require('../controllers/serviceController');

const router = express.Router();

router.route('/').get(getAllServices).post(createService);
router.route('/:id').get(getService).put(updateService).delete(deleteService);

module.exports = router;
