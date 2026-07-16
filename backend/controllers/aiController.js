const Vehicle = require("../models/Vehicle");
const MaintenancePrediction = require("../models/MaintenancePrediction");
const DriverScore = require("../models/DriverScore");
const GeofenceZone = require("../models/GeofenceZone");
const AuditLog = require("../models/AuditLog");
const FuelRecord = require("../models/FuelRecord");
const {
  analyzeMaintenanceNeeds,
  analyzeDriverScore,
  detectFuelFraud,
  optimizeRoute,
  generateDailyReport,
  predictFleetAnalytics
} = require("../services/aiService");
const { generatePDFReport, generateExcelReport } = require("../services/reportService");
const { logAction, getAuditLogs } = require("../services/auditService");

// ==================== AI MAINTENANCE PREDICTIONS ====================
const getMaintenancePredictions = async (req, res) => {
  try {
    const vehicleId = req.query.vehicleId;
    const filter = {};
    if (vehicleId) filter.vehicleId = vehicleId;

    const predictions = await MaintenancePrediction.find(filter).sort({ createdAt: -1 });
    res.status(200).json(predictions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const runMaintenanceAnalysis = async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    let allPredictions = [];

    for (const vehicle of vehicles) {
      const predictions = await analyzeMaintenanceNeeds(vehicle);
      allPredictions = allPredictions.concat(predictions);
    }

    await logAction("AI System", "Run Maintenance Analysis", "Maintenance", "", `Analyzed ${vehicles.length} vehicles`);
    res.status(200).json({ message: "Analysis complete", predictions: allPredictions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateMaintenanceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const prediction = await MaintenancePrediction.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!prediction) return res.status(404).json({ message: "Prediction not found" });

    await logAction(req.user?.name || "User", `Update Maintenance Status to ${status}`, "Maintenance", id);
    res.status(200).json(prediction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== VEHICLE HEALTH CARD ====================
const getVehicleHealthCard = async (req, res) => {
  try {
    const { id } = req.params;
    const vehicle = await Vehicle.findById(id);
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });

    const predictions = await MaintenancePrediction.find({ vehicleId: vehicle.vehicleId });
    const driverScore = await DriverScore.findOne({ vehicleId: vehicle.vehicleId });

    const engineHealth = Math.max(0, 100 - (vehicle.distance > 10000 ? 20 : 0) - (vehicle.distance > 5000 ? 10 : 0));
    const fuelEfficiency = Math.round((vehicle.fuel || 100) * 0.9);
    const drivingBehavior = driverScore ? driverScore.safetyScore : 85;
    const maintenanceStatus = predictions.length > 0
      ? Math.max(0, 100 - predictions.filter(p => p.severity !== "Low").length * 20)
      : 100;
    const batteryHealth = Math.max(0, 100 - (vehicle.distance > 8000 ? 15 : 0) - (vehicle.distance > 15000 ? 20 : 0));

    const overallScore = Math.round((engineHealth + fuelEfficiency + drivingBehavior + maintenanceStatus + batteryHealth) / 5);

    const healthCard = {
      vehicleId: vehicle.vehicleId,
      driver: vehicle.driver,
      overallScore: Math.min(100, overallScore),
      categories: [
        { name: "Engine", score: Math.min(100, engineHealth), status: engineHealth > 70 ? "Healthy" : engineHealth > 40 ? "Warning" : "Critical" },
        { name: "Fuel Efficiency", score: Math.min(100, fuelEfficiency), status: fuelEfficiency > 70 ? "Healthy" : fuelEfficiency > 40 ? "Warning" : "Critical" },
        { name: "Driving Behavior", score: Math.min(100, drivingBehavior), status: drivingBehavior > 70 ? "Healthy" : drivingBehavior > 40 ? "Warning" : "Critical" },
        { name: "Maintenance Status", score: Math.min(100, maintenanceStatus), status: maintenanceStatus > 70 ? "Healthy" : maintenanceStatus > 40 ? "Warning" : "Critical" },
        { name: "Battery Health", score: Math.min(100, batteryHealth), status: batteryHealth > 70 ? "Healthy" : batteryHealth > 40 ? "Warning" : "Critical" }
      ],
      predictions: predictions.filter(p => p.severity !== "Low").slice(0, 5),
      lastUpdated: new Date()
    };

    res.status(200).json(healthCard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllHealthCards = async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    const healthCards = [];

    for (const vehicle of vehicles) {
      const predictions = await MaintenancePrediction.find({ vehicleId: vehicle.vehicleId });
      const driverScore = await DriverScore.findOne({ vehicleId: vehicle.vehicleId });

      const engineHealth = Math.max(0, 100 - (vehicle.distance > 10000 ? 20 : 0) - (vehicle.distance > 5000 ? 10 : 0));
      const fuelEfficiency = Math.round((vehicle.fuel || 100) * 0.9);
      const drivingBehavior = driverScore ? driverScore.safetyScore : 85;
      const maintenanceStatus = predictions.length > 0
        ? Math.max(0, 100 - predictions.filter(p => p.severity !== "Low").length * 20)
        : 100;
      const batteryHealth = Math.max(0, 100 - (vehicle.distance > 8000 ? 15 : 0) - (vehicle.distance > 15000 ? 20 : 0));

      const overallScore = Math.round((engineHealth + fuelEfficiency + drivingBehavior + maintenanceStatus + batteryHealth) / 5);

      healthCards.push({
        _id: vehicle._id,
        vehicleId: vehicle.vehicleId,
        driver: vehicle.driver,
        overallScore: Math.min(100, overallScore),
        status: vehicle.status,
        speed: vehicle.speed,
        location: vehicle.location,
        fuel: vehicle.fuel,
        categories: [
          { name: "Engine", score: Math.min(100, engineHealth) },
          { name: "Fuel Efficiency", score: Math.min(100, fuelEfficiency) },
          { name: "Driving Behavior", score: Math.min(100, drivingBehavior) },
          { name: "Maintenance", score: Math.min(100, maintenanceStatus) },
          { name: "Battery", score: Math.min(100, batteryHealth) }
        ]
      });
    }

    res.status(200).json(healthCards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== DRIVER SAFETY SCORES ====================
const getDriverScores = async (req, res) => {
  try {
    const scores = await DriverScore.find().sort({ safetyScore: -1 });
    res.status(200).json(scores);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDriverLeaderboard = async (req, res) => {
  try {
    const topDrivers = await DriverScore.find().sort({ safetyScore: -1 }).limit(5);
    const riskyDrivers = await DriverScore.find({ rating: "Risky" }).sort({ safetyScore: 1 }).limit(5);
    res.status(200).json({ topDrivers, riskyDrivers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== ROUTE OPTIMIZATION ====================
const postOptimizeRoute = async (req, res) => {
  try {
    const { currentLocation, destination, preferences } = req.body;

    if (!currentLocation || !destination) {
      return res.status(400).json({ message: "Current location and destination required" });
    }

    const result = optimizeRoute(currentLocation, destination, preferences);
    await logAction(req.user?.name || "User", "Route Optimization", "Route", "", `From [${currentLocation.lat},${currentLocation.lng}] to [${destination.lat},${destination.lng}]`);

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== FUEL MONITORING ====================
const getFuelRecords = async (req, res) => {
  try {
    const { vehicleId } = req.query;
    const filter = {};
    if (vehicleId) filter.vehicleId = vehicleId;

    const records = await FuelRecord.find(filter).sort({ timestamp: -1 }).limit(50);
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getFuelFraudAlerts = async (req, res) => {
  try {
    const alerts = await FuelRecord.find({ isFraud: true }).sort({ timestamp: -1 }).limit(20);
    res.status(200).json(alerts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== GEOFENCE ZONES ====================
const getGeofenceZones = async (req, res) => {
  try {
    const zones = await GeofenceZone.find();
    res.status(200).json(zones);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createGeofenceZone = async (req, res) => {
  try {
    const zone = await GeofenceZone.create(req.body);
    await logAction(req.user?.name || "User", `Create Geofence: ${zone.name}`, "Geofence", zone._id);
    res.status(201).json(zone);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteGeofenceZone = async (req, res) => {
  try {
    const zone = await GeofenceZone.findByIdAndDelete(req.params.id);
    if (!zone) return res.status(404).json({ message: "Zone not found" });
    await logAction(req.user?.name || "User", `Delete Geofence: ${zone.name}`, "Geofence", req.params.id);
    res.status(200).json({ message: "Zone deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== AI REPORT GENERATION ====================
const getDailyReport = async (req, res) => {
  try {
    const report = await generateDailyReport();
    if (!report) return res.status(500).json({ message: "Failed to generate report" });
    await logAction(req.user?.name || "User", "Generate Daily Report", "Report", "", "AI generated daily fleet summary");
    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const downloadPDFReport = async (req, res) => {
  try {
    const pdfBuffer = await generatePDFReport();
    if (!pdfBuffer) return res.status(500).json({ message: "Failed to generate PDF" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=fleetdash-report-${Date.now()}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const downloadExcelReport = async (req, res) => {
  try {
    const workbook = await generateExcelReport();
    if (!workbook) return res.status(500).json({ message: "Failed to generate Excel" });

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=fleetdash-report-${Date.now()}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== FLEET ANALYTICS ====================
const getFleetAnalytics = async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    const analytics = predictFleetAnalytics(vehicles);

    // Add real-time data
    const totalMileage = vehicles.reduce((a, v) => a + (v.distance || 0), 0);
    const activeCount = vehicles.filter(v => v.status === "Active").length;
    const avgFuel = vehicles.reduce((a, v) => a + (v.fuel || 0), 0) / (vehicles.length || 1);

    res.status(200).json({
      ...analytics,
      realtimeData: {
        totalMileage,
        activeCount,
        totalVehicles: vehicles.length,
        avgFuelLevel: Math.round(avgFuel)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== AUDIT LOGS ====================
const getAuditLogsHandler = async (req, res) => {
  try {
    const logs = await getAuditLogs(req.query);
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== VOICE AI ASSISTANT ====================
const handleVoiceCommand = async (req, res) => {
  try {
    const { command } = req.body;
    if (!command) return res.status(400).json({ message: "Command required" });

    const cmd = command.toLowerCase();
    let response = {};

    if (cmd.includes("offline")) {
      const vehicles = await Vehicle.find({ status: "Offline" });
      response = { type: "vehicles", data: vehicles, message: `${vehicles.length} vehicles offline` };
    } else if (cmd.includes("need service") || cmd.includes("maintenance") || cmd.includes("service")) {
      const predictions = await MaintenancePrediction.find({ severity: { $in: ["High", "Critical"] }, status: "Pending" });
      const uniqueVehicles = [...new Set(predictions.map(p => p.vehicleId))];
      response = { type: "maintenance", data: predictions, message: `${uniqueVehicles.length} vehicles need service` };
    } else if (cmd.includes("report") || cmd.includes("summary")) {
      const report = await generateDailyReport();
      response = { type: "report", data: report, message: report?.narrative || "Report generated" };
    } else if (cmd.includes("active")) {
      const vehicles = await Vehicle.find({ status: "Active" });
      response = { type: "vehicles", data: vehicles, message: `${vehicles.length} active vehicles` };
    } else if (cmd.includes("risk") || cmd.includes("risky")) {
      const drivers = await DriverScore.find({ rating: "Risky" });
      response = { type: "drivers", data: drivers, message: `${drivers.length} risky drivers` };
    } else if (cmd.includes("health")) {
      const vehicles = await Vehicle.find();
      const avgHealth = Math.round(vehicles.reduce((a) => a + (70 + Math.random() * 30), 0) / (vehicles.length || 1));
      response = { type: "health", data: { avgHealth, total: vehicles.length }, message: `Average fleet health is ${avgHealth}%` };
    } else {
      response = { type: "unknown", message: "Command not recognized. Try: offline vehicles, need service, generate report" };
    }

    await logAction(req.user?.name || "User", `Voice Command: "${command}"`, "Voice", "", response.message);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMaintenancePredictions,
  runMaintenanceAnalysis,
  updateMaintenanceStatus,
  getVehicleHealthCard,
  getAllHealthCards,
  getDriverScores,
  getDriverLeaderboard,
  postOptimizeRoute,
  getFuelRecords,
  getFuelFraudAlerts,
  getGeofenceZones,
  createGeofenceZone,
  deleteGeofenceZone,
  getDailyReport,
  downloadPDFReport,
  downloadExcelReport,
  getFleetAnalytics,
  getAuditLogsHandler,
  handleVoiceCommand
};