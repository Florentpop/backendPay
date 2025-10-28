const Carousel = require('../models/Carousel');
const cloudinary = require('../config/cloudinary');

// 📤 Upload new carousel image
exports.uploadCarousel = async (req, res) => {
  try {
    if (!req.file || !req.file.path) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    const { caption, order } = req.body;

    const image = new Carousel({
      imageUrl: req.file.path,
      publicId: req.file.filename,
      caption,
      order,
    });

    await image.save();
    res.status(201).json(image);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📥 Get all active carousel images
exports.getActiveCarousel = async (req, res) => {
  try {
    const images = await Carousel.find({ active: true }).sort({ order: 1 });
    res.status(200).json(images);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ❌ Delete carousel image (optional)
exports.deleteCarousel = async (req, res) => {
  try {
    const image = await Carousel.findById(req.params.id);
    if (!image) return res.status(404).json({ error: 'Image not found' });

    await cloudinary.uploader.destroy(image.publicId);
    await image.deleteOne();

    res.status(200).json({ message: 'Image deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
