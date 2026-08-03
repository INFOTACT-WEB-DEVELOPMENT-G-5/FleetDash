const express = require("express");
const router = express.Router();
const Vehicle = require("../models/Vehicle");
const workerPool = require("../config/workerPool");
const { authenticateToken, requireRole } = require("../middleware/authMiddleware");
const realtime = require("../services/realtime");
const { checkGeofence } = require("../services/geofenceService");

router.get("/", authenticateToken, async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", authenticateToken, requireRole(["Manager", "Admin"]), async (req, res) => {
  try {
    const vehicle = new Vehicle(req.body);
    const savedVehicle = await vehicle.save();
    res.json(savedVehicle);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const vehicle = await Vehicle.findOne({ vehicleId: req.params.id });
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/:id", authenticateToken, requireRole(["Manager", "Admin"]), async (req, res) => {
  try {
    const vehicle = await Vehicle.findOneAndUpdate(
      { vehicleId: req.params.id },
      req.body,
      { new: true }
    );
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }
    res.json(vehicle);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete("/:id", authenticateToken, requireRole(["Manager", "Admin"]), async (req, res) => {
  try {
    const vehicle = await Vehicle.findOneAndDelete({ vehicleId: req.params.id });
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }
    res.json({ message: "Vehicle deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/telemetry", authenticateToken, async (req, res) => {
  try {
    const payload = await workerPool.run(req.body);

    // Persist latest location when vehicle exists
    const updated = await Vehicle.findOneAndUpdate(
      { vehicleId: payload.vehicleId },
      {
        location: { lat: payload.lat, lng: payload.lng },
        speed: payload.speed,
        fuel: payload.fuel,
        status: payload.status || "Active",
      },
      { new: true }
    );

    const broadcast = updated
      ? {
          _id: updated._id,
          vehicleId: updated.vehicleId,
          driver: updated.driver,
          status: updated.status,
          speed: updated.speed,
          fuel: updated.fuel,
          type: updated.type,
          location: updated.location,
          lat: payload.lat,
          lng: payload.lng,
          timestamp: payload.timestamp,
        }
      : payload;

    await realtime.publishVehicleUpdate(broadcast);

    setImmediate(() => {
      checkGeofence(payload.vehicleId, payload.lat, payload.lng).catch(() => {});
    });

    res.status(202).json({ status: "accepted", vehicleId: payload.vehicleId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
