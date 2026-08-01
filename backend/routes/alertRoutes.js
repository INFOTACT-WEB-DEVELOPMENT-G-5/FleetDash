const express = require("express");
const router = express.Router();
const Alert = require("../models/Alert");
const { authenticateToken, requireRole } = require("../middleware/authMiddleware");

router.get("/", authenticateToken, async (req, res) => {
  try {
    let query = {};
    if (req.query.vehicleId) {
      query.vehicleId = req.query.vehicleId;
    }
    if (req.query.type && req.query.type !== "All") {
      query.type = req.query.type;
    }
    if (req.query.severity && req.query.severity !== "All") {
      query.severity = req.query.severity;
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const total = await Alert.countDocuments(query);
    const alerts = await Alert.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);

    res.json({ alerts, pages: Math.ceil(total / limit), total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/stats/summary", authenticateToken, async (req, res) => {
  try {
    const total = await Alert.countDocuments();
    const unacknowledged = await Alert.countDocuments({ acknowledged: false });

    const severityAgg = await Alert.aggregate([
      { $group: { _id: "$severity", count: { $sum: 1 } } }
    ]);
    const bySeverity = ["Critical", "High", "Medium", "Low"].map(s => {
      const found = severityAgg.find(a => a._id === s);
      return { _id: s, count: found ? found.count : 0 };
    });

    const typeAgg = await Alert.aggregate([
      { $group: { _id: "$type", count: { $sum: 1 } } }
    ]);
    const byType = typeAgg.map(a => ({ _id: a._id, count: a.count }));

    res.json({ total, unacknowledged, bySeverity, byType });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) return res.status(404).json({ message: "Alert not found" });
    res.json(alert);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/:id/acknowledge", authenticateToken, async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { acknowledged: true, acknowledgedBy: req.body.userName || req.user?.email },
      { new: true }
    );
    if (!alert) return res.status(404).json({ message: "Alert not found" });
    res.json(alert);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/acknowledge-all", authenticateToken, async (req, res) => {
  try {
    await Alert.updateMany({ acknowledged: false }, { acknowledged: true, acknowledgedBy: req.body.userName || req.user?.email });
    res.json({ message: "All alerts acknowledged" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/:id/resolve", authenticateToken, async (req, res) => {
  try {
    const alert = await Alert.findByIdAndDelete(req.params.id);
    if (!alert) return res.status(404).json({ message: "Alert not found" });
    res.json({ message: "Alert resolved" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", authenticateToken, requireRole(['Manager', 'Admin']), async (req, res) => {
  try {
    const alert = await Alert.findByIdAndDelete(req.params.id);
    if (!alert) return res.status(404).json({ message: "Alert not found" });
    res.json({ message: "Alert deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
