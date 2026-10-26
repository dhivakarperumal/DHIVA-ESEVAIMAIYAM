const express = require('express');
const controller = require('../controllers/paymentController');
const { authenticate, authorize } = require('../security/authMiddleware');

const router = express.Router();
const paymentAdmins = [authenticate, authorize('Super Admin', 'Admin')];

router.use(...paymentAdmins);
router.get('/options', controller.getOptions);
router.get('/', controller.getAllPayments);
router.post('/', controller.createPayment);
router.get('/:id', controller.getPayment);
router.patch('/:id/status', controller.updatePaymentStatus);
router.post('/:id/refunds', controller.requestRefund);
router.post('/refunds/:refundId/confirm', controller.confirmRefund);

module.exports = router;
