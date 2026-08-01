const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['Overspeed', 'Vehicle Offline', 'Low Fuel', 'Geofence', 'Engine Warning', 'Fuel Theft', 'Maintenance Due', 'Battery Low', 'Critical Temperature', 'Tire Pressure', 'Accident']
  },
  message: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    enum: ['Critical', 'High', 'Medium', 'Low'],
    default: 'Medium'
  },
  vehicleId: {
    type: String
  },
  acknowledged: {
    type: Boolean,
    default: false
  },
  acknowledgedBy: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Alert', alertSchema);