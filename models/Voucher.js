const mongoose = require('mongoose');

const VoucherSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  package: { type: String, required: true },
  price: { type: Number, required: true },
  used: { type: Boolean, default: false },
  assignedTo: { type: String },
  usedAt: { type: Date }
});

module.exports = mongoose.model('Voucher', VoucherSchema);
