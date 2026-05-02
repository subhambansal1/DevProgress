const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Middleware — token verify karo
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

// GET profile
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    console.log("📤 Returning profile with education:", user.education, "and experience:", user.experience);
    res.json(user);
  } catch (err) {
    console.error("❌ GET profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// UPDATE profile
router.put("/", auth, async (req, res) => {
  try {
    console.log("📥 Backend received update request:", req.body);
    
    const { name, role, location, bio, avatar, github, linkedin, portfolio, leetcode, skills, goals, learning, education, experience } = req.body;

    console.log("🎓 Education received:", education);
    console.log("💼 Experience received:", experience);

    const updateData = {
      name,
      role,
      location,
      bio,
      avatar,
      github,
      linkedin,
      portfolio,
      leetcode,
      skills,
      goals,
      learning,
      education: education || [],
      experience: experience || [],
    };

    console.log("💾 Updating user with:", updateData);

    const user = await User.findByIdAndUpdate(
  req.userId,
  updateData,
  { new: true, runValidators: true }
).select("-password");

    console.log("✅ User updated successfully:", user);
    res.json(user);
  } catch (err) {
    console.error("❌ Backend error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;