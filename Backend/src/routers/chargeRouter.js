const express = require('express');
const { getAllCharges, getCharge, createCharge, updateCharge, deleteCharge } = require('../controllers/chargeController');

const router = express.Router();

router.route('/').get(getAllCharges).post(createCharge);
router.route('/:id').get(getCharge).put(updateCharge).delete(deleteCharge);

module.exports = router;
