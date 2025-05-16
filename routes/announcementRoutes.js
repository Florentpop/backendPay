const express = require('express');
const router = express.Router();
const {
  getAnnouncement,
  createAnnouncement,
  editAnnouncement,
  deleteAnnouncement,
  allAnnouncement
} = require('../controllers/announcementController');

router.get('/', getAnnouncement);
router.get('/all', allAnnouncement);
router.post('/', createAnnouncement);
router.put('/:id', editAnnouncement);     // Edit announcement
router.delete('/:id', deleteAnnouncement); // Delete announcement

module.exports = router;

