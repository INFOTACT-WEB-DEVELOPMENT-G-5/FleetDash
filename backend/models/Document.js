const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Insurance', 'Registration', 'Pollution', 'License', 'Compliance', 'Maintenance', 'Other']
  },
  vehicleId: {
    type: String
  },
  driverId: {
    type: String
  },
  expiryDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['Active', 'Expired', 'Pending', 'Renewed'],
    default: 'Active'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Document', documentSchema);