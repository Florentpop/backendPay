const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  message: { type: String, required: true },
  visible: { type: Boolean, default: true }
}, { timestamps: true });


module.exports = mongoose.model('Announcement', announcementSchema);
