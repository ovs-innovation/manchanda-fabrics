/**
 * Copies every Cloudinary asset referenced in MongoDB from old cloud(s) into the
 * currently configured Cloudinary account (CLOUDINARY_* in backend/.env) and
 * rewrites the URLs in MongoDB once each copy is verified.
 *
 *   node script/cloudinary/migrateToNewCloud.js --from=<old-cloud>[,<old-cloud-2>]
 *       Phase 1 (default): copy + verify only. Nothing in MongoDB changes.
 *       Re-runnable: already verified assets are skipped.
 *   node script/cloudinary/migrateToNewCloud.js --from=<old-cloud> --rewrite
 *       Phase 2: copy anything still missing, then rewrite URLs of VERIFIED assets only.
 *   node script/cloudinary/migrateToNewCloud.js --rollback
 *       Puts the old URLs back for everything rewritten (uses the saved map).
 *
 * Guarantees:
 *   - Assets keep their public_id, so URL paths and transformations stay identical;
 *     only the cloud name and version segment change.
 *   - A URL is rewritten only after its copy loaded with HTTP 200 and the same byte size.
 *   - Unreachable sources (e.g. a disabled cloud) are skipped and reported; their URLs stay as they are.
 *   - Only URL strings are modified; ids, relations and all other fields are untouched.
 *   - Every modified document is saved to logs/ before it is changed.
 */
const fs = require("fs");
const path = require("path");
const https = require("https");
const mongoose = require("mongoose");
const { connectDB, hasFlag, flagValue, requireCloudinary, writeReport, run } = require("./_common");
const { extractCloudinaryUrls, parseCloudinaryUrl } = require("../../lib/media/urls");
const { getSourceTexts } = require("../../lib/media/protectedAssets");

const MAP_FILE = path.join(__dirname, "..", "..", "logs", "cloud-migration-map.json");
const MEDIA_COLLECTIONS = new Set(["media_assets", "media_cleanup_jobs", "media_audit_logs", "media_locks"]);
const CONCURRENCY = 4;

const loadMap = () => (fs.existsSync(MAP_FILE) ? JSON.parse(fs.readFileSync(MAP_FILE, "utf8")) : { assets: {} });
const saveMap = (map) => {
  fs.mkdirSync(path.dirname(MAP_FILE), { recursive: true });
  fs.writeFileSync(MAP_FILE, JSON.stringify(map, null, 2));
};

const assetKey = (cloud, resourceType, publicId) => `${cloud}|${resourceType}|${publicId}`;

const probe = (url, attempt = 0) =>
  new Promise((resolve) => {
    const req = https.request(url, { method: "HEAD", timeout: 30000 }, (res) => {
      res.resume();
      resolve({ status: res.statusCode, bytes: Number(res.headers["content-length"] || 0), error: res.headers["x-cld-error"] || "" });
    });
    req.on("timeout", () => req.destroy(new Error("timeout")));
    req.on("error", (err) => resolve({ status: 0, bytes: 0, error: err.message }));
    req.end();
  }).then((r) => (r.status === 0 && attempt < 2 ? probe(url, attempt + 1) : r));

/** Original (untransformed) delivery URL of an asset. */
const originalUrl = (cloud, resourceType, publicId, version, format) => {
  const ext = resourceType === "raw" || !format ? "" : `.${format}`;
  const v = version ? `v${version}/` : "";
  return `https://res.cloudinary.com/${cloud}/${resourceType}/upload/${v}${encodeURI(publicId)}${ext}`;
};

const isPlainWalkable = (v) =>
  v && typeof v === "object" && !v._bsontype && !(v instanceof Date) && !Buffer.isBuffer(v);

/** Replaces strings inside `value` in place. Returns true when anything changed. */
const replaceStrings = (value, replace) => {
  let changed = false;
  const visit = (node) => {
    if (Array.isArray(node)) {
      node.forEach((item, i) => {
        if (typeof item === "string") {
          const next = replace(item);
          if (next !== item) {
            node[i] = next;
            changed = true;
          }
        } else if (isPlainWalkable(item)) visit(item);
      });
      return;
    }
    for (const key of Object.keys(node)) {
      const item = node[key];
      if (typeof item === "string") {
        const next = replace(item);
        if (next !== item) {
          node[key] = next;
          changed = true;
        }
      } else if (isPlainWalkable(item)) visit(item);
    }
  };
  if (isPlainWalkable(value)) visit(value);
  return changed;
};

const forEachDocument = async (db, visit) => {
  const collections = await db.listCollections({}, { nameOnly: true }).toArray();
  for (const { name } of collections) {
    if (MEDIA_COLLECTIONS.has(name) || name.startsWith("system.")) continue;
    const cursor = db.collection(name).find({}, { batchSize: 200 });
    try {
      // eslint-disable-next-line no-await-in-loop
      while (await cursor.hasNext()) {
        // eslint-disable-next-line no-await-in-loop
        await visit(name, await cursor.next());
      }
    } finally {
      // eslint-disable-next-line no-await-in-loop
      await cursor.close().catch(() => {});
    }
  }
};

/** Rewrites every document whose strings change under `replace`. Backs documents up first. */
const rewriteDatabase = async (db, replace, label) => {
  const backup = [];
  const updates = [];
  await forEachDocument(db, async (collection, doc) => {
    const original = JSON.parse(JSON.stringify(doc));
    const changedFields = {};
    for (const field of Object.keys(doc)) {
      if (field === "_id") continue;
      const holder = { value: doc[field] };
      if (replaceStrings(holder, replace)) changedFields[field] = holder.value;
    }
    if (Object.keys(changedFields).length) {
      backup.push({ collection, _id: String(doc._id), before: original });
      updates.push({ collection, _id: doc._id, set: changedFields });
    }
  });

  const backupFile = writeReport(`cloud-migration-${label}-backup`, backup);
  console.log(`Backed up ${backup.length} documents to ${backupFile}`);

  let modified = 0;
  for (const u of updates) {
    // eslint-disable-next-line no-await-in-loop
    const res = await db.collection(u.collection).updateOne({ _id: u._id }, { $set: u.set });
    modified += res.modifiedCount || 0;
  }
  return { documents: updates.length, modified, backupFile };
};

const collectReferencedAssets = async (db, fromClouds) => {
  const assets = new Map();
  const add = (url, where) => {
    const p = parseCloudinaryUrl(url);
    if (!p || !fromClouds.includes(p.cloudName) || p.deliveryType !== "upload") return;
    if (!p.publicId) {
      assets.set(`ambiguous|${url}`, { ambiguous: true, url, where: new Set([where]) });
      return;
    }
    const key = assetKey(p.cloudName, p.resourceType, p.publicId);
    if (!assets.has(key)) {
      const version = (p.path.split("/").find((s) => /^v\d+$/.test(s)) || "").slice(1);
      assets.set(key, {
        key,
        cloud: p.cloudName,
        resourceType: p.resourceType,
        publicId: p.publicId,
        version,
        format: p.format,
        where: new Set(),
      });
    }
    const a = assets.get(key);
    a.where.add(where);
    if (!a.version) a.version = (p.path.split("/").find((s) => /^v\d+$/.test(s)) || "").slice(1);
    if (!a.format) a.format = p.format;
  };

  await forEachDocument(db, async (collection, doc) => {
    const stack = [doc];
    while (stack.length) {
      const node = stack.pop();
      if (typeof node === "string") {
        if (node.includes("res.cloudinary.com")) extractCloudinaryUrls(node).forEach((u) => add(u, `db:${collection}`));
      } else if (Array.isArray(node)) stack.push(...node);
      else if (isPlainWalkable(node)) stack.push(...Object.values(node));
    }
  });
  for (const text of getSourceTexts()) extractCloudinaryUrls(text).forEach((u) => add(u, "source"));
  return assets;
};

const copyAsset = async (cloudinary, targetCloud, asset) => {
  const source = originalUrl(asset.cloud, asset.resourceType, asset.publicId, asset.version, asset.format);
  const sourceProbe = await probe(source);
  if (sourceProbe.status !== 200) {
    return { status: "source_unavailable", source, error: `HTTP ${sourceProbe.status} ${sourceProbe.error}`.trim() };
  }

  let uploaded;
  try {
    uploaded = await cloudinary.uploader.upload(source, {
      public_id: asset.publicId,
      resource_type: asset.resourceType,
      type: "upload",
      overwrite: false,
      unique_filename: false,
      use_filename: false,
    });
  } catch (err) {
    return { status: "copy_failed", source, error: err?.error?.message || err.message };
  }

  const target = originalUrl(targetCloud, asset.resourceType, uploaded.public_id, uploaded.version, uploaded.format || asset.format);
  const targetProbe = await probe(target);
  const sizeMatches = !sourceProbe.bytes || !targetProbe.bytes || sourceProbe.bytes === targetProbe.bytes;
  if (targetProbe.status !== 200 || !sizeMatches) {
    return {
      status: "verify_failed",
      source,
      target,
      error: `target HTTP ${targetProbe.status}, bytes ${targetProbe.bytes} vs ${sourceProbe.bytes}`,
    };
  }
  return {
    status: "verified",
    source,
    target,
    newVersion: String(uploaded.version),
    bytes: targetProbe.bytes || uploaded.bytes || 0,
    existing: Boolean(uploaded.existing),
  };
};

const main = async () => {
  const cloudinary = requireCloudinary();
  const targetCloud = process.env.CLOUDINARY_CLOUD_NAME;
  await connectDB();
  const db = mongoose.connection.db;
  const map = loadMap();

  if (hasFlag("rollback")) {
    const reverse = new Map();
    for (const a of Object.values(map.assets)) {
      if (a.rewritten) reverse.set(`${a.targetCloud}|${a.resourceType}|${a.publicId}`, a);
    }
    const replace = (text) => {
      if (!text.includes("res.cloudinary.com")) return text;
      let out = text;
      for (const url of extractCloudinaryUrls(text)) {
        const p = parseCloudinaryUrl(url);
        const a = p && p.publicId && reverse.get(`${p.cloudName}|${p.resourceType}|${p.publicId}`);
        if (!a) continue;
        const restored = url
          .replace(`res.cloudinary.com/${a.targetCloud}/`, `res.cloudinary.com/${a.cloud}/`)
          .replace(`/v${a.newVersion}/`, a.version ? `/v${a.version}/` : "/");
        out = out.split(url).join(restored);
      }
      return out;
    };
    const result = await rewriteDatabase(db, replace, "rollback");
    for (const a of reverse.values()) a.rewritten = false;
    saveMap(map);
    console.log("Rollback done:", result);
    return;
  }

  const fromClouds = String(flagValue("from", "")).split(",").map((s) => s.trim()).filter(Boolean);
  if (!fromClouds.length) throw new Error("Pass --from=<old cloud name>[,<another>]");
  if (fromClouds.includes(targetCloud)) throw new Error("Source and target cloud must differ");

  const assets = await collectReferencedAssets(db, fromClouds);
  const list = [...assets.values()];
  const ambiguous = list.filter((a) => a.ambiguous);
  const todo = list.filter((a) => !a.ambiguous && map.assets[a.key]?.status !== "verified");
  console.log(`Referenced assets on ${fromClouds.join(", ")}: ${list.length - ambiguous.length} (+${ambiguous.length} ambiguous URLs). To copy: ${todo.length}. Target: ${targetCloud}`);

  let index = 0;
  let done = 0;
  const worker = async () => {
    while (index < todo.length) {
      const asset = todo[index];
      index += 1;
      // eslint-disable-next-line no-await-in-loop
      const result = await copyAsset(cloudinary, targetCloud, asset);
      map.assets[asset.key] = {
        ...map.assets[asset.key],
        cloud: asset.cloud,
        resourceType: asset.resourceType,
        publicId: asset.publicId,
        version: asset.version,
        targetCloud,
        where: [...asset.where],
        ...result,
        checkedAt: new Date().toISOString(),
      };
      done += 1;
      if (done % 25 === 0) {
        saveMap(map);
        console.log(`  ${done}/${todo.length}`);
      }
    }
  };
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  saveMap(map);

  const summary = {};
  for (const a of list) {
    if (a.ambiguous) continue;
    const s = map.assets[a.key]?.status || "pending";
    summary[s] = (summary[s] || 0) + 1;
  }
  console.log("Copy status:", summary);

  let rewrite = null;
  if (hasFlag("rewrite")) {
    const verified = new Map();
    for (const a of Object.values(map.assets)) {
      if (a.status === "verified" && a.targetCloud === targetCloud) {
        verified.set(assetKey(a.cloud, a.resourceType, a.publicId), a);
      }
    }
    const replace = (text) => {
      if (!text.includes("res.cloudinary.com")) return text;
      let out = text;
      for (const url of extractCloudinaryUrls(text)) {
        const p = parseCloudinaryUrl(url);
        const a = p && p.publicId && verified.get(assetKey(p.cloudName, p.resourceType, p.publicId));
        if (!a) continue;
        let next = url.replace(`res.cloudinary.com/${a.cloud}/`, `res.cloudinary.com/${a.targetCloud}/`);
        next = a.version ? next.replace(`/v${a.version}/`, `/v${a.newVersion}/`) : next;
        out = out.split(url).join(next);
      }
      return out;
    };
    rewrite = await rewriteDatabase(db, replace, "rewrite");
    for (const a of verified.values()) a.rewritten = true;
    saveMap(map);
    console.log("MongoDB rewrite:", rewrite);
  }

  const sourceRefs = list.filter((a) => !a.ambiguous && a.where.has("source")).map((a) => a.publicId);
  const report = {
    generatedAt: new Date().toISOString(),
    fromClouds,
    targetCloud,
    referencedAssets: list.length - ambiguous.length,
    summary,
    rewrite,
    hardcodedInSource: sourceRefs,
    ambiguous: ambiguous.map((a) => ({ url: a.url, where: [...a.where] })),
    failures: Object.values(map.assets).filter((a) => a.status !== "verified"),
  };
  console.log(`Report: ${writeReport("cloud-migration", report)}`);
};

run(main);
