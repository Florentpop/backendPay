const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  reference: { type: String, required: true },
  email: { type: String },
  amount: { type: Number },
  phone: { type: String },
  status: { type: String },
  gateway_response: { type: String },
  paid_at: { type: Date },
  packageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Package' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Payment', PaymentSchema);
