// controllers/announcementController.js
const Announcement = require('../models/Announcement');

// Get All announcement
exports.allAnnouncement = async (req, res) => {
  try {
    const latest = await Announcement.find();
    res.status(200).json(latest);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.getAnnouncement = async (req, res) => {
    try {
      const announcements = await Announcement.find({ visible: true }).sort({ createdAt: -1 }); // only visible
      res.status(200).json(announcements);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching announcements', error });
    }
  };
  

// Create a new announcement
exports.createAnnouncement = async (req, res) => {
    try {
      const { message, visible } = req.body;
      const newAnnouncement = new Announcement({ message, visible });
      await newAnnouncement.save();
      res.status(201).json(newAnnouncement);
    } catch (error) {
      res.status(500).json({ message: 'Error creating announcement', error });
    }
  };
  

// Edit an announcement by ID
exports.editAnnouncement = async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await Announcement.findByIdAndUpdate(
        id,
        { message: req.body.message, visible: req.body.visible },
        { new: true }
      );
  
      if (!updated) return res.status(404).json({ message: 'Announcement not found' });
  
      res.status(200).json(updated);
    } catch (error) {
      res.status(500).json({ message: 'Error updating announcement', error });
    }
  };
  
  // Delete an announcement by ID
  exports.deleteAnnouncement = async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await Announcement.findByIdAndDelete(id);
  
      if (!deleted) return res.status(404).json({ message: 'Announcement not found' });
  
      res.status(200).json({ message: 'Announcement deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting announcement', error });
    }
  };
  