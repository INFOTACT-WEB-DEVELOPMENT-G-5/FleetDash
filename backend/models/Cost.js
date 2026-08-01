const mongoose = require('mongoose');

const costSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    enum: ['Fuel', 'Maintenance', 'Insurance', 'Toll', 'Repair', 'Other']
  },
  amount: {
    type: Number,
    required: true
  },
  vehicleId: {
    type: String
  },
  description: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Cost', costSchema);