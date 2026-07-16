const AuditLog = require("../models/AuditLog");

async function logAction(user, action, resource, resourceId, details, ip) {
  try {
    await AuditLog.create({
      user,
      action,
      resource,
      resourceId,
      details,
      ip: ip || req?.ip || "0.0.0.0",
      companyId: "default"
    });
  } catch (error) {
    console.error("Audit Log Error:", error.message);
  }
}

async function getAuditLogs(query = {}) {
  try {
    const filter = {};
    if (query.user) filter.user = { $regex: query.user, $options: "i" };
    if (query.action) filter.action = { $regex: query.action, $options: "i" };
    if (query.resource) filter.resource = query.resource;
    
    const logs = await AuditLog.find(filter)
      .sort({ timestamp: -1 })
      .limit(parseInt(query.limit) || 100);
    return logs;
  } catch (error) {
    console.error("Get Audit Logs Error:", error.message);
    return [];
  }
}

module.exports = { logAction, getAuditLogs };