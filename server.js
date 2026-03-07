require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Security: CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(",")
      : ["http://localhost:5173", "http://localhost:3000"];

    // Allow requests with no origin (mobile apps, Postman, ESP32)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

// Security: Limit request body size
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Health check endpoint
app.get("/health", (req, res) => {
  const healthCheck = {
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    database:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  };
  res.json(healthCheck);
});

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/shipments", require("./routes/shipmentRoutes"));
app.use("/api/events", require("./routes/eventRoutes"));

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// MongoDB Connection with retry logic
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI environment variable is not defined");
    }

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("✅ MongoDB Connected Successfully");
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err.message);
    console.error("Retrying in 5 seconds...");
    setTimeout(connectDB, 5000);
  }
};

connectDB();

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} received. Closing server gracefully...`);
  try {
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
    process.exit(0);
  } catch (err) {
    console.error("Error during shutdown:", err);
    process.exit(1);
  }
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 IntelliShip Backend running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});

module.exports = server;
