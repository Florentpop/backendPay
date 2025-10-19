const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { logActivity } = require("./activityController");


// Generate JWT
const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// 🟩 Register admin (run once manually)
exports.registerAdmin = async (req, res) => {
  try {
    const { phone, password, name } = req.body;

    const existingUser = await User.findOne({ phone });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const newUser = await User.create({
      phone,
      password,
      name,
      role: "admin", // default admin
    });

    res
      .status(201)
      .json({ message: "Admin created successfully", user: newUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🟦 Login
exports.login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    const user = await User.findOne({ phone });
    if (!user)
      return res.status(400).json({ message: "Invalid phone or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid phone or password" });

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
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

// 🟥 Restrict access to admin users
exports.requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Access denied. Admins only." });
  }
  next();
};

// 🧩 Create new user (admin only)
exports.createUser = async (req, res) => {
  try {
    const { name, phone, password, role } = req.body;

    const existing = await User.findOne({ phone });
    if (existing)
      return res.status(400).json({ message: "Phone already registered" });

    const newUser = await User.create({
      name,
      phone,
      password,
      role: role || "staff",
    });
   await logActivity(req.user.id, "Created User", `Created ${newUser.name} (${newUser.phone})`);
    res.status(201).json({ success: true, data: newUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📋 Get all users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🧱 Update user (role or password)
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, password,name } = req.body;

    const updates = {};
    if (role) updates.role = role;
     if (name) updates.name = name;
    if (password) updates.password = await bcrypt.hash(password, 10);

    const user = await User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    await logActivity(req.user.id, "Updated User", `Updated ${user.name || user.phone}`);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ success: true, message: "User updated", data: user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🗑️ Delete user (prevent deleting admins)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the user we’re trying to delete
    const userToDelete = await User.findById(id);
    if (!userToDelete) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🚫 Prevent deleting admin or superadmin accounts
    if (["admin", "superadmin"].includes(userToDelete.role)) {
      return res.status(403).json({ message: "Admin accounts cannot be deleted" });
    }

    // Delete the user if allowed
    await User.findByIdAndDelete(id);

    // Log the deletion (optional if you use activity logs)
    await logActivity(req.user.id, "Deleted User", `Deleted user ID: ${id}`);

    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

