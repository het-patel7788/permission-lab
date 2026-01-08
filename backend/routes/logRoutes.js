const express = require("express");
const router = express.Router();
const Log = require("../models/Log");
const verifyToken = require("../middleware/authMiddleware");

router.post("/", async (req, res) => {
  try {
    const { latitude, longitude, device, photo } = req.body;

    const userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    const newLog = new Log({
      latitude,
      longitude,
      ipAddress: userIp,
      device,
      photo,
    });

    await newLog.save();
    res.status(201).json({ message: "Log Saved!" });   

  } catch (error) {
    console.error("Error saving log:", error);
    res.status(500).json({ error: "Server Error" });
  }
});

router.get("/", verifyToken, async (req, res) => {
  try {
    const allLogs = await Log.find().sort({ timestamp: -1 });
    res.json(allLogs);
  } catch (error) {
    res.status(500).json({ error: "Could not fetch logs" });
  }
});

module.exports = router;