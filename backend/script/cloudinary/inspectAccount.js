/**
 * Read-only overview of the configured Cloudinary account and MongoDB cluster.
 *   node script/cloudinary/inspectAccount.js
 */
const mongoose = require("mongoose");
const { connectDB, requireCloudinary, RESOURCE_TYPES, listResources, run } = require("./_common");

const main = async () => {
  const cloudinary = requireCloudinary();
  console.log("Cloud name:", process.env.CLOUDINARY_CLOUD_NAME);

  const usage = await cloudinary.api.usage();
  console.log("Plan:", usage.plan, "last_updated:", usage.last_updated);
  for (const key of ["storage", "bandwidth", "transformations", "credits", "objects", "resources", "derived_resources"]) {
    if (usage[key] !== undefined) console.log(`  ${key}:`, JSON.stringify(usage[key]));
  }

  const folders = await cloudinary.api.root_folders().catch((e) => ({ error: e?.error?.message || e.message }));
  console.log("Root folders:", JSON.stringify(folders.folders ? folders.folders.map((f) => f.path) : folders));

  for (const type of RESOURCE_TYPES) {
    const byFolder = {};
    let count = 0;
    let bytes = 0;
    for await (const r of listResources(type)) {
      count += 1;
      bytes += r.bytes || 0;
      const top = r.public_id.includes("/") ? r.public_id.split("/")[0] : "(root)";
      byFolder[top] = byFolder[top] || { count: 0, mb: 0 };
      byFolder[top].count += 1;
      byFolder[top].mb += (r.bytes || 0) / 1024 / 1024;
    }
    for (const v of Object.values(byFolder)) v.mb = Math.round(v.mb * 100) / 100;
    console.log(`${type}: ${count} assets, ${(bytes / 1024 / 1024).toFixed(2)} MB`, JSON.stringify(byFolder));
  }

  await connectDB();
  console.log("Current database:", mongoose.connection.db.databaseName);
  try {
    const dbs = await mongoose.connection.db.admin().listDatabases();
    console.log("Databases:", dbs.databases.map((d) => d.name).join(", "));
  } catch (e) {
    console.log("listDatabases not permitted:", e.message);
  }
};

run(main);
