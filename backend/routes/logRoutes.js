const express = require("express");
const router = express.Router();
const Log = require("../models/Log");

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

module.exports = router;