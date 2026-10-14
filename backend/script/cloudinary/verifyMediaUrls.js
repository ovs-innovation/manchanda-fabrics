/**
 * Read-only health check of every Cloudinary URL stored in MongoDB (all collections)
 * and in the source code. Sends a HEAD request per distinct URL and reports failures
 * grouped by cloud and collection.
 *
 *   node script/cloudinary/verifyMediaUrls.js
 *   node script/cloudinary/verifyMediaUrls.js --compare=logs/verify-urls-<ts>.json
 *     (lists URLs that worked in the earlier report but fail now)
 */
const fs = require("fs");
const path = require("path");
const https = require("https");
const mongoose = require("mongoose");
const { connectDB, flagValue, writeReport, run } = require("./_common");
const { collectCloudinaryUrls, parseCloudinaryUrl, walkStrings, extractCloudinaryUrls } = require("../../lib/media/urls");
const { getSourceTexts } = require("../../lib/media/protectedAssets");

const CONCURRENCY = 8;
const MEDIA_COLLECTIONS = new Set(["media_assets", "media_cleanup_jobs", "media_audit_logs", "media_locks"]);

const head = (url, attempt = 0) =>
  new Promise((resolve) => {
    const target = url.startsWith("//") ? `https:${url}` : url.replace(/^http:/, "https:");
    const req = https.request(target, { method: "HEAD", timeout: 20000 }, (res) => {
      res.resume();
      resolve({ status: res.statusCode, error: res.headers["x-cld-error"] || "" });
    });
    req.on("timeout", () => req.destroy(new Error("timeout")));
    req.on("error", (err) => resolve({ status: 0, error: err.message }));
    req.end();
  }).then((r) => (r.status === 0 && attempt < 2 ? head(url, attempt + 1) : r));

const main = async () => {
  await connectDB();
  const db = mongoose.connection.db;
  const urlSources = new Map();
  const addUrl = (url, where) => {
    if (!urlSources.has(url)) urlSources.set(url, new Set());
    urlSources.get(url).add(where);
  };

  const collections = await db.listCollections({}, { nameOnly: true }).toArray();
  for (const { name } of collections) {
    if (MEDIA_COLLECTIONS.has(name) || name.startsWith("system.")) continue;
    const cursor = db.collection(name).find({}, { batchSize: 500 });
    try {
      // eslint-disable-next-line no-await-in-loop
      while (await cursor.hasNext()) {
        // eslint-disable-next-line no-await-in-loop
        for (const url of collectCloudinaryUrls(await cursor.next())) addUrl(url, `db:${name}`);
      }
    } finally {
      // eslint-disable-next-line no-await-in-loop
      await cursor.close().catch(() => {});
    }
  }
  for (const text of getSourceTexts()) {
    walkStrings(text, (s) => extractCloudinaryUrls(s).forEach((u) => addUrl(u, "source")));
  }

  const urls = [...urlSources.keys()].filter((u) => parseCloudinaryUrl(u));
  console.log(`Checking ${urls.length} distinct Cloudinary URLs...`);

  const results = [];
  let index = 0;
  const worker = async () => {
    while (index < urls.length) {
      const url = urls[index];
      index += 1;
      // eslint-disable-next-line no-await-in-loop
      const r = await head(url);
      results.push({ url, cloud: parseCloudinaryUrl(url).cloudName, status: r.status, error: r.error, where: [...urlSources.get(url)] });
    }
  };
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  const summary = {};
  for (const r of results) {
    const key = `${r.cloud} ${r.status >= 200 && r.status < 400 ? "ok" : `fail:${r.status}`}`;
    summary[key] = (summary[key] || 0) + 1;
  }
  const failures = results.filter((r) => !(r.status >= 200 && r.status < 400));
  const failuresByCollection = {};
  for (const f of failures) for (const w of f.where) failuresByCollection[w] = (failuresByCollection[w] || 0) + 1;

  const report = { generatedAt: new Date().toISOString(), total: results.length, summary, failuresByCollection, failures, ok: results.filter((r) => !failures.includes(r)).map((r) => r.url) };

  const comparePath = flagValue("compare");
  if (comparePath) {
    const before = JSON.parse(fs.readFileSync(path.resolve(comparePath), "utf8"));
    const okBefore = new Set(before.ok || []);
    report.regressions = failures.filter((f) => okBefore.has(f.url));
    console.log(`Regressions vs ${comparePath}: ${report.regressions.length}`);
  }

  console.log("Summary:", summary);
  console.log("Failures by collection:", failuresByCollection);
  console.log(`Report: ${writeReport("verify-urls", report)}`);
};

run(main);
