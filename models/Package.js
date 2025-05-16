const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PackageSchema = new Schema({
  name: { type: String, required: true },
  active: { type: Boolean, default: true },
  duration: { type: String, required: true },
  price: { type: Number, required: true, min: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Package', PackageSchema);
