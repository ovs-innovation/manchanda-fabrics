/**
 * Prints Cloudinary plan usage plus registry and cleanup-queue statistics.
 *   node script/cloudinary/usageReport.js
 */
const { connectDB, requireCloudinary, writeReport, run } = require("./_common");
const { checkUsage } = require("../../lib/media/usageMonitor");
const MediaAsset = require("../../models/MediaAsset");
const MediaCleanupJob = require("../../models/MediaCleanupJob");

const countBy = async (Model, field) => {
  const rows = await Model.aggregate([{ $group: { _id: `$${field}`, count: { $sum: 1 } } }]);
  return Object.fromEntries(rows.map((r) => [r._id || "unknown", r.count]));
};

const main = async () => {
  requireCloudinary();
  await connectDB();

  const usage = await checkUsage();
  const registry = await countBy(MediaAsset, "status");
  const queue = await countBy(MediaCleanupJob, "status");

  const report = { generatedAt: new Date().toISOString(), usage, registry, queue };
  console.log(JSON.stringify(report, null, 2));
  console.log(`Report: ${writeReport("cloudinary-usage", report)}`);
};

run(main);
