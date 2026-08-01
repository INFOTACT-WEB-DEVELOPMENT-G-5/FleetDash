const mongoose = require('mongoose');

const geofenceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['circle', 'polygon'],
    default: 'circle'
  },
  center: {
    lat: Number,
    lng: Number
  },
  radius: {
    type: Number,
    default: 1000
  },
  points: [{
    lat: Number,
    lng: Number
  }],
  vehicleIds: [{
    type: String
  }],
  alertOnExit: {
    type: Boolean,
    default: true
  },
  alertOnEntry: {
    type: Boolean,
    default: false
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Geofence', geofenceSchema);