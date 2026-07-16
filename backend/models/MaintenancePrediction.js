const mongoose = require("mongoose");

const maintenancePredictionSchema = new mongoose.Schema({
  vehicleId: { type: String, required: true },
  vehicleRef: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle" },
  component: { type: String, required: true },
  probability: { type: Number, default: 0 },
  predictedDays: { type: Number, default: 0 },
  healthScore: { type: Number, default: 100 },
  recommendedServiceDate: { type: Date },
  estimatedCost: { type: Number, default: 0 },
  severity: { type: String, enum: ["Low", "Medium", "High", "Critical"], default: "Low" },
  status: { type: String, enum: ["Pending", "Scheduled", "Completed"], default: "Pending" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("MaintenancePrediction", maintenancePredictionSchema);