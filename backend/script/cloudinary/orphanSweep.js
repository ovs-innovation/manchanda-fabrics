/**
 * Finds Cloudinary assets that nothing references any more and (optionally) deletes them.
 *
 *   node script/cloudinary/orphanSweep.js                 # dry run (default), writes a report
 *   node script/cloudinary/orphanSweep.js --delete        # really delete verified orphans
 *   node script/cloudinary/orphanSweep.js --all-folders   # include folders outside the app's own
 *   node script/cloudinary/orphanSweep.js --limit=500     # cap the number of deletions
 *
 * An asset is deleted only when ALL of these hold:
 *   - it lives in one of the app's upload folders (unless --all-folders)
 *   - it is older than MEDIA_ORPHAN_MIN_AGE_HOURS (minimum 48h)
 *   - it is not in the protected list / MEDIA_PROTECTED_PREFIXES
 *   - no upload was signed for it within MEDIA_RECENT_REQUEST_GRACE_HOURS
 *   - its public id appears nowhere in the database (every collection) or the source code
 * If the reference scan fails, nothing is deleted.
 */
const {
  connectDB,
  hasFlag,
  flagValue,
  requireCloudinary,
  listAppResources,
  writeReport,
  run,
} = require("./_common");
const { evaluateAndDelete, acquireLock, releaseLock } = require("../../lib/media/cleanupService");
const { mediaConfig } = require("../../lib/media/config");

const main = async () => {
  requireCloudinary();
  await connectDB();

  const mode = hasFlag("delete") ? "delete" : "dry-run";
  const allFolders = hasFlag("all-folders");
  const limit = Number(flagValue("limit", "0")) || Infinity;
  const minAgeHours = mediaConfig.orphanMinAgeHours;
  const cutoff = Date.now() - minAgeHours * 3600 * 1000;

  const lockName = "media-orphan-sweep";
  if (!(await acquireLock(lockName, 2 * 60 * 60 * 1000))) {
    throw new Error("Another orphan sweep is running");
  }

  try {
    console.log(`Orphan sweep: mode=${mode}, minAge=${minAgeHours}h, allFolders=${allFolders}`);

    let total = 0;
    let tooYoung = 0;
    const candidates = [];
    for await (const resource of listAppResources({ allFolders })) {
      total += 1;
      if (new Date(resource.created_at).getTime() > cutoff) {
        tooYoung += 1;
        continue;
      }
      candidates.push({
        publicId: resource.public_id,
        resourceType: resource.resource_type,
        url: resource.secure_url,
        bytes: resource.bytes || 0,
        createdAt: resource.created_at,
      });
    }
    console.log(`Listed ${total} assets, ${candidates.length} old enough to evaluate, ${tooYoung} too recent.`);

    const results = candidates.length
      ? await evaluateAndDelete(candidates.slice(0, mode === "delete" ? limit : candidates.length), {
          mode,
          actor: "orphan-sweep",
        })
      : [];

    const summary = {};
    let reclaimableBytes = 0;
    for (const r of results) {
      summary[r.outcome] = (summary[r.outcome] || 0) + 1;
      if (r.outcome === "dry_run" || r.outcome === "deleted") reclaimableBytes += r.bytes || 0;
    }

    const file = writeReport(`orphan-sweep-${mode}`, {
      mode,
      allFolders,
      minAgeHours,
      listed: total,
      tooYoung,
      evaluated: results.length,
      summary,
      reclaimableMB: Math.round((reclaimableBytes / 1024 / 1024) * 100) / 100,
      results,
    });

    console.log("Summary:", summary);
    console.log(`${mode === "delete" ? "Freed" : "Would free"} ~${(reclaimableBytes / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Report: ${file}`);
  } finally {
    await releaseLock(lockName);
  }
};

run(main);
