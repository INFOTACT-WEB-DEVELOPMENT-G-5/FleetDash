const express = require("express");
const router = express.Router();
const { authenticateToken, requireRole } = require("../middleware/authMiddleware");

let maintenance = [
  { _id: "m1", vehicleId: "FD-001", component: "Brake System", probability: 78, severity: "High", predictedDays: 44, estimatedCost: 8500, status: "Pending" },
  { _id: "m2", vehicleId: "FD-002", component: "Engine Oil", probability: 92, severity: "Critical", predictedDays: 10, estimatedCost: 3500, status: "Pending" },
  { _id: "m3", vehicleId: "FD-003", component: "Tire Wear", probability: 65, severity: "Medium", predictedDays: 70, estimatedCost: 12000, status: "Scheduled" },
  { _id: "m4", vehicleId: "FD-004", component: "Battery Health", probability: 45, severity: "Low", predictedDays: 110, estimatedCost: 5000, status: "Pending" },
  { _id: "m5", vehicleId: "FD-005", component: "Transmission", probability: 88, severity: "High", predictedDays: 24, estimatedCost: 25000, status: "Pending" },
  { _id: "m6", vehicleId: "FD-001", component: "Oil Filter", probability: 55, severity: "Medium", predictedDays: 90, estimatedCost: 1200, status: "Scheduled" },
  { _id: "m7", vehicleId: "FD-007", component: "Coolant", probability: 72, severity: "High", predictedDays: 56, estimatedCost: 8000, status: "Pending" }
];

router.get("/maintenance", authenticateToken, (req, res) => {
  let result = [...maintenance];
  if (req.query.vehicleId) {
    result = result.filter(m => m.vehicleId === req.query.vehicleId);
  }
  res.json(result);
});

router.get("/health", authenticateToken, (req, res) => {
  const vehicles = [
    { _id: "v1", vehicleId: "FD-001", overallScore: 85, status: "Good", lastService: new Date(Date.now() - 2592000000).toISOString(), nextService: new Date(Date.now() + 604800000).toISOString() },
    { _id: "v2", vehicleId: "FD-002", overallScore: 62, status: "Needs Service", lastService: new Date(Date.now() - 5184000000).toISOString(), nextService: new Date(Date.now() - 86400000).toISOString() },
    { _id: "v3", vehicleId: "FD-003", overallScore: 91, status: "Good", lastService: new Date(Date.now() - 1296000000).toISOString(), nextService: new Date(Date.now() + 1209600000).toISOString() },
    { _id: "v4", vehicleId: "FD-004", overallScore: 78, status: "Fair", lastService: new Date(Date.now() - 3456000000).toISOString(), nextService: new Date(Date.now() + 432000000).toISOString() },
    { _id: "v5", vehicleId: "FD-005", overallScore: 55, status: "Critical", lastService: new Date(Date.now() - 7776000000).toISOString(), nextService: new Date(Date.now() - 604800000).toISOString() },
    { _id: "v6", vehicleId: "FD-006", overallScore: 88, status: "Good", lastService: new Date(Date.now() - 1728000000).toISOString(), nextService: new Date(Date.now() + 2592000000).toISOString() },
    { _id: "v7", vehicleId: "FD-007", overallScore: 73, status: "Fair", lastService: new Date(Date.now() - 4320000000).toISOString(), nextService: new Date(Date.now() + 518400000).toISOString() }
  ];
  res.json(vehicles);
});

router.get("/drivers", authenticateToken, (req, res) => {
  const drivers = [
    { _id: "drv1", name: "Arun Kumar", safetyScore: 92, totalTrips: 245, rating: 4.8 },
    { _id: "drv2", name: "Rahul Sharma", safetyScore: 88, totalTrips: 189, rating: 4.6 },
    { _id: "drv3", name: "Priya Singh", safetyScore: 95, totalTrips: 412, rating: 4.9 },
    { _id: "drv4", name: "Sunil Verma", safetyScore: 78, totalTrips: 67, rating: 4.2 },
    { _id: "drv5", name: "Anita Patel", safetyScore: 85, totalTrips: 198, rating: 4.7 },
    { _id: "drv6", name: "Vikram Joshi", safetyScore: 90, totalTrips: 523, rating: 4.8 },
    { _id: "drv7", name: "Kavya Reddy", safetyScore: 82, totalTrips: 112, rating: 4.5 }
  ];
  res.json(drivers);
});

router.get("/drivers/leaderboard", authenticateToken, (req, res) => {
  const leaderboard = [
    { _id: "drv3", name: "Priya Singh", score: 95, rank: 1 },
    { _id: "drv1", name: "Arun Kumar", score: 92, rank: 2 },
    { _id: "drv6", name: "Vikram Joshi", score: 90, rank: 3 },
    { _id: "drv5", name: "Anita Patel", score: 85, rank: 4 },
    { _id: "drv2", name: "Rahul Sharma", score: 88, rank: 5 },
    { _id: "drv7", name: "Kavya Reddy", score: 82, rank: 6 },
    { _id: "drv4", name: "Sunil Verma", score: 78, rank: 7 }
  ].sort((a, b) => a.rank - b.rank);
  res.json(leaderboard);
});

router.get("/fuel", authenticateToken, (req, res) => {
  let result = [
    { _id: "f1", vehicleId: "FD-001", litres: 45, cost: 4500, date: new Date(Date.now() - 86400000).toISOString(), efficiency: 12.5 },
    { _id: "f2", vehicleId: "FD-002", litres: 38, cost: 3800, date: new Date(Date.now() - 172800000).toISOString(), efficiency: 11.8 },
    { _id: "f3", vehicleId: "FD-003", litres: 52, cost: 5200, date: new Date(Date.now() - 259200000).toISOString(), efficiency: 13.2 },
    { _id: "f4", vehicleId: "FD-004", litres: 30, cost: 3000, date: new Date(Date.now() - 345600000).toISOString(), efficiency: 10.5 },
    { _id: "f5", vehicleId: "FD-005", litres: 48, cost: 4800, date: new Date(Date.now() - 432000000).toISOString(), efficiency: 12.0 },
    { _id: "f6", vehicleId: "FD-006", litres: 42, cost: 4200, date: new Date(Date.now() - 518400000).toISOString(), efficiency: 12.8 },
    { _id: "f7", vehicleId: "FD-007", litres: 35, cost: 3500, date: new Date(Date.now() - 604800000).toISOString(), efficiency: 11.2 }
  ];
  if (req.query.vehicleId) {
    result = result.filter(f => f.vehicleId === req.query.vehicleId);
  }
  res.json(result);
});

router.get("/report", authenticateToken, (req, res) => {
  res.json({
    narrative: "Today's fleet operations show strong performance with 85% of vehicles active. Fuel efficiency improved by 3.2% compared to last week. 3 maintenance items require attention this month. Driver safety scores remain above average at 87/100.",
    summary: { totalVehicles: 7, activeVehicles: 5, totalDistance: 4545, avgSpeed: 62, avgFuel: 68 },
    fleetHealth: { overallScore: 82, vehiclesNeedingService: 2, criticalMaintenance: 1, highMaintenance: 2 },
    drivers: { total: 7, excellentDrivers: 3, riskyDrivers: 1 },
    fuelAnalysis: { avgFuelLevel: 65, fuelEfficiencyChange: 3.2, totalEstimatedFuelCost: 24000 },
    predictions: { nextMonthFuelCost: 72000, nextMonthMaintenanceCost: 50000, fleetEfficiency: 82, projectedCostPerKm: 15, quarterlyFuelCost: 210000, quarterlyMaintenanceCost: 150000 }
  });
});

router.get("/analytics", authenticateToken, (req, res) => {
  res.json({
    predictions: { nextMonthFuelCost: 72000, nextMonthMaintenanceCost: 50000, fleetEfficiency: 82, projectedCostPerKm: 15, quarterlyFuelCost: 210000, quarterlyMaintenanceCost: 150000 },
    trends: { fuelTrend: "decreasing", maintenanceTrend: "stable" }
  });
});

router.get("/audit", authenticateToken, (req, res) => {
  const logs = [
    { _id: "log1", action: "Vehicle Created", user: "manager@fleetdash.com", timestamp: new Date(Date.now() - 3600000).toISOString(), details: "Created FD-008" },
    { _id: "log2", action: "Driver Updated", user: "manager@fleetdash.com", timestamp: new Date(Date.now() - 7200000).toISOString(), details: "Updated Arun Kumar" },
    { _id: "log3", action: "Alert Resolved", user: "admin@fleetdash.com", timestamp: new Date(Date.now() - 10800000).toISOString(), details: "Resolved FD-003" }
  ];
  res.json(logs);
});

router.post("/maintenance/analyze", authenticateToken, (req, res) => {
  res.json({ message: "Analysis started", status: "processing" });
});

module.exports = router;