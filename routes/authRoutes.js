const express = require("express");
const router = express.Router();
const {
  registerAdmin,
  login,
  verifyToken,
  requireAdmin,
  createUser,
  getUsers,
  updateUser,
  deleteUser,
} = require("../controllers/authController");
const { getActivityLogs } = require("../controllers/activityController");

// Public
router.post("/login", login);
router.post("/register-admin", registerAdmin);

// Admin-only
router.post("/create-user", verifyToken, requireAdmin, createUser);
router.get("/users", verifyToken, requireAdmin, getUsers);
router.put("/users/:id", verifyToken, requireAdmin, updateUser);
router.delete("/users/:id", verifyToken, requireAdmin, deleteUser);

router.get("/activity-logs", verifyToken, requireAdmin, getActivityLogs);

module.exports = router;
