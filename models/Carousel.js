const mongoose = require('mongoose');

const CarouselSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },
  caption: { type: String },
  publicId: { type: String }, // Store Cloudinary public ID for deletion
  active: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Carousel', CarouselSchema);
