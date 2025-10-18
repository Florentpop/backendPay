const express = require("express");
const router = express.Router();
const { login, registerAdmin, verifyToken } = require("../controllers/authController");

// Only use register once to create admin
router.post("/register", registerAdmin);
router.post("/login", login);

// Example of a protected route
router.get("/check", verifyToken, (req, res) => {
  res.json({ message: "Token valid", user: req.user });
});

module.exports = router;
