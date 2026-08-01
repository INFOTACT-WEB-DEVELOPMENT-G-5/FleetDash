const express = require("express");
const router = express.Router();
const { authenticateToken, requireRole } = require("../middleware/authMiddleware");
const Incident = require("../models/Incident");
const WorkOrder = require("../models/WorkOrder");
const Document = require("../models/Document");
const Depot = require("../models/Depot");
const Cost = require("../models/Cost");
const Trip = require("../models/Trip");
const Vehicle = require("../models/Vehicle");
const Driver = require("../models/Driver");
const Notification = require("../models/Notification");

router.use(authenticateToken);
router.use(requireRole(['Manager', 'Admin']));

router.get("/incidents", async (req, res) => {
  try {
    let query = {};
    if (req.query.type) query.type = req.query.type;
    if (req.query.severity) query.severity = req.query.severity;
    if (req.query.status) query.status = req.query.status;
    const incidents = await Incident.find(query).sort({ createdAt: -1 });
    res.json({ incidents });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/incidents/stats", async (req, res) => {
  try {
    const total = await Incident.countDocuments();
    const open = await Incident.countDocuments({ status: "Open" });
    const critical = await Incident.countDocuments({ severity: "Critical" });
    const resolved = await Incident.countDocuments({ status: "Resolved" });
    res.json({ total, open, critical, resolved });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/incidents", async (req, res) => {
  try {
    const incident = await Incident.create(req.body);
    res.status(201).json(incident);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put("/incidents/:id", async (req, res) => {
  try {
    const incident = await Incident.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!incident) return res.status(404).json({ message: "Not found" });
    res.json(incident);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete("/incidents/:id", async (req, res) => {
  try {
    const incident = await Incident.findByIdAndDelete(req.params.id);
    if (!incident) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/work-orders", async (req, res) => {
  try {
    let query = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.priority) query.priority = req.query.priority;
    const workOrders = await WorkOrder.find(query).sort({ createdAt: -1 });
    res.json({ workOrders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/work-orders", async (req, res) => {
  try {
    const workOrder = await WorkOrder.create({
      ...req.body,
      title: req.body.title || req.body.issue || "Work Order",
      workOrderId: "WO-" + Date.now()
    });
    res.status(201).json(workOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put("/work-orders/:id", async (req, res) => {
  try {
    const workOrder = await WorkOrder.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!workOrder) return res.status(404).json({ message: "Not found" });
    res.json(workOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/documents", async (req, res) => {
  try {
    let query = {};
    if (req.query.type) query.type = req.query.type;
    if (req.query.status) query.status = req.query.status;
    const documents = await Document.find(query).sort({ createdAt: -1 });
    res.json({ documents });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/documents/expiring", async (req, res) => {
  try {
    const now = new Date();
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const expired = await Document.find({ expiryDate: { $lt: now }, status: { $in: ['Active', 'Valid'] } });
    const expiring = await Document.find({ expiryDate: { $gte: now, $lt: thirtyDaysFromNow }, status: { $in: ['Active', 'Valid'] } });
    res.json({ documents: expiring, expiredCount: expired.length, expiringCount: expiring.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/documents", async (req, res) => {
  try {
    const document = await Document.create({
      ...req.body,
      name: req.body.name || (req.body.type + " - " + (req.body.vehicleId || 'General'))
    });
    res.status(201).json(document);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put("/documents/:id", async (req, res) => {
  try {
    const document = await Document.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!document) return res.status(404).json({ message: "Not found" });
    res.json(document);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete("/documents/:id", async (req, res) => {
  try {
    const document = await Document.findByIdAndDelete(req.params.id);
    if (!document) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/trips", async (req, res) => {
  try {
    let query = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.vehicleId) query.vehicleId = req.query.vehicleId;
    const trips = await Trip.find(query).sort({ startTime: -1 });
    res.json({ trips });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/trips", async (req, res) => {
  try {
    const trip = await Trip.create({ ...req.body, startTime: req.body.startTime || new Date() });
    res.status(201).json(trip);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put("/trips/:id", async (req, res) => {
  try {
    const trip = await Trip.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!trip) return res.status(404).json({ message: "Not found" });
    res.json(trip);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/trips/:id/playback", async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: "Trip not found" });
    res.json({ message: "Playback", tripId: trip._id, vehicleId: trip.vehicleId, route: [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/depots", async (req, res) => {
  try {
    const depots = await Depot.find().sort({ createdAt: -1 });
    res.json(depots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/depots", async (req, res) => {
  try {
    const depot = await Depot.create(req.body);
    res.status(201).json(depot);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put("/depots/:id", async (req, res) => {
  try {
    const depot = await Depot.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!depot) return res.status(404).json({ message: "Not found" });
    res.json(depot);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete("/depots/:id", async (req, res) => {
  try {
    const depot = await Depot.findByIdAndDelete(req.params.id);
    if (!depot) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/costs", async (req, res) => {
  try {
    let query = {};
    if (req.query.category) query.category = req.query.category;
    if (req.query.vehicleId) query.vehicleId = req.query.vehicleId;
    const costs = await Cost.find(query).sort({ date: -1 });
    res.json({ costs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/costs", async (req, res) => {
  try {
    const cost = await Cost.create(req.body);
    res.status(201).json(cost);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/costs/analytics", async (req, res) => {
  try {
    const costs = await Cost.find();
    const vehicles = await Vehicle.find();
    const totalCost = costs.reduce((a, c) => a + c.amount, 0);
    const totalDistance = vehicles.reduce((a, v) => a + (v.distance || 0), 0);
    const costPerKm = totalDistance > 0 ? totalCost / totalDistance : 0;
    const byTypeAgg = await Cost.aggregate([{ $group: { _id: "$category", total: { $sum: "$amount" }, count: { $sum: 1 } } }]);
    const byType = byTypeAgg.map(a => ({ _id: a._id, total: a.total, count: a.count }));
    const byVehicleAgg = await Cost.aggregate([{ $match: { vehicleId: { $exists: true, $ne: null } } }, { $group: { _id: "$vehicleId", total: { $sum: "$amount" } } }, { $sort: { total: -1 } }, { $limit: 10 }]);
    const byVehicle = byVehicleAgg.map(a => ({ _id: a._id, total: a.total }));
    const monthlyAgg = await Cost.aggregate([{ $group: { _id: { $dateToString: { format: "%Y-%m", date: "$date" } }, total: { $sum: "$amount" } } }, { $sort: { _id: 1 } }, { $limit: 6 }]);
    const monthlyTrends = monthlyAgg.map(a => ({ _id: a._id, total: a.total }));
    res.json({ totalCost, costPerKm, totalDistance, byType, byVehicle, monthlyTrends });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/utilization", async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    const total = vehicles.length;
    const active = vehicles.filter(v => v.status === "Active").length;
    const utilization = total > 0 ? Math.round((active / total) * 100) : 0;
    res.json({ utilization });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/activity-feed", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const vehicles = await Vehicle.find().sort({ updatedAt: -1 }).limit(5);
    const trips = await Trip.find().sort({ updatedAt: -1 }).limit(5);
    const incidents = await Incident.find().sort({ createdAt: -1 }).limit(3);
    const activities = [];
    vehicles.forEach(v => activities.push({ _id: "act_v_" + v._id, type: "vehicle", message: "Vehicle " + v.vehicleId + " " + (v.status === "Active" ? "is active" : "went offline"), vehicleId: v.vehicleId, timestamp: v.updatedAt || v.createdAt }));
    trips.forEach(t => activities.push({ _id: "act_t_" + t._id, type: "trip", message: "Trip from " + t.origin + " to " + t.destination + " - " + t.status, vehicleId: t.vehicleId, timestamp: t.updatedAt || t.createdAt }));
    incidents.forEach(i => activities.push({ _id: "act_i_" + i._id, type: "incident", message: "Incident: " + i.type + " - " + i.severity, vehicleId: i.vehicleId, timestamp: i.createdAt }));
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    res.json({ activities: activities.slice(0, limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/export/:resource", async (req, res) => {
  try {
    const resource = req.params.resource;
    let data = [], headers = [];
    if (resource === "vehicles") { data = await Vehicle.find(); headers = ["vehicleId", "driver", "status", "speed", "fuel", "distance", "type"]; }
    else if (resource === "drivers") { data = await Driver.find(); headers = ["name", "email", "phone", "licenseNumber", "currentStatus", "safetyScore"]; }
    else if (resource === "trips") { data = await Trip.find(); headers = ["vehicleId", "driver", "origin", "destination", "status", "distance", "duration"]; }
    else if (resource === "incidents") { data = await Incident.find(); headers = ["incidentId", "type", "severity", "vehicleId", "status"]; }
    else if (resource === "costs") { data = await Cost.find(); headers = ["category", "amount", "vehicleId", "description", "date"]; }
    else if (resource === "work-orders") { data = await WorkOrder.find(); headers = ["title", "vehicleId", "priority", "status", "estimatedCost"]; }
    else if (resource === "documents") { data = await Document.find(); headers = ["name", "type", "vehicleId", "expiryDate", "status"]; }
    else return res.status(400).json({ message: "Unknown resource type" });
    const csvRows = [headers.join(",")];
    data.forEach(item => { const row = headers.map(h => { const val = item[h]; if (val instanceof Date) return val.toISOString(); return val !== undefined && val !== null ? '"' + String(val).replace(/"/g, '""') + '"' : ""; }); csvRows.push(row.join(",")); });
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=" + resource + "-export-" + Date.now() + ".csv");
    res.send(csvRows.join("\n"));
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.get("/search", async (req, res) => {
  try {
    const q = req.query.q || "";
    if (!q) return res.json({ results: [] });
    const results = [];
    const vehicles = await Vehicle.find({ $or: [{ vehicleId: { $regex: q, $options: "i" } }, { driver: { $regex: q, $options: "i" } }] }).limit(5);
    vehicles.forEach(v => results.push({ type: "vehicle", _id: v._id, label: v.vehicleId, description: "Driver: " + v.driver, link: "/vehicles" }));
    const drivers = await Driver.find({ name: { $regex: q, $options: "i" } }).limit(5);
    drivers.forEach(d => results.push({ type: "driver", _id: d._id, label: d.name, description: "Status: " + d.currentStatus, link: "/drivers" }));
    const trips = await Trip.find({ $or: [{ vehicleId: { $regex: q, $options: "i" } }, { driver: { $regex: q, $options: "i" } }, { origin: { $regex: q, $options: "i" } }, { destination: { $regex: q, $options: "i" } }] }).limit(5);
    trips.forEach(t => results.push({ type: "trip", _id: t._id, label: t.origin + " to " + t.destination, description: "Vehicle: " + t.vehicleId, link: "/trips" }));
    res.json({ results });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.get("/notifications", async (req, res) => {
  try {
    let query = {};
    if (req.query.unread === "true") query.read = false;
    const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(parseInt(req.query.limit) || 50);
    res.json({ notifications });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.get("/notifications/unread-count", async (req, res) => {
  try { const count = await Notification.countDocuments({ read: false }); res.json({ count }); } catch (error) { res.status(500).json({ message: error.message }); }
});

router.put("/notifications/:id/read", async (req, res) => {
  try { const notification = await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true }); if (!notification) return res.status(404).json({ message: "Notification not found" }); res.json(notification); } catch (error) { res.status(500).json({ message: error.message }); }
});

router.put("/notifications/read-all", async (req, res) => {
  try { await Notification.updateMany({ read: false }, { read: true }); res.json({ message: "All notifications marked as read" }); } catch (error) { res.status(500).json({ message: error.message }); }
});

router.delete("/notifications/:id", async (req, res) => {
  try { const notification = await Notification.findByIdAndDelete(req.params.id); if (!notification) return res.status(404).json({ message: "Notification not found" }); res.json({ message: "Notification deleted" }); } catch (error) { res.status(500).json({ message: error.message }); }
});

module.exports = router;
