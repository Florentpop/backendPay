const express = require('express');
const router = express.Router();
const { verifyPayment, getAllPayments, getPaymentByReference, searchPayments } = require('../controllers/paymentController');

router.post('/verify-payment', verifyPayment);

// ✅ Get all payments
router.get('/', getAllPayments);

// ✅ Get single payment by reference
router.get('/:reference', getPaymentByReference);

// ✅ Search payments by phone or customer email
router.get('/search/query', searchPayments);

module.exports = router;
