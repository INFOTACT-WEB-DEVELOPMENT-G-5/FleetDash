const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  vehicleId: {
    type: String,
    required: true
  },
  driver: {
    type: String,
    required: true
  },
  origin: {
    type: String,
    required: true
  },
  destination: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Active', 'Completed', 'Scheduled'],
    default: 'Active'
  },
  distance: {
    type: Number,
    default: 0
  },
  duration: {
    type: String,
    default: '0h 0m'
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Trip', tripSchema);