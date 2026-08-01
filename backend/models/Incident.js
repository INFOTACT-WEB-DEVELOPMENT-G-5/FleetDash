const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
  incidentId: {
    type: String,
    unique: true
  },
  type: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  severity: {
    type: String,
    enum: ['Critical', 'High', 'Medium', 'Low'],
    default: 'Medium'
  },
  vehicleId: {
    type: String
  },
  driverId: {
    type: String
  },
  driver: {
    type: String
  },
  status: {
    type: String,
    enum: ['Open', 'Investigating', 'Resolved', 'Closed'],
    default: 'Open'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Incident', incidentSchema);