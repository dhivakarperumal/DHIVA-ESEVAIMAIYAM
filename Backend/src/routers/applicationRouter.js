const express = require('express');
const controller = require('../controllers/applicationController');

const router = express.Router();

router.route('/').get(controller.getAllApplications).post(controller.createApplication);
router.delete('/:id', controller.deleteApplication);

module.exports = router;
