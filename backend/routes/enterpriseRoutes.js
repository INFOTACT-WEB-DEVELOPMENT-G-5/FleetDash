const express = require("express");
const router = express.Router();
const { authenticateToken, requireRole } = require("../middleware/authMiddleware");
const Incident = require("../models/Incident");
const WorkOrder = require("../models/WorkOrder");
const Document = require("../models/Document");
const Depot = require("../models/Depot");
const Cost = require("../models/Cost");

router.use(authenticateToken);
router.use(requireRole(['Manager', 'Admin']));

router.get("/incidents", async (req, res) => {
  const incidents = await Incident.find().sort({ createdAt: -1 });
  res.json({ incidents });
});

router.get("/incidents/stats", async (req, res) => {
  const total = await Incident.countDocuments();
  const open = await Incident.countDocuments({ status: "Open" });
  const critical = await Incident.countDocuments({ severity: "Critical" });
  res.json({ total, open, critical });
});

router.post("/incidents", async (req, res) => {
  const incident = await Incident.create(req.body);
  res.status(201).json(incident);
});

router.put("/incidents/:id", async (req, res) => {
  const incident = await Incident.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!incident) return res.status(404).json({ message: "Not found" });
  res.json(incident);
});

router.delete("/incidents/:id", async (req, res) => {
  const incident = await Incident.findByIdAndDelete(req.params.id);
  if (!incident) return res.status(404).json({ message: "Not found" });
  res.json({ message: "Deleted" });
});

router.get("/work-orders", async (req, res) => {
  const workOrders = await WorkOrder.find().sort({ createdAt: -1 });
  res.json({ workOrders });
});

router.post("/work-orders", async (req, res) => {
  const workOrder = await WorkOrder.create(req.body);
  res.status(201).json(workOrder);
});

router.put("/work-orders/:id", async (req, res) => {
  const workOrder = await WorkOrder.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!workOrder) return res.status(404).json({ message: "Not found" });
  res.json(workOrder);
});

router.get("/documents", async (req, res) => {
  const documents = await Document.find().sort({ createdAt: -1 });
  res.json({ documents });
});

router.get("/documents/expiring", async (req, res) => {
  const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const expiring = await Document.find({ expiryDate: { $lt: thirtyDaysFromNow }, status: 'Active' });
  res.json({ documents: expiring });
});

router.post("/documents", async (req, res) => {
  const document = await Document.create(req.body);
  res.status(201).json(document);
});

router.put("/documents/:id", async (req, res) => {
  const document = await Document.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!document) return res.status(404).json({ message: "Not found" });
  res.json(document);
});

router.delete("/documents/:id", async (req, res) => {
  const document = await Document.findByIdAndDelete(req.params.id);
  if (!document) return res.status(404).json({ message: "Not found" });
  res.json({ message: "Deleted" });
});

router.get("/trips", (req, res) => {
  res.json({ trips: [] });
});

router.post("/trips", (req, res) => {
  res.status(201).json({ _id: "t" + Date.now(), ...req.body });
});

router.put("/trips/:id", (req, res) => {
  res.json({ _id: req.params.id, ...req.body });
});

router.get("/trips/:id/playback", (req, res) => {
  res.json({ message: "Playback", tripId: req.params.id });
});

router.get("/depots", async (req, res) => {
  const depots = await Depot.find().sort({ createdAt: -1 });
  res.json(depots);
});

router.post("/depots", async (req, res) => {
  const depot = await Depot.create(req.body);
  res.status(201).json(depot);
});

router.put("/depots/:id", async (req, res) => {
  const depot = await Depot.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!depot) return res.status(404).json({ message: "Not found" });
  res.json(depot);
});

router.delete("/depots/:id", async (req, res) => {
  const depot = await Depot.findByIdAndDelete(req.params.id);
  if (!depot) return res.status(404).json({ message: "Not found" });
  res.json({ message: "Deleted" });
});

router.get("/costs", async (req, res) => {
  const costs = await Cost.find().sort({ createdAt: -1 });
  res.json({ costs });
});

router.post("/costs", async (req, res) => {
  const cost = await Cost.create(req.body);
  res.status(201).json(cost);
});

router.get("/costs/analytics", async (req, res) => {
  const costs = await Cost.find();
  const totalFuel = costs.filter(c => c.category === "Fuel").reduce((a, c) => a + c.amount, 0);
  const totalMaintenance = costs.filter(c => c.category === "Maintenance").reduce((a, c) => a + c.amount, 0);
  const total = totalFuel + totalMaintenance;
  res.json({ totalFuel, totalMaintenance, total });
});

router.get("/utilization", (req, res) => {
  res.json({ utilization: 78 });
});

router.get("/activity-feed", (req, res) => {
  res.json({ activities: [] });
});

router.get("/export/:resource", (req, res) => {
  res.json({ message: "Export", resource: req.params.resource });
});

router.get("/search", (req, res) => {
  res.json({ results: [] });
});

module.exports = router;