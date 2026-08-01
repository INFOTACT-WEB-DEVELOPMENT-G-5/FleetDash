const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const { login, register } = require("../controllers/authController");

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

module.exports = router;
