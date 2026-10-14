/**
 * Hits the public storefront API twice (cold, then cached) and checks status codes and shapes.
 *   node script/apiSmokeTest.js [baseUrl]      default http://127.0.0.1:8092
 */
const http = require("http");
const https = require("https");

const BASE = process.argv[2] || `http://127.0.0.1:${process.env.PORT || 8092}`;
const url = new URL(BASE);
const client = url.protocol === "https:" ? https : http;

const get = (path, method = "GET") =>
  new Promise((resolve) => {
    const started = Date.now();
    const req = client.request(
      { host: url.hostname, port: url.port, path, method, headers: { "Content-Type": "application/json" } },
      (res) => {
        let size = 0;
        const chunks = [];
        res.on("data", (c) => {
          size += c.length;
          chunks.push(c);
        });
        res.on("end", () => {
          let json = null;
          try {
            json = JSON.parse(Buffer.concat(chunks).toString());
          } catch {}
          resolve({ status: res.statusCode, ms: Date.now() - started, size, cache: res.headers["x-cache"] || "-", json });
        });
      }
    );
    req.on("error", (e) => resolve({ status: "ERR " + e.message, ms: Date.now() - started, size: 0, cache: "-" }));
    if (method !== "GET") req.write("{}");
    req.end();
  });

const CHECKS = [
  ["GET", "/", 200],
  ["GET", "/api/products/store", 200, (j) => Array.isArray(j.products) && j.products.length > 0 && j.manchandaHomepage],
  ["GET", "/api/products/store?tag=new-arrival", 200, (j) => Array.isArray(j.popularProducts)],
  ["GET", "/api/products/store?category=gaji-silk", 200, (j) => Array.isArray(j.products)],
  ["GET", "/api/products/store?title=suit", 200, (j) => Array.isArray(j.products)],
  ["GET", "/api/products/show", 200, (j) => Array.isArray(j) && j.length > 0],
  ["GET", "/api/products?page=1&limit=5", 200, (j) => Array.isArray(j.products)],
  ["GET", "/api/category/show", 200, (j) => Array.isArray(j) && j.length > 0],
  ["GET", "/api/category/all", 200],
  ["GET", "/api/brand/show", 200],
  ["GET", "/api/attributes/show", 200],
  ["GET", "/api/language/show", 200],
  ["GET", "/api/currency/show", 200],
  ["GET", "/api/reels", 200, (j) => Array.isArray(j)],
  ["GET", "/api/setting/global/all", 200],
  ["GET", "/api/setting/store-setting/all", 200],
  ["GET", "/api/setting/store-setting/seo", 200],
  ["GET", "/api/setting/store/customization/all", 200, (j) => j && typeof j === "object"],
  ["GET", "/api/faqs", 200],
  ["GET", "/api/testimonials", 200],
  ["GET", "/api/products/product/this-slug-does-not-exist", 404],
  ["GET", "/api/orders", 401],
  ["GET", "/api/customer-notifications", 401],
  ["POST", "/api/products/add", 401],
  ["GET", "/api/does-not-exist", 404],
];

(async () => {
  let failures = 0;
  const slugSource = await get("/api/products/show");
  const slug = Array.isArray(slugSource.json) && slugSource.json[0]?.slug;
  if (slug) CHECKS.push(["GET", `/api/products/product/${encodeURIComponent(slug)}`, 200, (j) => j && j.slug === slug]);

  for (const round of [1, 2]) {
    console.log(`\n── Round ${round} ──`);
    for (const [method, path, expected, validate] of CHECKS) {
      const r = await get(path, method);
      const statusOk = r.status === expected;
      const bodyOk = !validate || (r.json && validate(r.json));
      const ok = statusOk && bodyOk;
      if (!ok) failures += 1;
      console.log(
        `${ok ? "PASS" : "FAIL"} ${String(r.status).padEnd(4)} ${String(r.ms).padStart(6)}ms ${String(
          Math.round(r.size / 1024)
        ).padStart(5)}KB ${String(r.cache).padEnd(5)} ${method} ${path}${!statusOk ? ` (expected ${expected})` : ""}${
          statusOk && !bodyOk ? " (unexpected body)" : ""
        }`
      );
    }
  }
  console.log(`\n${failures === 0 ? "ALL PASSED" : `${failures} FAILED`}`);
  process.exit(failures ? 1 : 0);
})();
