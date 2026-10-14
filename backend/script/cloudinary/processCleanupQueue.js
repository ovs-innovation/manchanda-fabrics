/**
 * Runs the reference-checked cleanup queue once (same logic as the background worker).
 * Behaviour follows MEDIA_CLEANUP_MODE (off | dry-run | delete; default dry-run).
 *   node script/cloudinary/processCleanupQueue.js
 */
const { connectDB, requireCloudinary, run } = require("./_common");
const { processQueue } = require("../../lib/media/cleanupService");

const main = async () => {
  requireCloudinary();
  await connectDB();
  let total = 0;
  for (;;) {
    // eslint-disable-next-line no-await-in-loop
    const result = await processQueue({ limit: 200 });
    console.log(JSON.stringify(result));
    if (!result.processed || result.error) break;
    total += result.processed;
  }
  console.log(`Processed ${total} cleanup jobs.`);
};

run(main);
