const express = require("express");
const rateLimit = require("express-rate-limit");
const { isAuth, isAdmin } = require("../config/auth");
const {
  signUpload,
  registerUpload,
  getUsage,
  getCleanupStatus,
  runCleanup,
  isAdminUser,
} = require("../controller/mediaController");

const router = express.Router();

const keyByUser = (req) => String(req.user?._id || req.ip);

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: (req) => (isAdminUser(req.user) ? 600 : 20),
  keyGenerator: keyByUser,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many upload requests. Please try again later." },
});

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  keyGenerator: keyByUser,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/sign", isAuth, uploadLimiter, signUpload);
router.post("/register", isAuth, uploadLimiter, registerUpload);

router.get("/usage", isAuth, isAdmin, adminLimiter, getUsage);
router.get("/cleanup/status", isAuth, isAdmin, adminLimiter, getCleanupStatus);
router.post("/cleanup/run", isAuth, isAdmin, adminLimiter, runCleanup);

module.exports = router;
