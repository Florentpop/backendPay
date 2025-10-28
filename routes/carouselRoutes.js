const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadCarousel');
const {
  uploadCarousel,
  getActiveCarousel,
  deleteCarousel
} = require('../controllers/carouselController');

// Upload new carousel image
router.post('/', upload.single('image'), uploadCarousel);

// Get all active images
router.get('/', getActiveCarousel);

// Delete image (optional)
router.delete('/:id', deleteCarousel);

module.exports = router;
