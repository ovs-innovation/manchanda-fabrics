const os = require("os");
const mongoose = require("mongoose");
const MediaAsset = require("../../models/MediaAsset");
const MediaCleanupJob = require("../../models/MediaCleanupJob");
const MediaAuditLog = require("../../models/MediaAuditLog");
const { getCloudinary, isCloudinaryConfigured, mediaConfig } = require("./config");
const { collectCloudinaryUrls, parseCloudinaryUrl } = require("./urls");
const { scanReferences, referenceCount, referenceLocation } = require("./referenceScanner");
const { isProtectedPublicId } = require("./protectedAssets");
const log = require("./logger");

const MAX_ATTEMPTS = 6;
const DELETE_BATCH_SIZE = 100;
const LOCK_OWNER = `${os.hostname()}:${process.pid}`;

const isDbReady = () => mongoose.connection.readyState === 1;

const acquireLock = async (name, ttlMs) => {
  if (!isDbReady()) return false;
  const now = new Date();
  try {
    await mongoose.connection.db.collection("media_locks").findOneAndUpdate(
      { _id: name, $or: [{ expiresAt: { $lt: now } }, { expiresAt: { $exists: false } }] },
      { $set: { expiresAt: new Date(now.getTime() + ttlMs), owner: LOCK_OWNER } },
      { upsert: true }
    );
    return true;
  } catch (err) {
    if (err && err.code === 11000) return false;
    throw err;
  }
};

const releaseLock = async (name) => {
  if (!isDbReady()) return;
  await mongoose.connection.db
    .collection("media_locks")
    .deleteOne({ _id: name, owner: LOCK_OWNER })
    .catch(() => {});
};

const audit = (action, data = {}) =>
  MediaAuditLog.create({ action, ...data }).catch((err) =>
    log.warn("audit_write_failed", { action, error: err.message })
  );

/** Cloudinary assets of this account that a URL list points at (unambiguous parses only). */
const toCandidates = (urls) => {
  const cloudName = mediaConfig.cloudName;
  if (!cloudName) return [];
  const unique = new Map();
  for (const url of urls) {
    const parsed = parseCloudinaryUrl(url);
    if (!parsed || !parsed.publicId) continue;
    if (parsed.cloudName !== cloudName || parsed.deliveryType !== "upload") continue;
    const key = `${parsed.resourceType}:${parsed.publicId}`;
    if (!unique.has(key)) {
      unique.set(key, { publicId: parsed.publicId, resourceType: parsed.resourceType, url });
    }
  }
  return [...unique.values()];
};

/** Collects every Cloudinary URL inside a document / value. Never throws. */
const snapshotMedia = (value) => {
  try {
    return collectCloudinaryUrls(value);
  } catch (err) {
    log.warn("snapshot_failed", { error: err.message });
    return [];
  }
};

/** Collects media of every document matching `filter` before a bulk write. Never throws. */
const snapshotMediaFromQuery = async (Model, filter) => {
  try {
    if (mediaConfig.cleanupMode === "off" || !isDbReady()) return [];
    const docs = await Model.find(filter).lean();
    return snapshotMedia(docs);
  } catch (err) {
    log.warn("snapshot_query_failed", { model: Model?.modelName, error: err.message });
    return [];
  }
};

const enqueueCandidates = async (candidates, source, delayMinutes) => {
  if (!candidates.length || !isDbReady()) return 0;
  const notBefore = new Date(Date.now() + delayMinutes * 60 * 1000);
  await Promise.all(
    candidates.map((c) =>
      MediaCleanupJob.updateOne(
        {
          publicId: c.publicId,
          resourceType: c.resourceType,
          status: { $in: ["pending", "retry", "dry_run"] },
        },
        {
          $setOnInsert: { url: c.url, status: "pending", notBefore, attempts: 0 },
          $addToSet: { sources: source },
        },
        { upsert: true }
      )
    )
  );
  return candidates.length;
};

/**
 * Call AFTER the database write succeeded. Queues media that was present in
 * `before` but is gone from `after` (pass `after = null` for deletes). The
 * actual delete happens later, only after a full reference check.
 * Fire-and-forget: never throws and never blocks the API response.
 */
const releaseMedia = (beforeUrls, after, source) => {
  try {
    if (mediaConfig.cleanupMode === "off" || !Array.isArray(beforeUrls) || !beforeUrls.length) return;
    const afterUrls = new Set(after ? snapshotMedia(after) : []);
    const removed = beforeUrls.filter((url) => !afterUrls.has(url));
    const afterIds = new Set(toCandidates([...afterUrls]).map((c) => `${c.resourceType}:${c.publicId}`));
    const candidates = toCandidates(removed).filter(
      (c) => !afterIds.has(`${c.resourceType}:${c.publicId}`)
    );
    if (!candidates.length) return;
    enqueueCandidates(candidates, source, mediaConfig.cleanupGraceMinutes)
      .then((count) => log.info("cleanup_enqueued", { source, count }))
      .catch((err) => log.warn("cleanup_enqueue_failed", { source, error: err.message }));
  } catch (err) {
    log.warn("release_media_failed", { source, error: err.message });
  }
};

/** Explicit admin deletion request for a single asset; still goes through the reference check. */
const requestDeletion = async (publicId, resourceType = "image", actor = "admin") => {
  const candidate = { publicId, resourceType, url: "" };
  await enqueueCandidates([candidate], `manual:${actor}`, 0);
  audit("delete_requested", { publicId, resourceType, actor });
};

const destroyBatch = async (resourceType, publicIds) => {
  const cloudinary = getCloudinary();
  const outcome = {};
  for (let i = 0; i < publicIds.length; i += DELETE_BATCH_SIZE) {
    const chunk = publicIds.slice(i, i + DELETE_BATCH_SIZE);
    // eslint-disable-next-line no-await-in-loop
    const res = await cloudinary.api.delete_resources(chunk, {
      resource_type: resourceType,
      type: "upload",
      invalidate: true,
    });
    Object.assign(outcome, res?.deleted || {});
  }
  return outcome;
};

/**
 * Core safe-delete pipeline shared by the cleanup queue and the orphan sweeper.
 * Order: protected list -> recently requested -> full reference scan -> delete.
 * Throws if the reference scan fails (callers keep everything in that case).
 */
const evaluateAndDelete = async (candidates, { mode, actor, databases }) => {
  const results = [];
  const now = Date.now();
  const recentCutoff = new Date(now - mediaConfig.recentRequestGraceHours * 3600 * 1000);

  const remaining = [];
  for (const c of candidates) {
    if (isProtectedPublicId(c.publicId)) results.push({ ...c, outcome: "protected" });
    else remaining.push(c);
  }
  if (!remaining.length) return results;

  const recent = await MediaAsset.find(
    { publicId: { $in: remaining.map((c) => c.publicId) }, lastRequestedAt: { $gt: recentCutoff } },
    { publicId: 1, resourceType: 1, lastRequestedAt: 1 }
  ).lean();
  const recentMap = new Map(recent.map((r) => [`${r.resourceType}:${r.publicId}`, r.lastRequestedAt]));

  const toScan = [];
  for (const c of remaining) {
    const requestedAt = recentMap.get(`${c.resourceType}:${c.publicId}`);
    if (requestedAt) results.push({ ...c, outcome: "recently_requested", requestedAt });
    else toScan.push(c);
  }
  if (!toScan.length) return results;

  const referenced = await scanReferences(toScan.map((c) => c.publicId), { databases });
  const scannedAt = new Date();

  const unreferenced = [];
  for (const c of toScan) {
    const count = referenceCount(referenced, c.publicId);
    MediaAsset.updateOne(
      { publicId: c.publicId, resourceType: c.resourceType },
      { $set: { lastReferenceCount: count, lastScannedAt: scannedAt } }
    ).catch(() => {});
    if (count > 0) {
      results.push({ ...c, outcome: "kept", references: count, where: referenceLocation(referenced, c.publicId) });
    } else {
      unreferenced.push(c);
    }
  }

  if (mode !== "delete") {
    for (const c of unreferenced) {
      results.push({ ...c, outcome: "dry_run" });
      audit("would_delete", { publicId: c.publicId, resourceType: c.resourceType, mode, actor });
    }
    return results;
  }

  const byType = {};
  for (const c of unreferenced) (byType[c.resourceType] ||= []).push(c);

  for (const [resourceType, list] of Object.entries(byType)) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const outcome = await destroyBatch(resourceType, list.map((c) => c.publicId));
      for (const c of list) {
        const status = outcome[c.publicId] === "deleted" ? "deleted" : "not_found";
        results.push({ ...c, outcome: status });
        MediaAsset.updateOne(
          { publicId: c.publicId, resourceType },
          { $set: { status: status === "deleted" ? "deleted" : "missing", deletedAt: new Date() } }
        ).catch(() => {});
        audit("deleted", { publicId: c.publicId, resourceType, mode, actor, details: { cloudinary: status } });
      }
    } catch (err) {
      for (const c of list) results.push({ ...c, outcome: "error", error: err?.error?.message || err.message });
      log.error("cloudinary_delete_failed", { resourceType, count: list.length, error: err?.error?.message || err.message });
    }
  }

  return results;
};

const backoffDate = (attempts) => new Date(Date.now() + Math.min(24 * 60, 5 * 2 ** attempts) * 60 * 1000);

const markJobFailure = (job, message) => {
  const attempts = (job.attempts || 0) + 1;
  return MediaCleanupJob.updateOne(
    { _id: job._id },
    {
      $set: {
        attempts,
        status: attempts >= MAX_ATTEMPTS ? "failed" : "retry",
        notBefore: backoffDate(attempts),
        lastError: String(message || "").slice(0, 500),
        processedAt: new Date(),
      },
    }
  );
};

/** Processes due cleanup jobs. Safe to call concurrently from many instances. */
const processQueue = async ({ limit = 200 } = {}) => {
  const mode = mediaConfig.cleanupMode;
  if (mode === "off") return { skipped: "mode_off" };
  if (!isCloudinaryConfigured()) return { skipped: "cloudinary_not_configured" };
  if (!isDbReady()) return { skipped: "db_not_ready" };

  const lockName = "media-cleanup-queue";
  if (!(await acquireLock(lockName, 30 * 60 * 1000))) return { skipped: "locked" };

  try {
    const statuses = mode === "delete" ? ["pending", "retry", "dry_run"] : ["pending", "retry"];
    const jobs = await MediaCleanupJob.find({ status: { $in: statuses }, notBefore: { $lte: new Date() } })
      .sort({ notBefore: 1 })
      .limit(limit)
      .lean();
    if (!jobs.length) return { processed: 0, mode };

    let results;
    try {
      results = await evaluateAndDelete(
        jobs.map((j) => ({ publicId: j.publicId, resourceType: j.resourceType, url: j.url, jobId: j._id })),
        { mode, actor: "queue" }
      );
    } catch (err) {
      log.error("cleanup_scan_failed", { error: err.message, jobs: jobs.length });
      await Promise.all(jobs.map((job) => markJobFailure(job, err.message)));
      return { processed: 0, error: err.message, mode };
    }

    const jobsById = new Map(jobs.map((j) => [String(j._id), j]));
    const summary = {};
    await Promise.all(
      results.map((r) => {
        summary[r.outcome] = (summary[r.outcome] || 0) + 1;
        const job = jobsById.get(String(r.jobId));
        if (!job) return null;
        if (r.outcome === "error") return markJobFailure(job, r.error);
        if (r.outcome === "recently_requested") {
          const retryAt = new Date(
            new Date(r.requestedAt).getTime() + mediaConfig.recentRequestGraceHours * 3600 * 1000
          );
          return MediaCleanupJob.updateOne({ _id: job._id }, { $set: { notBefore: retryAt, reason: r.outcome } });
        }
        return MediaCleanupJob.updateOne(
          { _id: job._id },
          {
            $set: {
              status: r.outcome,
              reason: r.where ? `${r.outcome}:${r.where}` : r.outcome,
              processedAt: new Date(),
            },
          }
        );
      })
    );

    log.info("cleanup_queue_processed", { mode, jobs: jobs.length, ...summary });
    return { processed: jobs.length, mode, summary };
  } finally {
    await releaseLock(lockName);
  }
};

module.exports = {
  snapshotMedia,
  snapshotMediaFromQuery,
  releaseMedia,
  requestDeletion,
  evaluateAndDelete,
  processQueue,
  acquireLock,
  releaseLock,
  toCandidates,
  audit,
};
