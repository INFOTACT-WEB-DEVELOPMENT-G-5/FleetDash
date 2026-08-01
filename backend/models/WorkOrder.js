const mongoose = require('mongoose');

const workOrderSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  vehicleId: {
    type: String
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('WorkOrder', workOrderSchema);