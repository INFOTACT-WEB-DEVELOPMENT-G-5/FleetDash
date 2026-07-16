const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
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
} = require("../controllers/aiController");

// AI Maintenance
router.get("/maintenance", auth, getMaintenancePredictions);
router.post("/maintenance/analyze", auth, runMaintenanceAnalysis);
router.put("/maintenance/:id/status", auth, updateMaintenanceStatus);

// Vehicle Health Cards
router.get("/health", auth, getAllHealthCards);
router.get("/health/:id", auth, getVehicleHealthCard);

// Driver Safety
router.get("/drivers", auth, getDriverScores);
router.get("/drivers/leaderboard", auth, getDriverLeaderboard);

// Route Optimization
router.post("/route/optimize", auth, postOptimizeRoute);

// Fuel Monitoring
router.get("/fuel", auth, getFuelRecords);
router.get("/fuel/fraud", auth, getFuelFraudAlerts);

// Geofence
router.get("/geofence", auth, getGeofenceZones);
router.post("/geofence", auth, createGeofenceZone);
router.delete("/geofence/:id", auth, deleteGeofenceZone);

// Reports
router.get("/report", auth, getDailyReport);
router.get("/report/pdf", auth, downloadPDFReport);
router.get("/report/excel", auth, downloadExcelReport);

// Analytics
router.get("/analytics", auth, getFleetAnalytics);

// Audit Logs
router.get("/audit", auth, getAuditLogsHandler);

// Voice AI
router.post("/voice", auth, handleVoiceCommand);

module.exports = router;