require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const githubRoutes = require("./routes/github");
const leetcodeRoutes = require("./routes/leetcode");
const certificateRoutes = require("./routes/certificate");
const aiRoutes = require("./routes/ai");
const profileRoutes = require("./routes/profile");


const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Atlas connected");
  })
  .catch((err) => {
    console.log("❌ MongoDB connection error:", err);
  });

/* ROUTES */
app.use("/api/auth", authRoutes);
app.use("/api/github", githubRoutes);
app.use("/api/leetcode", leetcodeRoutes);
app.use("/api/certificate", certificateRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/profile", profileRoutes);

/* SERVER */
app.listen(process.env.PORT || 5000, () => {
  console.log("🚀 Server running on port 5000");
});