const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const logRoutes = require("./routes/logRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// MongoDB Connection
if (!process.env.MONGO_URL) {
  console.error("WARNING: MONGO_URL not found in environment variables!");
  console.error("Please check your .env file in the backend folder");
} else {
  console.log("Connecting to MongoDB...");
  mongoose.connect(process.env.MONGO_URL, {
    // Connection options for better reliability
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  })
    .then(() => {
      console.log("MongoDB Connected Successfully!");
      console.log("Database:", mongoose.connection.name);
      console.log("Host:", mongoose.connection.host);
    })
    .catch((err) => {
      console.error("MongoDB Connection Failed!");
      console.error("Error:", err.message);
      console.error("Make sure your MONGO_URL is correct and your IP is whitelisted in MongoDB Atlas");
    });
}

app.get("/", (req, res) => {
  res.send("SpyLink Backend is Live!");
});

app.use("/api/logs", logRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on Port ${PORT}`);
});