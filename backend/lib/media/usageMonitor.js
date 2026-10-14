const { getCloudinary, isCloudinaryConfigured, mediaConfig } = require("./config");
const log = require("./logger");

const METRICS = ["storage", "bandwidth", "transformations", "credits", "objects", "resources", "derived_resources"];

/**
 * Reads Cloudinary account usage and logs a warning for every metric whose
 * used_percent crosses CLOUDINARY_USAGE_ALERT_PERCENT.
 */
const checkUsage = async () => {
  if (!isCloudinaryConfigured()) return { configured: false };
  const usage = await getCloudinary().api.usage();
  const threshold = mediaConfig.usageAlertPercent;

  const metrics = {};
  const alerts = [];
  for (const key of METRICS) {
    const value = usage[key];
    if (value === undefined) continue;
    if (typeof value === "object") {
      metrics[key] = {
        usage: value.usage ?? value.used ?? null,
        limit: value.limit ?? null,
        used_percent: value.used_percent ?? null,
      };
      if (typeof value.used_percent === "number" && value.used_percent >= threshold) {
        alerts.push({ metric: key, used_percent: value.used_percent });
      }
    } else {
      metrics[key] = value;
    }
  }

  const report = {
    configured: true,
    plan: usage.plan,
    last_updated: usage.last_updated,
    threshold,
    metrics,
    alerts,
  };

  if (alerts.length) log.warn("cloudinary_usage_alert", { alerts, plan: usage.plan });
  else log.info("cloudinary_usage_ok", { plan: usage.plan });

  return report;
};

module.exports = { checkUsage };
