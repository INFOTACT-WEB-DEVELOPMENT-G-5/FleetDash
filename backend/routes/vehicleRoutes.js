const express = require("express");
const router = express.Router();
const redisConfig = require('../config/redis');
const Vehicle = require("../models/Vehicle");
const workerPool = require("../config/workerPool");
const { authenticateToken, requireRole } = require("../middleware/authMiddleware");

router.get("/", authenticateToken, async (req, res) => {
    try {
        const vehicles = await Vehicle.find();
        res.json(vehicles);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});


router.post("/", authenticateToken, requireRole(['Manager', 'Admin']), async (req, res) => {
    try {
        const vehicle = new Vehicle(req.body);
        const savedVehicle = await vehicle.save();
        res.json(savedVehicle);
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
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

router.put("/:id", authenticateToken, requireRole(['Manager', 'Admin']), async (req, res) => {
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

router.delete("/:id", authenticateToken, requireRole(['Manager', 'Admin']), async (req, res) => {
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

router.post('/telemetry', authenticateToken, async (req, res) => {
    try {
        const payload = await workerPool.run(req.body);

        res.status(202).json({ status: "accepted" });

        if (redisConfig.isRedisConnected()) {
            redisConfig.redis.publish("vehicle:updates", JSON.stringify(payload)).catch(console.error);
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;