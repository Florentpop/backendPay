const ActivityLog = require("../models/ActivityLog");

// 🟢 Log activity
exports.logActivity = async (userId, action, description = "") => {
  try {
    await ActivityLog.create({
      performedBy: userId,
      action,
      description,
    });
  } catch (err) {
    console.error("Error logging activity:", err.message);
  }
};

// 🟦 Get activity logs (admin only)
exports.getActivityLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.find()
      .populate("performedBy", "name phone role")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
