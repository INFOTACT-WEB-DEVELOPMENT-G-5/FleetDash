const mongoose = require("mongoose");

const fuelRecordSchema = new mongoose.Schema({
  vehicleId: { type: String, required: true },
  vehicleRef: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle" },
  fuelLevel: { type: Number, default: 100 },
  fuelConsumed: { type: Number, default: 0 },
  expectedConsumption: { type: Number, default: 0 },
  anomalyScore: { type: Number, default: 0 },
  isFraud: { type: Boolean, default: false },
  alertMessage: { type: String },
  location: {
    lat: { type: Number },
    lng: { type: Number }
  },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("FuelRecord", fuelRecordSchema);