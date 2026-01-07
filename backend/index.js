const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const logRoutes = require("./routes/logRoutes");

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("DB Connected Successfully! "))
  .catch((err) => console.log("DB Connection Failed ", err));

app.get("/", (req, res) => {
  res.send("SpyLink Backend is Live!");
});

app.use("/api/logs", logRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on Port ${PORT}`);
});