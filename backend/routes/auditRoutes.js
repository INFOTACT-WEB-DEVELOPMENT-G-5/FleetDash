const express = require("express");
const router = express.Router();
const AuditLog = require("../models/AuditLog");
const { authenticateToken, requireRole } = require("../middleware/authMiddleware");

// Get audit logs with filters
router.get("/", authenticateToken, requireRole(['Admin']), async (req, res) => {
  try {
    let query = {};
    if (req.query.user) query.user = { $regex: req.query.user, $options: "i" };
    if (req.query.action) query.action = req.query.action;
    if (req.query.module) query.module = req.query.module;
    if (req.query.startDate && req.query.endDate) {
      query.createdAt = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }

    const logs = await AuditLog.find(query).sort({ createdAt: -1 }).limit(100);
    res.json({ logs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get audit log stats
router.get("/stats", authenticateToken, requireRole(['Admin']), async (req, res) => {
  try {
    const totalLogs = await AuditLog.countDocuments();
    const todayLogs = await AuditLog.countDocuments({
      createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
    });

    const byAction = await AuditLog.aggregate([
      { $group: { _id: "$action", count: { $sum: 1 } } }
    ]);

    const byModule = await AuditLog.aggregate([
      { $group: { _id: "$module", count: { $sum: 1 } } }
    ]);

    const byUser = await AuditLog.aggregate([
      { $group: { _id: "$user", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      totalLogs,
      todayLogs,
      byAction,
      byModule,
      byUser
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create audit log (internal use)
router.post("/", authenticateToken, async (req, res) => {
  try {
    const log = await AuditLog.create({
      ...req.body,
      user: req.body.user || req.user?.email || 'system',
      userId: req.body.userId || req.user?.id,
      ipAddress: req.body.ipAddress || req.ip,
      userAgent: req.body.userAgent || req.get('user-agent')
    });
    res.status(201).json(log);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;