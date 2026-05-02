const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, default: "" },
  email: { type: String, unique: true },
  password: String,

  role: { type: String, default: "Aspiring Software Developer" },
  location: { type: String, default: "" },
  bio: { type: String, default: "" },
  avatar: { type: String, default: "" },

  github: { type: String, default: "" },
  linkedin: { type: String, default: "" },
  portfolio: { type: String, default: "" },
  leetcode: { type: String, default: "" },

  skills: { type: [String], default: [] },
  goals: { type: [String], default: [] },
  learning: { type: [String], default: [] },

  // Education Journey
  education: { type: [{
    school: String,
    degree: String,
    field: String,
    year: String,
  }], default: [] },

  // Experience & Internships
  experience: { type: [{
    company: String,
    role: String,
    duration: String,
    description: String,
  }], default: [] },

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);