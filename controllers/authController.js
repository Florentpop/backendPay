const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Generate JWT
const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// 🟩 Register admin (you can run once manually or protect later)
exports.registerAdmin = async (req, res) => {
  try {
    const { phone, password, name } = req.body;

    const existingUser = await User.findOne({ phone });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const newUser = await User.create({ phone, password, name });
    res.status(201).json({ message: "Admin created successfully", user: newUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🟦 Login
exports.login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    const user = await User.findOne({ phone });
    if (!user) return res.status(400).json({ message: "Invalid phone or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid phone or password" });

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      token,
        user: {
    id: user._id,
    name: user.name,
    phone: user.phone
  }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🟨 Verify token (for route protection)
exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer "))
    return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
