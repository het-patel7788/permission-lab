const express = require("express");
const router = express.Router();
const Log = require("../models/Log");
const verifyToken = require("../middleware/authMiddleware");

router.post("/", async (req, res) => {
  try {
    console.log("=== POST /api/logs ===");
    console.log("Request body:", JSON.stringify(req.body, null, 2));
    
    const { latitude, longitude, device, photo } = req.body;

    // Validate and convert to numbers
    if (latitude === undefined || longitude === undefined || latitude === null || longitude === null) {
      console.error("Missing latitude or longitude");
      return res.status(400).json({ error: "Latitude and longitude are required" });
    }

    // Convert to numbers if they're strings
    const lat = Number(latitude);
    const lng = Number(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      console.error("Invalid latitude or longitude values");
      return res.status(400).json({ error: "Latitude and longitude must be valid numbers" });
    }

    const userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip || "Unknown";

    console.log("Creating log with:", { lat, lng, device, ip: userIp });

    const newLog = new Log({
      latitude: lat,
      longitude: lng,
      ipAddress: userIp,
      device: device || "Unknown",
      photo: photo || null,
    });

    console.log("Saving to MongoDB...");
    const savedLog = await newLog.save();
    console.log("SAVED! Document ID:", savedLog._id);
    console.log("Full document:", JSON.stringify(savedLog, null, 2));
    
    // Send response immediately
    res.status(201).json({ 
      success: true,
      message: "Log Saved!", 
      logId: savedLog._id,
      timestamp: savedLog.timestamp
    });   

  } catch (error) {
    console.error("ERROR saving log:");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    if (error.errors) {
      console.error("Validation errors:", error.errors);
    }
    console.error("Full error:", error);
    res.status(500).json({ 
      success: false,
      error: "Server Error", 
      details: error.message 
    });
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