const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Insurance', 'Registration', 'Fitness Certificate', 'Pollution Certificate', 'Driving License', 'Medical Certificate', 'Training Certificate', 'Pollution', 'License', 'Compliance', 'Maintenance', 'Other']
  },
  vehicleId: {
    type: String
  },
  driverId: {
    type: String
  },
  documentNumber: {
    type: String
  },
  issueDate: {
    type: Date
  },
  expiryDate: {
    type: Date
  },
  notes: {
    type: String
  },
  status: {
    type: String,
    enum: ['Active', 'Valid', 'Expired', 'Pending', 'Renewed', 'Expiring Soon'],
    default: 'Active'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Document', documentSchema);