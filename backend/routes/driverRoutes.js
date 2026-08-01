const express = require("express");
const router = express.Router();
const { authenticateToken, requireRole } = require("../middleware/authMiddleware");

// In-memory storage for demo (replace with MongoDB models in production)
let drivers = [
  { _id: "d1", name: "Arun Kumar", email: "arun@fleetdash.com", phone: "+91-9876543210", licenseNumber: "DL-2024-001", experience: 8, currentStatus: "Available", safetyScore: 92, assignedVehicle: "FD-001", totalTrips: 245 },
  { _id: "d2", name: "Rahul Sharma", email: "rahul@fleetdash.com", phone: "+91-9876543211", licenseNumber: "DL-2024-002", experience: 5, currentStatus: "On Trip", safetyScore: 88, assignedVehicle: "FD-002", totalTrips: 189 },
  { _id: "d3", name: "Priya Singh", email: "priya@fleetdash.com", phone: "+91-9876543212", licenseNumber: "DL-2024-003", experience: 12, currentStatus: "Available", safetyScore: 95, assignedVehicle: "FD-003", totalTrips: 412 },
  { _id: "d4", name: "Sunil Verma", email: "sunil@fleetdash.com", phone: "+91-9876543213", licenseNumber: "DL-2024-004", experience: 3, currentStatus: "Off Duty", safetyScore: 78, assignedVehicle: "FD-004", totalTrips: 67 },
  { _id: "d5", name: "Anita Patel", email: "anita@fleetdash.com", phone: "+91-9876543214", licenseNumber: "DL-2024-005", experience: 7, currentStatus: "On Trip", safetyScore: 85, assignedVehicle: "FD-005", totalTrips: 198 },
  { _id: "d6", name: "Vikram Joshi", email: "vikram@fleetdash.com", phone: "+91-9876543215", licenseNumber: "DL-2024-006", experience: 15, currentStatus: "Available", safetyScore: 90, assignedVehicle: "FD-006", totalTrips: 523 },
  { _id: "d7", name: "Kavya Reddy", email: "kavya@fleetdash.com", phone: "+91-9876543216", licenseNumber: "DL-2024-007", experience: 4, currentStatus: "On Leave", safetyScore: 82, assignedVehicle: "FD-007", totalTrips: 112 }
];

router.get("/", authenticateToken, (req, res) => {
  let result = [...drivers];
  
  if (req.query.search) {
    const search = req.query.search.toLowerCase();
    result = result.filter(d => d.name.toLowerCase().includes(search));
  }
  if (req.query.status && req.query.status !== "All") {
    result = result.filter(d => d.currentStatus === req.query.status);
  }
  
  res.json({ drivers: result });
});

router.get("/:id", authenticateToken, (req, res) => {
  const driver = drivers.find(d => d._id === req.params.id);
  if (!driver) return res.status(404).json({ message: "Driver not found" });
  res.json(driver);
});

router.post("/", authenticateToken, requireRole(['Manager', 'Admin']), (req, res) => {
  const newDriver = { _id: "d" + Date.now(), ...req.body, safetyScore: req.body.safetyScore || Math.floor(Math.random() * 30) + 70 };
  drivers.push(newDriver);
  res.status(201).json(newDriver);
});

router.put("/:id", authenticateToken, requireRole(['Manager', 'Admin']), (req, res) => {
  const index = drivers.findIndex(d => d._id === req.params.id);
  if (index === -1) return res.status(404).json({ message: "Driver not found" });
  drivers[index] = { ...drivers[index], ...req.body };
  res.json(drivers[index]);
});

router.delete("/:id", authenticateToken, requireRole(['Manager', 'Admin']), (req, res) => {
  const index = drivers.findIndex(d => d._id === req.params.id);
  if (index === -1) return res.status(404).json({ message: "Driver not found" });
  drivers.splice(index, 1);
  res.json({ message: "Driver removed" });
});

module.exports = router;