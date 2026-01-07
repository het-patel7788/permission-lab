const mongoose = require("mongoose");

const LogSchema = new mongoose.Schema({
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  
  ipAddress: {
    type: String, 
    required: false,
  },
  device: {
    type: String,
    required: false,
  },

  photo: {
    type: String, 
    required: false,
  },

  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Log", LogSchema);