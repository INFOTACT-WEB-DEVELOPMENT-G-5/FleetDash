const mongoose = require('mongoose');

const fuelSchema = new mongoose.Schema({
  vehicleId: {
    type: String,
    required: true
  },
  litres: {
    type: Number,
    required: true
  },
  cost: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  efficiency: {
    type: Number,
    default: 0
  },
  mileage: {
    type: Number,
    default: 0
  },
  station: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Fuel', fuelSchema);