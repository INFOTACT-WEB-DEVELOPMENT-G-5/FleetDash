const mongoose = require("mongoose");

const geofenceZoneSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ["Safe", "Restricted", "Warehouse", "Customer"], required: true },
  center: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  radius: { type: Number, default: 500 },
  color: { type: String, default: "#10b981" },
  active: { type: Boolean, default: true },
  companyId: { type: String, default: "default" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("GeofenceZone", geofenceZoneSchema);