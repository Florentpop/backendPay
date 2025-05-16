const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const voucherController = require('../controllers/voucherController');

// Create a new voucher
router.post('/', voucherController.createVoucher);

// Create bulk vouchers with excel
router.post('/upload', upload.single('file'), voucherController.uploadVouchers);

// Get all vouchers
router.get('/', voucherController.getVouchers);

// Get a voucher by code
router.get('/:code', voucherController.getVoucherByCode);

// Use a voucher
router.patch('/:code/use', voucherController.useVoucher);

module.exports = router;
