const express = require("express");
const cors = require("cors");
const http = require("http");
const path = require("path");
const fs = require("fs");
const redisConfig = require("./config/redis");
const realtime = require("./services/realtime");
const { startLiveSimulator } = require("./services/liveSimulator");

require("dotenv").config();

const connectDB = require("./config/db");
const vehicleRoutes = require("./routes/vehicleRoutes");
const authRoutes = require("./routes/authRoutes");
const driverRoutes = require("./routes/driverRoutes");
const tripRoutes = require("./routes/tripRoutes");
const alertRoutes = require("./routes/alertRoutes");
const aiRoutes = require("./routes/aiRoutes");
const enterpriseRoutes = require("./routes/enterpriseRoutes");
const auditRoutes = require("./routes/auditRoutes");
const { bootstrapDemoData } = require("./services/bootstrap");
const { Server } = require("socket.io");

const app = express();

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : ["http://localhost:5173", "http://localhost:4173"];

app.use(
  cors({
    origin(origin, callback) {
      // Same-origin / server requests / Reflect in production when not configured
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      // Single-service deploy: allow the Render host even if env not set yet
      if (process.env.NODE_ENV === "production") {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/enterprise", enterpriseRoutes);
app.use("/api/audit", auditRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "FleetDash API",
    redis: redisConfig.isRedisConnected(),
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.get("/", (req, res) => {
  const distIndex = path.join(__dirname, "../frontend/dist/index.html");
  if (fs.existsSync(distIndex)) {
    return res.sendFile(distIndex);
  }
  res.json({
    message: "FleetDash Backend Running",
    health: "/api/health",
  });
});

// Serve built frontend (single-service Render deploy)
const frontendDist = path.join(__dirname, "../frontend/dist");
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get(/^\/(?!api).*/, (req, res, next) => {
    if (req.path.startsWith("/socket.io")) return next();
    res.sendFile(path.join(frontendDist, "index.html"));
  });
}

const server = http.createServer(app);

const socketOrigins = process.env.SOCKET_ORIGIN
  ? process.env.SOCKET_ORIGIN.split(",").map((o) => o.trim())
  : process.env.NODE_ENV === "production"
    ? true
    : allowedOrigins;

const io = new Server(server, {
  cors: { origin: socketOrigins, credentials: true },
  maxHttpBufferSize: 1e6,
});

realtime.setIO(io);

const setupRedisListener = () => {
  try {
    const subscriber = redisConfig.createSubscriber();
    if (!subscriber) return;

    subscriber.subscribe("vehicle:updates", "alerts", (err, count) => {
      if (err) console.error("Subscribe error:", err);
      else console.log(`📡 Subscribed to ${count} Redis channel(s)`);
    });

    subscriber.on("message", (channel, message) => {
      try {
        const data = JSON.parse(message);
        if (channel === "vehicle:updates") {
          // Avoid double-emit when publisher already emitted locally.
          // Only fan-out if this process did not originate (multi-instance).
          // For single-instance we still emit via publishVehicleUpdate locally.
          // Use a flag: if REDIS_FANOUT_ONLY=true, only emit from subscriber.
          if (process.env.REDIS_FANOUT_ONLY === "true") {
            realtime.emitVehicleUpdate(data);
          }
        } else if (channel === "alerts") {
          if (process.env.REDIS_FANOUT_ONLY === "true") {
            realtime.emitAlert(data);
          }
        }
      } catch (err) {
        console.error("Error processing Redis message:", err.message);
      }
    });
  } catch (err) {
    console.error("Failed to setup Redis listener:", err.message);
  }
};

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  socket.on("disconnect", () => console.log("Client disconnected:", socket.id));
});

const startServer = async () => {
  setTimeout(() => {
    if (redisConfig.isRedisConnected()) {
      setupRedisListener();
    } else {
      console.log("⚠️ Redis disabled — realtime uses direct Socket.io emit");
    }
  }, 500);

  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`🚀 FleetDash server running on port ${PORT}`);
  });

  setTimeout(async () => {
    try {
      await bootstrapDemoData();
      console.log("✅ Demo users/data ready");
    } catch (err) {
      console.error("Bootstrap error:", err.message);
    }
    startLiveSimulator();
  }, 1500);
};

startServer();

module.exports = { app, server, io };
