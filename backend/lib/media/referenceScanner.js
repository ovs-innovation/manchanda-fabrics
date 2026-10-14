const mongoose = require("mongoose");
const { extractCloudinaryUrls, referenceKeysForUrl, stripExtension, walkStrings } = require("./urls");
const { getSourceTexts } = require("./protectedAssets");

const MEDIA_COLLECTIONS = new Set(["media_assets", "media_cleanup_jobs", "media_audit_logs", "media_locks"]);

/**
 * Determines which candidate public_ids are referenced anywhere: every MongoDB
 * collection (products, variants, categories, brands, settings/homepage,
 * banners, reels, customers, orders, ...) plus application source code.
 *
 * Fails closed: any scan error throws, and callers must then keep every
 * candidate.
 */
const scanReferences = async (candidatePublicIds, { databases } = {}) => {
  const candidates = new Set(candidatePublicIds);
  const referenced = new Map();
  if (!candidates.size) return referenced;

  if (mongoose.connection.readyState !== 1) {
    throw new Error("MongoDB is not connected; refusing to evaluate media references");
  }

  const mark = (publicId, where) => {
    referenced.set(publicId, (referenced.get(publicId) || 0) + 1);
    if (!referenced.has(`${publicId}::where`)) referenced.set(`${publicId}::where`, where);
  };

  const checkString = (where) => (str) => {
    if (str.includes("res.cloudinary.com")) {
      for (const url of extractCloudinaryUrls(str)) {
        for (const key of referenceKeysForUrl(url)) {
          if (candidates.has(key)) mark(key, where);
        }
      }
      return;
    }
    if (str.length > 512) return;
    const trimmed = str.trim();
    if (candidates.has(trimmed)) mark(trimmed, where);
    const noExt = stripExtension(trimmed);
    if (noExt !== trimmed && candidates.has(noExt)) mark(noExt, where);
  };

  const currentDb = mongoose.connection.db;
  const dbs = databases && databases.length
    ? databases.map((name) => (name === currentDb.databaseName ? currentDb : mongoose.connection.client.db(name)))
    : [currentDb];

  for (const db of dbs) {
    const prefix = db === currentDb ? "db" : `db(${db.databaseName})`;
    // eslint-disable-next-line no-await-in-loop
    const collections = await db.listCollections({}, { nameOnly: true }).toArray();
    for (const { name } of collections) {
      if (MEDIA_COLLECTIONS.has(name) || name.startsWith("system.")) continue;
      const cursor = db.collection(name).find({}, { batchSize: 500 });
      const visit = checkString(`${prefix}:${name}`);
      try {
        // eslint-disable-next-line no-await-in-loop
        while (await cursor.hasNext()) {
          // eslint-disable-next-line no-await-in-loop
          walkStrings(await cursor.next(), visit);
        }
      } finally {
        // eslint-disable-next-line no-await-in-loop
        await cursor.close().catch(() => {});
      }
    }
  }

  const sourceVisit = checkString("source");
  for (const text of getSourceTexts()) sourceVisit(text);

  return referenced;
};

const referenceCount = (referenced, publicId) => referenced.get(publicId) || 0;
const referenceLocation = (referenced, publicId) => referenced.get(`${publicId}::where`) || "";

module.exports = {
  scanReferences,
  referenceCount,
  referenceLocation,
};
