const express = require("express");
const router = express.Router();
const { authenticateToken, requireRole } = require("../middleware/authMiddleware");

let trips = [
  { _id: "t1", vehicleId: "FD-001", driver: "Arun Kumar", origin: "Mumbai", destination: "Delhi", status: "Active", distance: 1420, startTime: new Date(Date.now() - 3600000 * 5).toISOString() },
  { _id: "t2", vehicleId: "FD-002", driver: "Rahul Sharma", origin: "Bangalore", destination: "Chennai", status: "Active", distance: 350, startTime: new Date(Date.now() - 3600000 * 2).toISOString() },
  { _id: "t3", vehicleId: "FD-005", driver: "Anita Patel", origin: "Pune", destination: "Nagpur", status: "Completed", distance: 720, startTime: new Date(Date.now() - 86400000).toISOString() },
  { _id: "t4", vehicleId: "FD-006", driver: "Vikram Joshi", origin: "Ahmedabad", destination: "Jaipur", status: "Scheduled", distance: 650, startTime: new Date(Date.now() + 3600000 * 6).toISOString() },
  { _id: "t5", vehicleId: "FD-003", driver: "Priya Singh", origin: "Hyderabad", destination: "Kolkata", status: "Active", distance: 1520, startTime: new Date(Date.now() - 3600000 * 8).toISOString() },
  { _id: "t6", vehicleId: "FD-004", driver: "Sunil Verma", origin: "Lucknow", destination: "Kanpur", status: "Completed", distance: 85, startTime: new Date(Date.now() - 172800000).toISOString() },
  { _id: "t7", vehicleId: "FD-007", driver: "Kavya Reddy", origin: "Coimbatore", destination: "Madurai", status: "Active", distance: 250, startTime: new Date(Date.now() - 3600000).toISOString() }
];

router.get("/", authenticateToken, (req, res) => {
  let result = [...trips];
  if (req.query.vehicleId) {
    result = result.filter(t => t.vehicleId === req.query.vehicleId);
  }
  if (req.query.driver) {
    result = result.filter(t => t.driver.toLowerCase().includes(req.query.driver.toLowerCase()));
  }
  if (req.query.status && req.query.status !== "All") {
    result = result.filter(t => t.status === req.query.status);
  }
  res.json(trips);
});

router.get("/playback/:id", authenticateToken, (req, res) => {
  res.json({ message: "Playback feature", tripId: req.params.id });
});

router.post("/", authenticateToken, requireRole(['Manager', 'Admin']), (req, res) => {
  const newTrip = { _id: "t" + Date.now(), ...req.body, startTime: new Date().toISOString() };
  trips.push(newTrip);
  res.status(201).json(newTrip);
});

router.put("/:id", authenticateToken, requireRole(['Manager', 'Admin']), (req, res) => {
  const index = trips.findIndex(t => t._id === req.params.id);
  if (index === -1) return res.status(404).json({ message: "Trip not found" });
  trips[index] = { ...trips[index], ...req.body };
  res.json(trips[index]);
});

module.exports = router;