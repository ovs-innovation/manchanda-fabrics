const test = require("node:test");
const assert = require("node:assert/strict");

process.env.CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || "testcloud";

const {
  extractCloudinaryUrls,
  parseCloudinaryUrl,
  referenceKeysForUrl,
  collectCloudinaryUrls,
} = require("../lib/media/urls");
const { resolveUploadPolicy, resolveAdminFolder } = require("../lib/media/uploadPolicy");
const { isProtectedPublicId } = require("../lib/media/protectedAssets");
const { toCandidates, snapshotMedia } = require("../lib/media/cleanupService");

const HASH = "a".repeat(64);
const CLOUD = process.env.CLOUDINARY_CLOUD_NAME;

test("extracts URLs from free text, html and json", () => {
  const text = `<img src="https://res.cloudinary.com/x/image/upload/v1/product/a.jpg"> and
    url(//res.cloudinary.com/x/video/upload/v2/reel.mp4), "https://res.cloudinary.com/x/image/upload/b.png&amp;"`;
  const urls = extractCloudinaryUrls(text);
  assert.equal(urls.length, 3);
  assert.ok(urls.includes("https://res.cloudinary.com/x/image/upload/v1/product/a.jpg"));
  assert.ok(urls.includes("//res.cloudinary.com/x/video/upload/v2/reel.mp4"));
  assert.deepEqual(extractCloudinaryUrls("no media here"), []);
});

test("parses versioned URLs with transformations", () => {
  const p = parseCloudinaryUrl("https://res.cloudinary.com/x/image/upload/f_auto,q_auto/w_400/v123/product/abc.webp");
  assert.equal(p.publicId, "product/abc");
  assert.equal(p.resourceType, "image");
  assert.equal(p.format, "webp");
  assert.equal(p.ambiguous, false);
});

test("parses unversioned URLs and refuses ambiguous ones", () => {
  assert.equal(parseCloudinaryUrl("https://res.cloudinary.com/x/image/upload/product/abc.jpg").publicId, "product/abc");
  assert.equal(
    parseCloudinaryUrl("https://res.cloudinary.com/x/image/upload/f_auto,q_auto/product/abc.jpg").publicId,
    "product/abc"
  );
  const ambiguous = parseCloudinaryUrl("https://res.cloudinary.com/x/image/upload/w_400/product/abc.jpg");
  assert.equal(ambiguous.publicId, null);
  assert.equal(ambiguous.ambiguous, true);
});

test("keeps extension for raw files and decodes segments", () => {
  assert.equal(parseCloudinaryUrl("https://res.cloudinary.com/x/raw/upload/v1/docs/file.csv").publicId, "docs/file.csv");
  assert.equal(
    parseCloudinaryUrl("https://res.cloudinary.com/x/image/upload/v1/my%20folder/a%20b.png").publicId,
    "my folder/a b"
  );
  assert.equal(parseCloudinaryUrl("https://example.com/a.jpg"), null);
});

test("reference keys always contain the real public id", () => {
  const keys = referenceKeysForUrl("https://res.cloudinary.com/x/image/upload/w_400/v9/product/abc.jpg");
  assert.ok(keys.includes("product/abc"));
  assert.ok(keys.includes("product/abc.jpg"));
  assert.ok(keys.includes("abc"));
  const ambiguousKeys = referenceKeysForUrl("https://res.cloudinary.com/x/image/upload/w_400/product/abc.jpg");
  assert.ok(ambiguousKeys.includes("product/abc"));
});

test("collects URLs from nested documents without crashing on cycles", () => {
  const doc = {
    image: ["https://res.cloudinary.com/x/image/upload/v1/a.jpg"],
    variants: [{ media: { url: "https://res.cloudinary.com/x/image/upload/v1/b.jpg" } }],
    when: new Date(),
    buf: Buffer.from("https://res.cloudinary.com/x/image/upload/v1/ignored.jpg"),
  };
  doc.self = doc;
  const urls = collectCloudinaryUrls(doc);
  assert.equal(urls.length, 2);
  assert.deepEqual(snapshotMedia(null), []);
});

test("cleanup candidates only include this cloud and unambiguous upload assets", () => {
  const candidates = toCandidates([
    `https://res.cloudinary.com/${CLOUD}/image/upload/v1/product/a.jpg`,
    `https://res.cloudinary.com/${CLOUD}/image/upload/v1/product/a.jpg`,
    `https://res.cloudinary.com/${CLOUD}/image/upload/w_400/product/b.jpg`,
    `https://res.cloudinary.com/${CLOUD}/image/private/v1/product/c.jpg`,
    "https://res.cloudinary.com/othercloud/image/upload/v1/product/d.jpg",
    `https://res.cloudinary.com/${CLOUD}/video/upload/v1/reels/e.mp4`,
  ]);
  assert.deepEqual(
    candidates.map((c) => `${c.resourceType}:${c.publicId}`),
    ["image:product/a", "video:reels/e"]
  );
});

test("protected assets are never candidates for deletion", () => {
  assert.equal(isProtectedPublicId("brand/manchanda_logo"), true);
  assert.equal(isProtectedPublicId("product/some_random_id"), false);
});

test("upload policy: admin folders, size and mime limits", () => {
  const ok = resolveUploadPolicy({ isAdmin: true, kind: "image", folder: "product", hash: HASH, mime: "image/png", bytes: 1000 });
  assert.equal(ok.publicId, `product/${HASH.slice(0, 40)}`);
  assert.equal(ok.resourceType, "image");

  assert.equal(resolveAdminFolder("../../etc"), "manchanda");
  assert.equal(resolveUploadPolicy({ isAdmin: true, kind: "image", folder: "x", hash: HASH }).folder, "manchanda");

  assert.ok(resolveUploadPolicy({ isAdmin: true, kind: "image", hash: "nothex" }).error);
  assert.ok(resolveUploadPolicy({ isAdmin: true, kind: "image", hash: HASH, mime: "text/html" }).error);
  assert.ok(resolveUploadPolicy({ isAdmin: true, kind: "image", hash: HASH, bytes: 16 * 1024 * 1024 }).error);
  assert.ok(resolveUploadPolicy({ isAdmin: true, kind: "exe", hash: HASH }).error);

  const video = resolveUploadPolicy({ isAdmin: true, kind: "video", folder: "homepage-reels", hash: HASH, mime: "video/mp4", bytes: 50 * 1024 * 1024 });
  assert.equal(video.resourceType, "video");
});

test("upload policy: customers are pinned to their folder and images only", () => {
  const customer = resolveUploadPolicy({ isAdmin: false, kind: "image", folder: "product", hash: HASH, mime: "image/jpeg", bytes: 1000 });
  assert.equal(customer.folder, "customers");
  assert.ok(resolveUploadPolicy({ isAdmin: false, kind: "video", hash: HASH }).error);
  assert.ok(resolveUploadPolicy({ isAdmin: false, kind: "image", hash: HASH, mime: "image/svg+xml" }).error);
  assert.ok(resolveUploadPolicy({ isAdmin: false, kind: "image", hash: HASH, bytes: 6 * 1024 * 1024 }).error);
});

test("duplicate classification never marks a referenced asset for deletion", () => {
  const { classifyResources } = require("../lib/media/duplicates");
  const r = (id, etag, created = "2026-01-01") => ({
    public_id: id, resource_type: "image", etag, bytes: 100, created_at: created,
  });
  const resources = [
    r("product/a", "E1"),
    r("product/a_copy", "E1"),
    r("product/a_used_copy", "E1"),
    r("old/unique", "E2"),
    r("dup/x1", "E3", "2026-01-01"),
    r("dup/x2", "E3", "2026-02-01"),
    r("no/etag1", ""),
    r("no/etag2", ""),
  ];
  const referencedIds = new Set(["product/a", "product/a_used_copy", "no/etag1"]);
  const out = classifyResources(resources, (x) => referencedIds.has(x.public_id));
  const ids = (list) => list.map((x) => x.public_id).sort();

  assert.deepEqual(ids(out.active), ["no/etag1", "product/a", "product/a_used_copy"]);
  assert.deepEqual(ids(out.duplicates), ["dup/x2", "product/a_copy"]);
  assert.deepEqual(ids(out.orphans), ["dup/x1", "no/etag2", "old/unique"]);
  assert.deepEqual(ids(out.redundantReferenced).length, 1);
  for (const x of [...out.duplicates, ...out.orphans]) assert.equal(referencedIds.has(x.public_id), false);
});

test("register endpoint rejects forged upload signatures", async () => {
  process.env.CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || "key";
  process.env.CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || "secret";
  const { registerUpload } = require("../controller/mediaController");
  let status = 200;
  let body;
  const res = {
    status(code) {
      status = code;
      return this;
    },
    send(payload) {
      body = payload;
      return this;
    },
  };
  await registerUpload({ body: { public_id: "product/x", version: 1, signature: "forged" } }, res);
  assert.equal(status, 400);
  assert.match(body.message, /signature/i);
});
