require("../../config/env");
const cloudinary = require("cloudinary").v2;

const env = (key, fallback) => {
  const value = process.env[key];
  return value === undefined || value === "" ? fallback : value;
};

const numberEnv = (key, fallback) => {
  const parsed = Number(env(key, fallback));
  return Number.isFinite(parsed) ? parsed : fallback;
};

const isCloudinaryConfigured = () =>
  Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );

let configured = false;
const getCloudinary = () => {
  if (!configured && isCloudinaryConfigured()) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
    configured = true;
  }
  return cloudinary;
};

const CLEANUP_MODES = ["off", "dry-run", "delete"];

const getCleanupMode = () => {
  const mode = String(env("MEDIA_CLEANUP_MODE", "dry-run")).toLowerCase();
  return CLEANUP_MODES.includes(mode) ? mode : "dry-run";
};

const mediaConfig = {
  get cloudName() {
    return process.env.CLOUDINARY_CLOUD_NAME || "";
  },
  get cleanupMode() {
    return getCleanupMode();
  },
  get workerEnabled() {
    return String(env("MEDIA_WORKER_ENABLED", "true")).toLowerCase() !== "false";
  },
  get workerIntervalMinutes() {
    return Math.max(1, numberEnv("MEDIA_WORKER_INTERVAL_MINUTES", 15));
  },
  get cleanupGraceMinutes() {
    return Math.max(0, numberEnv("MEDIA_CLEANUP_GRACE_MINUTES", 60));
  },
  get recentRequestGraceHours() {
    return Math.max(1, numberEnv("MEDIA_RECENT_REQUEST_GRACE_HOURS", 48));
  },
  get orphanMinAgeHours() {
    return Math.max(48, numberEnv("MEDIA_ORPHAN_MIN_AGE_HOURS", 48));
  },
  get usageAlertPercent() {
    return Math.min(100, Math.max(1, numberEnv("CLOUDINARY_USAGE_ALERT_PERCENT", 80)));
  },
  get usageCheckHours() {
    return Math.max(1, numberEnv("CLOUDINARY_USAGE_CHECK_HOURS", 6));
  },
  get protectedPrefixes() {
    return String(env("MEDIA_PROTECTED_PREFIXES", ""))
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);
  },
};

module.exports = {
  getCloudinary,
  isCloudinaryConfigured,
  mediaConfig,
  CLEANUP_MODES,
};
