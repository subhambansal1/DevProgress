const express = require("express");
const router = express.Router();
const axios = require("axios");

// Simple cache
const cache = {};
const CACHE_TIME = 10 * 60 * 1000; // 10 minutes

router.get("/:username", async (req, res) => {
  const { username } = req.params;

  // Cache check
  if (cache[username] && Date.now() - cache[username].time < CACHE_TIME) {
    return res.json(cache[username].data);
  }

  try {
    const headers = {};
    if (process.env.GITHUB_TOKEN) {
      headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const response = await axios.get(
      `https://api.github.com/users/${username}`,
      { headers }
    );

    cache[username] = { data: response.data, time: Date.now() };
    res.json(response.data);

  } catch (error) {
    if (cache[username]) return res.json(cache[username].data);
    console.error("GitHub error:", error.response?.status, error.response?.data?.message);
    res.status(500).json({ message: "GitHub fetch failed" });
  }
});

module.exports = router;