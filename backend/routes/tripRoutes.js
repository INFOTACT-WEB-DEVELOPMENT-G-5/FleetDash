const express = require("express");
const router = express.Router();
const Trip = require("../models/Trip");
const { authenticateToken, requireRole } = require("../middleware/authMiddleware");

router.get("/", authenticateToken, async (req, res) => {
  try {
    let query = {};
    if (req.query.vehicleId) {
      query.vehicleId = req.query.vehicleId;
    }
    if (req.query.driver) {
      query.driver = { $regex: req.query.driver, $options: "i" };
    }
    if (req.query.status && req.query.status !== "All") {
      query.status = req.query.status;
    }
    const trips = await Trip.find(query).sort({ startTime: -1 });
    res.json(trips);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/playback/:id", authenticateToken, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: "Trip not found" });
    
    // Generate realistic route points
    const originLat = 19.076;
    const originLng = 72.877;
    const destLat = 28.613;
    const destLng = 77.209;
    
    const startTime = new Date(trip.startTime).getTime();
    const endTime = trip.endTime ? new Date(trip.endTime).getTime() : startTime + 3600000;
    const duration = endTime - startTime;
    
    const route = [];
    const points = 20;
    for (let i = 0; i <= points; i++) {
      const progress = i / points;
      route.push({
        lat: originLat + (destLat - originLat) * progress + (Math.random() - 0.5) * 0.5,
        lng: originLng + (destLng - originLng) * progress + (Math.random() - 0.5) * 0.5,
        timestamp: new Date(startTime + duration * progress).toISOString(),
        speed: Math.floor(Math.random() * 40) + 40
      });
    }
    
    const playback = {
      tripId: trip._id,
      vehicleId: trip.vehicleId,
      driver: trip.driver,
      origin: trip.origin,
      destination: trip.destination,
      distance: trip.distance,
      duration: trip.duration,
      route
    };
    res.json(playback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", authenticateToken, requireRole(['Manager', 'Admin']), async (req, res) => {
  try {
    const trip = new Trip({
      ...req.body,
      startTime: req.body.startTime || new Date()
    });
    const savedTrip = await trip.save();
    res.status(201).json(savedTrip);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put("/:id", authenticateToken, requireRole(['Manager', 'Admin']), async (req, res) => {
  try {
    const trip = await Trip.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!trip) return res.status(404).json({ message: "Trip not found" });
    res.json(trip);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
