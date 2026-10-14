const { isCloudinaryConfigured, mediaConfig } = require("./config");
const { processQueue } = require("./cleanupService");
const { checkUsage } = require("./usageMonitor");
const log = require("./logger");

let started = false;

/**
 * Background loop: drains the cleanup queue and monitors Cloudinary usage.
 * Timers are unref'd so they never keep the process alive on shutdown.
 */
const startMediaWorker = () => {
  if (started || !mediaConfig.workerEnabled) return;
  started = true;

  const runQueue = () =>
    processQueue().catch((err) => log.error("cleanup_worker_error", { error: err.message }));
  const runUsage = () => {
    if (!isCloudinaryConfigured()) return;
    checkUsage().catch((err) =>
      log.warn("usage_check_failed", { error: err?.error?.message || err.message })
    );
  };

  const queueTimer = setInterval(runQueue, mediaConfig.workerIntervalMinutes * 60 * 1000);
  const usageTimer = setInterval(runUsage, mediaConfig.usageCheckHours * 3600 * 1000);
  queueTimer.unref();
  usageTimer.unref();

  const warmup = setTimeout(() => {
    runQueue();
    runUsage();
  }, 60 * 1000);
  warmup.unref();

  log.info("media_worker_started", {
    mode: mediaConfig.cleanupMode,
    intervalMinutes: mediaConfig.workerIntervalMinutes,
  });
};

module.exports = { startMediaWorker };
