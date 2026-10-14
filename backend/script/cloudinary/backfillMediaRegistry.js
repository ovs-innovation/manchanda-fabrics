/**
 * Migration: records every existing Cloudinary asset of the app folders in `media_assets`.
 * Read-only towards Cloudinary; only inserts/updates metadata in MongoDB. Safe to re-run.
 *
 *   node script/cloudinary/backfillMediaRegistry.js
 *   node script/cloudinary/backfillMediaRegistry.js --all-folders
 */
const { connectDB, hasFlag, requireCloudinary, listAppResources, run } = require("./_common");
const MediaAsset = require("../../models/MediaAsset");

const HASH_SEGMENT_RE = /^[a-f0-9]{16,64}$/;

const main = async () => {
  requireCloudinary();
  await connectDB();

  let processed = 0;
  let inserted = 0;
  let ops = [];

  const flush = async () => {
    if (!ops.length) return;
    const res = await MediaAsset.bulkWrite(ops, { ordered: false });
    inserted += res.upsertedCount || res.nUpserted || 0;
    ops = [];
  };

  for await (const r of listAppResources({ allFolders: hasFlag("all-folders") })) {
    processed += 1;
    const lastSegment = r.public_id.split("/").pop();
    const folder = r.public_id.includes("/") ? r.public_id.slice(0, r.public_id.lastIndexOf("/")) : "";
    ops.push({
      updateOne: {
        filter: { publicId: r.public_id, resourceType: r.resource_type },
        update: {
          $set: {
            url: r.secure_url,
            folder,
            width: r.width || 0,
            height: r.height || 0,
            format: r.format || "",
            bytes: r.bytes || 0,
            version: r.version || 0,
            cloudinaryCreatedAt: r.created_at ? new Date(r.created_at) : undefined,
          },
          $setOnInsert: {
            status: "active",
            source: "backfill",
            hash: HASH_SEGMENT_RE.test(lastSegment) ? lastSegment : "",
          },
        },
        upsert: true,
      },
    });
    if (ops.length >= 500) await flush(); // eslint-disable-line no-await-in-loop
  }
  await flush();

  console.log(`Backfill done: ${processed} assets seen, ${inserted} new registry entries.`);
};

run(main);
