const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true
  },
  userId: {
    type: String
  },
  action: {
    type: String,
    required: true
  },
  module: {
    type: String,
    required: true
  },
  resourceId: {
    type: String
  },
  details: {
    type: String
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AuditLog', auditLogSchema);