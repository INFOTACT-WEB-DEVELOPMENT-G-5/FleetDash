const express = require("express");
const router = express.Router();
const Driver = require("../models/Driver");
const { authenticateToken, requireRole } = require("../middleware/authMiddleware");

router.get("/", authenticateToken, async (req, res) => {
  try {
    let query = {};
    if (req.query.search) {
      query.name = { $regex: req.query.search, $options: "i" };
    }
    if (req.query.status && req.query.status !== "All") {
      query.currentStatus = req.query.status;
    }
    const drivers = await Driver.find(query).sort({ createdAt: -1 });
    res.json({ drivers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) return res.status(404).json({ message: "Driver not found" });
    res.json(driver);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", authenticateToken, requireRole(['Manager', 'Admin']), async (req, res) => {
  try {
    const driver = new Driver({
      ...req.body,
      safetyScore: req.body.safetyScore || Math.floor(Math.random() * 30) + 70
    });
    const savedDriver = await driver.save();
    res.status(201).json(savedDriver);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put("/:id", authenticateToken, requireRole(['Manager', 'Admin']), async (req, res) => {
  try {
    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!driver) return res.status(404).json({ message: "Driver not found" });
    res.json(driver);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete("/:id", authenticateToken, requireRole(['Manager', 'Admin']), async (req, res) => {
  try {
    const driver = await Driver.findByIdAndDelete(req.params.id);
    if (!driver) return res.status(404).json({ message: "Driver not found" });
    res.json({ message: "Driver removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
