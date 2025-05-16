const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
  },
  visible: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model('Announcement', announcementSchema);
