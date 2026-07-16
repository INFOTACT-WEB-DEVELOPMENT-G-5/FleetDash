const mongoose = require("mongoose");

const driverScoreSchema = new mongoose.Schema({
  vehicleId: { type: String, required: true },
  driver: { type: String, required: true },
  safetyScore: { type: Number, default: 100 },
  rating: { type: String, enum: ["Excellent", "Good", "Risky"], default: "Good" },
  speedViolations: { type: Number, default: 0 },
  hardBraking: { type: Number, default: 0 },
  rapidAcceleration: { type: Number, default: 0 },
  routeDeviations: { type: Number, default: 0 },
  tripsCompleted: { type: Number, default: 0 },
  totalTrips: { type: Number, default: 0 },
  lastTripDate: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("DriverScore", driverScoreSchema);