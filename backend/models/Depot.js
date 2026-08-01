const mongoose = require('mongoose');

const depotSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  address: {
    type: String
  },
  location: {
    lat: Number,
    lng: Number
  },
  vehicleCount: {
    type: Number,
    default: 0
  },
  availableVehicles: {
    type: Number,
    default: 0
  },
  maintenanceVehicles: {
    type: Number,
    default: 0
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Depot', depotSchema);