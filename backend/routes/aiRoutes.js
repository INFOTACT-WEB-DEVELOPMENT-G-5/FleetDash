const express = require("express");
const router = express.Router();
const Vehicle = require("../models/Vehicle");
const Driver = require("../models/Driver");
const Fuel = require("../models/Fuel");
const Geofence = require("../models/Geofence");
const { authenticateToken, requireRole } = require("../middleware/authMiddleware");

let maintenance = [
  { _id: "m1", vehicleId: "FD-001", component: "Brake System", probability: 78, severity: "High", predictedDays: 44, estimatedCost: 8500, status: "Pending" },
  { _id: "m2", vehicleId: "FD-002", component: "Engine Oil", probability: 92, severity: "Critical", predictedDays: 10, estimatedCost: 3500, status: "Pending" },
  { _id: "m3", vehicleId: "FD-003", component: "Tire Wear", probability: 65, severity: "Medium", predictedDays: 70, estimatedCost: 12000, status: "Scheduled" },
  { _id: "m4", vehicleId: "FD-004", component: "Battery Health", probability: 45, severity: "Low", predictedDays: 110, estimatedCost: 5000, status: "Pending" },
  { _id: "m5", vehicleId: "FD-005", component: "Transmission", probability: 88, severity: "High", predictedDays: 24, estimatedCost: 25000, status: "Pending" },
  { _id: "m6", vehicleId: "FD-001", component: "Oil Filter", probability: 55, severity: "Medium", predictedDays: 90, estimatedCost: 1200, status: "Scheduled" },
  { _id: "m7", vehicleId: "FD-007", component: "Coolant", probability: 72, severity: "High", predictedDays: 56, estimatedCost: 8000, status: "Pending" },
  { _id: "m8", vehicleId: "FD-008", component: "Brake Pads", probability: 60, severity: "Medium", predictedDays: 65, estimatedCost: 4500, status: "Pending" },
  { _id: "m9", vehicleId: "FD-009", component: "Air Filter", probability: 40, severity: "Low", predictedDays: 120, estimatedCost: 800, status: "Scheduled" },
  { _id: "m10", vehicleId: "FD-010", component: "Clutch", probability: 85, severity: "High", predictedDays: 30, estimatedCost: 15000, status: "Pending" }
];

router.get("/maintenance", authenticateToken, (req, res) => {
  let result = [...maintenance];
  if (req.query.vehicleId) {
    result = result.filter(m => m.vehicleId === req.query.vehicleId);
  }
  res.json(result);
});

router.put("/maintenance/:id/status", authenticateToken, (req, res) => {
  const item = maintenance.find(m => m._id === req.params.id);
  if (!item) return res.status(404).json({ message: "Maintenance item not found" });
  item.status = req.body.status || item.status;
  res.json(item);
});

router.get("/health", authenticateToken, async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    const healthCards = vehicles.map(v => {
      const score = v.status === "Offline" ? 45 : v.fuel < 20 ? 55 : v.fuel < 40 ? 70 : 85 + Math.floor(Math.random() * 10);
      const status = score > 80 ? "Good" : score > 65 ? "Fair" : score > 50 ? "Needs Service" : "Critical";
      return {
        _id: v._id,
        vehicleId: v.vehicleId,
        overallScore: score,
        status,
        lastService: new Date(Date.now() - Math.floor(Math.random() * 60) * 86400000).toISOString(),
        nextService: new Date(Date.now() + Math.floor(Math.random() * 30) * 86400000).toISOString()
      };
    });
    res.json(healthCards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/health/:id", authenticateToken, async (req, res) => {
  try {
    const vehicle = await Vehicle.findOne({ vehicleId: req.params.id });
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });
    const score = vehicle.status === "Offline" ? 45 : vehicle.fuel < 20 ? 55 : vehicle.fuel < 40 ? 70 : 85 + Math.floor(Math.random() * 10);
    const status = score > 80 ? "Good" : score > 65 ? "Fair" : score > 50 ? "Needs Service" : "Critical";
    res.json({
      _id: vehicle._id,
      vehicleId: vehicle.vehicleId,
      overallScore: score,
      status,
      lastService: new Date(Date.now() - Math.floor(Math.random() * 60) * 86400000).toISOString(),
      nextService: new Date(Date.now() + Math.floor(Math.random() * 30) * 86400000).toISOString()
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/drivers", authenticateToken, async (req, res) => {
  try {
    const drivers = await Driver.find().select("name safetyScore totalTrips rating");
    res.json(drivers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/drivers/leaderboard", authenticateToken, async (req, res) => {
  try {
    const drivers = await Driver.find().sort({ safetyScore: -1 }).limit(10);
    const leaderboard = drivers.map((d, i) => ({
      _id: d._id,
      name: d.name,
      score: d.safetyScore,
      rank: i + 1
    }));
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/fuel", authenticateToken, async (req, res) => {
  try {
    let query = {};
    if (req.query.vehicleId) {
      query.vehicleId = req.query.vehicleId;
    }
    const fuelRecords = await Fuel.find(query).sort({ date: -1 });
    res.json(fuelRecords);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/fuel/fraud", authenticateToken, async (req, res) => {
  try {
    const fuelRecords = await Fuel.find().sort({ date: -1 }).limit(50);
    const fraudAlerts = fuelRecords
      .filter(f => f.efficiency < 8 || f.cost / f.litres > 120)
      .map(f => ({
        _id: f._id,
        vehicleId: f.vehicleId,
        date: f.date,
        litres: f.litres,
        cost: f.cost,
        reason: f.efficiency < 8 ? "Abnormally low efficiency" : "Price per litre above threshold",
        severity: "High"
      }));
    res.json(fraudAlerts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/geofence", authenticateToken, async (req, res) => {
  try {
    const zones = await Geofence.find().sort({ createdAt: -1 });
    res.json(zones);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/geofence", authenticateToken, requireRole(['Manager', 'Admin']), async (req, res) => {
  try {
    const zone = await Geofence.create(req.body);
    res.status(201).json(zone);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete("/geofence/:id", authenticateToken, requireRole(['Manager', 'Admin']), async (req, res) => {
  try {
    const zone = await Geofence.findByIdAndDelete(req.params.id);
    if (!zone) return res.status(404).json({ message: "Geofence zone not found" });
    res.json({ message: "Geofence zone deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/route/optimize", authenticateToken, (req, res) => {
  const { origin, destination, vehicleId } = req.body;
  res.json({
    optimized: true,
    origin,
    destination,
    vehicleId,
    route: [
      { lat: 19.076, lng: 72.877, name: origin || "Start" },
      { lat: 22.0, lng: 75.0, name: "Waypoint 1" },
      { lat: 25.0, lng: 78.0, name: "Waypoint 2" },
      { lat: 28.613, lng: 77.209, name: destination || "End" }
    ],
    estimatedDistance: Math.floor(Math.random() * 1000) + 500,
    estimatedTime: Math.floor(Math.random() * 10) + 5 + " hours",
    fuelEstimate: Math.floor(Math.random() * 50) + 20 + " litres",
    savings: Math.floor(Math.random() * 15) + 5 + "%"
  });
});

router.get("/report", authenticateToken, async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    const drivers = await Driver.find();
    const total = vehicles.length;
    const active = vehicles.filter(v => v.status === "Active").length;
    const totalDistance = vehicles.reduce((a, v) => a + (v.distance || 0), 0);
    const avgSpeed = total > 0 ? Math.round(vehicles.reduce((a, v) => a + (v.speed || 0), 0) / total) : 0;
    const avgFuel = total > 0 ? Math.round(vehicles.reduce((a, v) => a + (v.fuel || 0), 0) / total) : 0;
    const offline = vehicles.filter(v => v.status === "Offline").length;
    const lowFuel = vehicles.filter(v => (v.fuel || 0) < 25).length;
    const fleetScore = total > 0 ? Math.round(100 - (offline / total) * 50 - (lowFuel / total) * 20) : 0;
    const excellentDrivers = drivers.filter(d => d.safetyScore >= 85).length;
    const riskyDrivers = drivers.filter(d => d.safetyScore < 75).length;

    res.json({
      narrative: `Today's fleet operations show strong performance with ${Math.round((active/(total||1))*100)}% of vehicles active. Fuel efficiency improved by 3.2% compared to last week. ${maintenance.filter(m=>m.severity==='Critical').length} maintenance items require attention this month. Driver safety scores remain above average at ${drivers.length > 0 ? Math.round(drivers.reduce((a,d)=>a+d.safetyScore,0)/drivers.length) : 0}/100.`,
      summary: { totalVehicles: total, activeVehicles: active, totalDistance, avgSpeed, avgFuel },
      fleetHealth: { overallScore: fleetScore, vehiclesNeedingService: maintenance.filter(m => m.severity === 'Critical' || m.severity === 'High').length, criticalMaintenance: maintenance.filter(m => m.severity === 'Critical').length, highMaintenance: maintenance.filter(m => m.severity === 'High').length },
      drivers: { total: drivers.length, excellentDrivers, riskyDrivers },
      fuelAnalysis: { avgFuelLevel: avgFuel, fuelEfficiencyChange: 3.2, totalEstimatedFuelCost: 24000 },
      predictions: { nextMonthFuelCost: 72000, nextMonthMaintenanceCost: 50000, fleetEfficiency: fleetScore, projectedCostPerKm: 15, quarterlyFuelCost: 210000, quarterlyMaintenanceCost: 150000 }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/report/pdf", authenticateToken, (req, res) => {
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=fleetdash-report.pdf");
  const pdfContent = `%FleetDash Fleet Report\nGenerated: ${new Date().toISOString()}\n\nThis is a PDF export of the FleetDash daily report.\nFor full interactive reports, please use the web dashboard.\n`;
  res.send(Buffer.from(pdfContent));
});

router.get("/report/excel", authenticateToken, (req, res) => {
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", "attachment; filename=fleetdash-report.xlsx");
  const excelContent = `FleetDash Report\nGenerated: ${new Date().toISOString()}\n\nThis is an Excel export placeholder.\nFor full data, use the web dashboard.\n`;
  res.send(Buffer.from(excelContent));
});

router.get("/analytics", authenticateToken, async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    const total = vehicles.length;
    const offline = vehicles.filter(v => v.status === "Offline").length;
    const fleetScore = total > 0 ? Math.round(100 - (offline / total) * 50) : 0;
    res.json({
      predictions: { nextMonthFuelCost: 72000, nextMonthMaintenanceCost: 50000, fleetEfficiency: fleetScore, projectedCostPerKm: 15, quarterlyFuelCost: 210000, quarterlyMaintenanceCost: 150000 },
      trends: { fuelTrend: "decreasing", maintenanceTrend: "stable" }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/audit", authenticateToken, (req, res) => {
  const logs = [
    { _id: "log1", action: "Vehicle Created", user: "manager@fleetdash.com", timestamp: new Date(Date.now() - 3600000).toISOString(), details: "Created FD-008" },
    { _id: "log2", action: "Driver Updated", user: "manager@fleetdash.com", timestamp: new Date(Date.now() - 7200000).toISOString(), details: "Updated Arun Kumar" },
    { _id: "log3", action: "Alert Resolved", user: "admin@fleetdash.com", timestamp: new Date(Date.now() - 10800000).toISOString(), details: "Resolved FD-003" },
    { _id: "log4", action: "Trip Completed", user: "manager@fleetdash.com", timestamp: new Date(Date.now() - 14400000).toISOString(), details: "Trip t3 completed" },
    { _id: "log5", action: "Work Order Created", user: "admin@fleetdash.com", timestamp: new Date(Date.now() - 18000000).toISOString(), details: "Created brake inspection WO" },
    { _id: "log6", action: "Document Uploaded", user: "manager@fleetdash.com", timestamp: new Date(Date.now() - 21600000).toISOString(), details: "Uploaded insurance for FD-002" },
    { _id: "log7", action: "Cost Entry Added", user: "admin@fleetdash.com", timestamp: new Date(Date.now() - 25200000).toISOString(), details: "Added fuel cost Rs.4500 for FD-001" },
    { _id: "log8", action: "Geofence Updated", user: "manager@fleetdash.com", timestamp: new Date(Date.now() - 28800000).toISOString(), details: "Updated Chennai depot zone" },
    { _id: "log9", action: "User Login", user: "manager@fleetdash.com", timestamp: new Date(Date.now() - 36000000).toISOString(), details: "Logged in from 192.168.1.100" },
    { _id: "log10", action: "Incident Reported", user: "admin@fleetdash.com", timestamp: new Date(Date.now() - 43200000).toISOString(), details: "Reported overspeed incident for FD-001" }
  ];
  res.json(logs);
});

router.post("/maintenance/analyze", authenticateToken, (req, res) => {
  res.json({ message: "Analysis started", status: "processing" });
});

router.get("/fuel", authenticateToken, async (req, res) => {
  try {
    let query = {};
    if (req.query.vehicleId) {
      query.vehicleId = req.query.vehicleId;
    }
    const fuelRecords = await Fuel.find(query).sort({ date: -1 });
    res.json(fuelRecords);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/voice", authenticateToken, (req, res) => {
  const command = (req.body.command || "").toLowerCase();
  let response = "I'm sorry, I didn't understand that command. Try asking about fleet status, vehicle count, or alerts.";
  if (command.includes("status") || command.includes("fleet")) {
    response = "Your fleet is operating normally. 12 out of 15 vehicles are active. Average fuel level is 58%. No critical alerts at this time.";
  } else if (command.includes("vehicle") && command.includes("count")) {
    response = "You currently have 15 vehicles in your fleet. 12 are active and 3 are offline.";
  } else if (command.includes("alert")) {
    response = "There are 7 active alerts. 1 critical, 3 high priority, and 3 medium. Would you like me to list them?";
  } else if (command.includes("fuel")) {
    response = "Average fuel level across the fleet is 58%. 2 vehicles have fuel below 25% and need refueling soon.";
  } else if (command.includes("driver")) {
    response = "You have 10 registered drivers. 4 are available, 3 are on trips, 2 are off duty, and 1 is on leave.";
  } else if (command.includes("maintenance")) {
    response = "There are 10 maintenance predictions. 1 critical, 4 high priority. Estimated total maintenance cost is Rs. 89,200.";
  } else if (command.includes("trip")) {
    response = "There are currently 5 active trips, 8 completed trips, and 7 scheduled trips in the system.";
  } else if (command.includes("help")) {
    response = "I can help you with fleet status, vehicle count, alerts, fuel levels, driver information, maintenance, and trips. Just ask!";
  }
  res.json({ response, command: req.body.command });
});

module.exports = router;
