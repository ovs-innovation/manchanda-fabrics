/**
 * Full-account Cloudinary cleanup: finds duplicate and orphan assets and (optionally)
 * deletes them. Every asset referenced anywhere in MongoDB (all databases on the
 * cluster) or in the source code is kept.
 *
 * Step 1 – dry run (default). Writes logs/cleanup-dry-run-<ts>.json:
 *   node script/cloudinary/cleanupAccount.js
 *
 * Step 2 – after reviewing that report, delete exactly the assets it approved:
 *   node script/cloudinary/cleanupAccount.js --delete --report=logs/cleanup-dry-run-<ts>.json
 *
 * Options:
 *   --app-folders-only   only consider this application's upload folders
 *   --current-db-only    scan only the configured database (when listDatabases is not permitted)
 *
 * Safety:
 *   - deletion is limited to assets listed as deletable in the reviewed dry-run report
 *     AND still classified deletable now, AND unreferenced in a fresh scan right before delete
 *   - assets younger than MEDIA_ORPHAN_MIN_AGE_HOURS (>= 48h) and protected ids are never deleted
 *   - any scan error aborts before anything is deleted
 */
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const {
  connectDB,
  hasFlag,
  flagValue,
  requireCloudinary,
  listAppResources,
  writeReport,
  run,
} = require("./_common");
const { scanReferences, referenceCount, referenceLocation } = require("../../lib/media/referenceScanner");
const { isProtectedPublicId } = require("../../lib/media/protectedAssets");
const { classifyResources, sumBytes } = require("../../lib/media/duplicates");
const { evaluateAndDelete, acquireLock, releaseLock } = require("../../lib/media/cleanupService");
const { mediaConfig } = require("../../lib/media/config");

const SYSTEM_DATABASES = new Set(["admin", "local", "config"]);
const MB = 1024 * 1024;
const toMB = (bytes) => Math.round((bytes / MB) * 100) / 100;

const readStorage = async (cloudinary) => {
  const usage = await cloudinary.api.usage();
  return {
    plan: usage.plan,
    lastUpdated: usage.last_updated,
    storageMB: toMB(usage.storage?.usage || 0),
    resources: usage.resources,
    creditsUsedPercent: usage.credits?.used_percent ?? null,
  };
};

const listDatabases = async () => {
  if (hasFlag("current-db-only")) return [mongoose.connection.db.databaseName];
  const res = await mongoose.connection.db.admin().listDatabases();
  return res.databases.map((d) => d.name).filter((name) => !SYSTEM_DATABASES.has(name));
};

const describe = (r, extra = {}) => ({
  publicId: r.public_id,
  resourceType: r.resource_type,
  url: r.secure_url,
  bytes: r.bytes || 0,
  createdAt: r.created_at,
  etag: r.etag || "",
  ...extra,
});

/**
 * The list endpoint may omit `etag`. Only assets that share type, size and dimensions
 * can be identical, so details are fetched just for those (keeps Admin API usage low).
 * An asset whose etag cannot be read is simply never treated as a duplicate.
 */
const fillMissingEtags = async (cloudinary, resources) => {
  const buckets = new Map();
  for (const r of resources) {
    if (r.etag) continue;
    const key = `${r.resource_type}:${r.bytes}:${r.width || 0}x${r.height || 0}:${r.format}`;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(r);
  }
  const toFetch = [...buckets.values()].filter((list) => list.length > 1).flat();
  if (toFetch.length) console.log(`Fetching content fingerprints for ${toFetch.length} possible duplicates...`);
  for (const r of toFetch) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const detail = await cloudinary.api.resource(r.public_id, { resource_type: r.resource_type, type: "upload" });
      r.etag = detail.etag || "";
    } catch (err) {
      console.warn(`Could not read fingerprint of ${r.public_id}: ${err?.error?.message || err.message}`);
    }
  }
};

const main = async () => {
  const cloudinary = requireCloudinary();
  const mode = hasFlag("delete") ? "delete" : "dry-run";

  let storageBefore;
  try {
    storageBefore = await readStorage(cloudinary);
  } catch (err) {
    throw new Error(
      `Cloudinary Admin API unavailable (${err?.error?.message || err.message}). Nothing was changed.`
    );
  }

  let approved = null;
  if (mode === "delete") {
    const reportPath = flagValue("report");
    if (!reportPath) throw new Error("--delete requires --report=<reviewed dry-run report>");
    const reviewed = JSON.parse(fs.readFileSync(path.resolve(reportPath), "utf8"));
    if (reviewed.mode !== "dry-run") throw new Error("--report must be a dry-run report");
    approved = new Set(reviewed.deletable.map((d) => `${d.resourceType}:${d.publicId}`));
  }

  await connectDB();
  const databases = await listDatabases();

  const lockName = "media-account-cleanup";
  if (!(await acquireLock(lockName, 4 * 60 * 60 * 1000))) throw new Error("Another cleanup is running");

  try {
    const resources = [];
    for await (const r of listAppResources({ allFolders: !hasFlag("app-folders-only") })) resources.push(r);
    await fillMissingEtags(cloudinary, resources);
    console.log(`Listed ${resources.length} assets (${toMB(sumBytes(resources))} MB). Scanning databases: ${databases.join(", ")}`);

    const referenced = await scanReferences(resources.map((r) => r.public_id), { databases });
    const isReferenced = (r) => referenceCount(referenced, r.public_id) > 0 || isProtectedPublicId(r.public_id);
    const { active, duplicates, orphans, redundantReferenced, groups } = classifyResources(resources, isReferenced);

    if (resources.length && !active.length) {
      throw new Error("Reference scan matched no asset at all; refusing to continue. Nothing was changed.");
    }

    const minAgeMs = mediaConfig.orphanMinAgeHours * 3600 * 1000;
    const oldEnough = (r) => Date.now() - new Date(r.created_at).getTime() >= minAgeMs;
    const deletable = [
      ...duplicates.filter(oldEnough).map((r) => describe(r, { reason: "duplicate" })),
      ...orphans.filter(oldEnough).map((r) => describe(r, { reason: "orphan" })),
    ];
    const tooRecent = duplicates.length + orphans.length - deletable.length;

    const report = {
      mode,
      generatedAt: new Date().toISOString(),
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      databases,
      storageBefore,
      totals: {
        totalAssets: resources.length,
        totalMB: toMB(sumBytes(resources)),
        contentGroups: groups,
        activeAssets: active.length,
        duplicateAssets: duplicates.length,
        orphanAssets: orphans.length,
        skippedTooRecent: tooRecent,
        estimatedRecoveryMB: toMB(sumBytes(deletable)),
        redundantReferencedCopies: redundantReferenced.length,
        redundantReferencedMB: toMB(sumBytes(redundantReferenced)),
      },
      deletable,
      active: active.map((r) => describe(r, { where: referenceLocation(referenced, r.public_id) || "protected" })),
    };

    if (mode === "dry-run") {
      console.log("Dry run totals:", report.totals);
      console.log(`Report: ${writeReport("cleanup-dry-run", report)}`);
      console.log("Review the report, then re-run with --delete --report=<that file>.");
      return;
    }

    const finalCandidates = deletable
      .filter((d) => approved.has(`${d.resourceType}:${d.publicId}`))
      .map((d) => ({ publicId: d.publicId, resourceType: d.resourceType, url: d.url, bytes: d.bytes, reason: d.reason }));
    console.log(`${finalCandidates.length} assets approved in the dry-run report and still deletable. Re-verifying and deleting...`);

    const results = await evaluateAndDelete(finalCandidates, { mode: "delete", actor: "account-cleanup", databases });

    const deleted = results.filter((r) => r.outcome === "deleted");
    const summary = {};
    for (const r of results) summary[r.outcome] = (summary[r.outcome] || 0) + 1;

    let storageAfter = null;
    try {
      storageAfter = await readStorage(cloudinary);
    } catch (err) {
      storageAfter = { error: err?.error?.message || err.message };
    }

    report.result = {
      summary,
      deletedDuplicates: deleted.filter((r) => r.reason === "duplicate").length,
      deletedOrphans: deleted.filter((r) => r.reason === "orphan").length,
      recoveredMB: toMB(sumBytes(deleted)),
      storageAfter,
      note: "Cloudinary refreshes usage figures periodically; storageAfter may lag behind.",
      deleted,
      notDeleted: results.filter((r) => r.outcome !== "deleted"),
    };
    console.log("Cleanup result:", { ...report.result, deleted: undefined, notDeleted: undefined });
    console.log(`Deletion log: ${writeReport("cleanup-deleted", report)}`);
  } finally {
    await releaseLock(lockName);
  }
};

run(main);
