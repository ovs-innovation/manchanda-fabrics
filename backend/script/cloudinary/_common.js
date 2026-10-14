const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const { connectDB } = require("../../config/db");
const { getCloudinary, isCloudinaryConfigured } = require("../../lib/media/config");
const { ADMIN_FOLDERS, CUSTOMER_FOLDER } = require("../../lib/media/uploadPolicy");

const RESOURCE_TYPES = ["image", "video", "raw"];

const args = process.argv.slice(2);
const hasFlag = (name) => args.includes(`--${name}`);
const flagValue = (name, fallback) => {
  const prefix = `--${name}=`;
  const hit = args.find((a) => a.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : fallback;
};

/** Folders this application owns. Everything else in the account is never touched by default. */
const appFolders = () => [...ADMIN_FOLDERS, CUSTOMER_FOLDER];

const requireCloudinary = () => {
  if (!isCloudinaryConfigured()) {
    console.error("Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET first.");
    process.exit(1);
  }
  return getCloudinary();
};

/** Async generator over every `upload` resource of a type, optionally limited to a prefix. */
async function* listResources(resourceType, prefix) {
  const cloudinary = getCloudinary();
  let nextCursor;
  do {
    const options = { resource_type: resourceType, type: "upload", max_results: 500 };
    if (prefix) options.prefix = prefix;
    if (nextCursor) options.next_cursor = nextCursor;
    // eslint-disable-next-line no-await-in-loop
    const page = await cloudinary.api.resources(options);
    for (const resource of page.resources || []) yield resource;
    nextCursor = page.next_cursor;
  } while (nextCursor);
}

/**
 * Resources inside the app folders (or the whole account with --all-folders).
 * De-duplicated because folders like `product` and `product/videos` overlap.
 */
async function* listAppResources({ allFolders = false } = {}) {
  const seen = new Set();
  const prefixes = allFolders ? [undefined] : appFolders().map((f) => `${f}/`);
  for (const resourceType of RESOURCE_TYPES) {
    for (const prefix of prefixes) {
      for await (const resource of listResources(resourceType, prefix)) {
        const key = `${resourceType}:${resource.public_id}`;
        if (seen.has(key)) continue;
        seen.add(key);
        yield resource;
      }
    }
  }
}

const writeReport = (name, data) => {
  const dir = path.join(__dirname, "..", "..", "logs");
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${name}-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
  return file;
};

const run = (main) => {
  main()
    .then(() => mongoose.disconnect().catch(() => {}))
    .then(() => process.exit(0))
    .catch(async (err) => {
      console.error("Failed:", err?.error?.message || err.message);
      await mongoose.disconnect().catch(() => {});
      process.exit(1);
    });
};

module.exports = {
  RESOURCE_TYPES,
  connectDB,
  hasFlag,
  flagValue,
  appFolders,
  requireCloudinary,
  listResources,
  listAppResources,
  writeReport,
  run,
};
