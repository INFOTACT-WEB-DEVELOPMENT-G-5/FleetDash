const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const { login, register, getAllUsers, getUserById, updateUser, deleteUser, deactivateUser, createUser } = require("../controllers/authController");
const { authenticateToken, requireRole } = require("../middleware/authMiddleware");

const isProduction = process.env.NODE_ENV === 'production';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProduction ? 5 : 100,
  message: {
    success: false,
    message: "Too many login attempts. Please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: isProduction ? 5 : 50,
  message: {
    success: false,
    message: "Too many registration attempts. Please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/login", loginLimiter, login);
router.post("/register", registerLimiter, register);

// User Management Routes
router.post("/users", authenticateToken, requireRole(['Admin', 'Manager']), createUser);
router.get("/users", authenticateToken, requireRole(['Admin', 'Manager']), getAllUsers);
router.get("/users/:id", authenticateToken, requireRole(['Admin', 'Manager']), getUserById);
router.put("/users/:id", authenticateToken, requireRole(['Admin']), updateUser);
router.delete("/users/:id", authenticateToken, requireRole(['Admin']), deleteUser);
router.put("/users/:id/deactivate", authenticateToken, requireRole(['Admin']), deactivateUser);

module.exports = router;
