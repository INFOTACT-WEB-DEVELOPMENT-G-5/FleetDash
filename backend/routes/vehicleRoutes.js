const express = require("express");
const router = express.Router();
const redis = require('../config/redis');
const Vehicle = require("../models/Vehicle");
const workerPool = require("../config/workerPool");


router.get("/", async (req, res) => {
    try {
        const vehicles = await Vehicle.find();
        res.json(vehicles);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});


router.post("/", async (req, res) => {
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


router.post('/telemetry', async (req, res) => {
    try {
        workerPool.run(req.body).catch(console.error);

        res.status(202).json({ status: "accepted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;