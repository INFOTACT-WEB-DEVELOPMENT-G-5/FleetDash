const express = require("express");
const router = express.Router();
const { authenticateToken, requireRole } = require("../middleware/authMiddleware");

let alerts = [
  { _id: "a1", type: "Overspeed", message: "Vehicle FD-001 exceeded 90 km/h", severity: "High", vehicleId: "FD-001", createdAt: new Date(Date.now() - 3600000).toISOString(), acknowledged: false },
  { _id: "a2", type: "Low Fuel", message: "FD-002 fuel level below 20%", severity: "Medium", vehicleId: "FD-002", createdAt: new Date(Date.now() - 7200000).toISOString(), acknowledged: false },
  { _id: "a3", type: "Maintenance Due", message: "FD-003 service overdue", severity: "Critical", vehicleId: "FD-003", createdAt: new Date(Date.now() - 1800000).toISOString(), acknowledged: true },
  { _id: "a4", type: "Geofence", message: "FD-001 exited designated zone", severity: "Medium", vehicleId: "FD-001", createdAt: new Date(Date.now() - 5400000).toISOString(), acknowledged: false },
  { _id: "a5", type: "Engine Warning", message: "FD-004 check engine light", severity: "High", vehicleId: "FD-004", createdAt: new Date(Date.now() - 9000000).toISOString(), acknowledged: false },
  { _id: "a6", type: "Battery Low", message: "FD-005 battery voltage low", severity: "Medium", vehicleId: "FD-005", createdAt: new Date(Date.now() - 10800000).toISOString(), acknowledged: true },
  { _id: "a7", type: "Overspeed", message: "FD-007 exceeded 95 km/h", severity: "High", vehicleId: "FD-007", createdAt: new Date(Date.now() - 4500000).toISOString(), acknowledged: false }
];

router.get("/", authenticateToken, (req, res) => {
  let result = [...alerts];
  if (req.query.vehicleId) {
    result = result.filter(a => a.vehicleId === req.query.vehicleId);
  }
  if (req.query.type && req.query.type !== "All") {
    result = result.filter(a => a.type === req.query.type);
  }
  if (req.query.severity && req.query.severity !== "All") {
    result = result.filter(a => a.severity === req.query.severity);
  }
  
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const start = (page - 1) * limit;
  const paginated = result.slice(start, start + limit);
  
  res.json({ alerts: paginated, pages: Math.ceil(result.length / limit), total: result.length });
});

router.get("/stats/summary", authenticateToken, (req, res) => {
  const total = alerts.length;
  const unacknowledged = alerts.filter(a => !a.acknowledged).length;
  const bySeverity = [
    { _id: "Critical", count: alerts.filter(a => a.severity === "Critical").length },
    { _id: "High", count: alerts.filter(a => a.severity === "High").length },
    { _id: "Medium", count: alerts.filter(a => a.severity === "Medium").length },
    { _id: "Low", count: alerts.filter(a => a.severity === "Low").length }
  ];
  const byType = [];
  const types = {};
  alerts.forEach(a => { types[a.type] = (types[a.type] || 0) + 1; });
  Object.entries(types).forEach(([type, count]) => byType.push({ _id: type, count }));
  
  res.json({ total, unacknowledged, bySeverity, byType });
});

router.get("/:id", authenticateToken, (req, res) => {
  const alert = alerts.find(a => a._id === req.params.id);
  if (!alert) return res.status(404).json({ message: "Alert not found" });
  res.json(alert);
});

router.put("/:id/acknowledge", authenticateToken, (req, res) => {
  const alert = alerts.find(a => a._id === req.params.id);
  if (!alert) return res.status(404).json({ message: "Alert not found" });
  alert.acknowledged = true;
  res.json(alert);
});

router.put("/acknowledge-all", authenticateToken, (req, res) => {
  alerts.forEach(a => a.acknowledged = true);
  res.json({ message: "All alerts acknowledged" });
});

router.put("/:id/resolve", authenticateToken, (req, res) => {
  const index = alerts.findIndex(a => a._id === req.params.id);
  if (index === -1) return res.status(404).json({ message: "Alert not found" });
  alerts.splice(index, 1);
  res.json({ message: "Alert resolved" });
});

router.delete("/:id", authenticateToken, requireRole(['Manager', 'Admin']), (req, res) => {
  const index = alerts.findIndex(a => a._id === req.params.id);
  if (index === -1) return res.status(404).json({ message: "Alert not found" });
  alerts.splice(index, 1);
  res.json({ message: "Alert deleted" });
});

module.exports = router;