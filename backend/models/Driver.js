const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String
  },
  licenseNumber: {
    type: String
  },
  experience: {
    type: Number,
    default: 0
  },
  currentStatus: {
    type: String,
    enum: ['Available', 'On Trip', 'Off Duty', 'On Leave'],
    default: 'Available'
  },
  safetyScore: {
    type: Number,
    default: 80
  },
  assignedVehicle: {
    type: String
  },
  totalTrips: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 4.5
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Driver', driverSchema);