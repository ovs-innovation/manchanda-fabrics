const test = require("node:test");
const assert = require("node:assert/strict");
const http = require("http");
const express = require("express");

const responseCache = require("../lib/responseCache");

test("only public catalogue reads are cacheable", () => {
  assert.equal(responseCache.isCacheable("/api/products/store"), true);
  assert.equal(responseCache.isCacheable("/api/products/show"), true);
  assert.equal(responseCache.isCacheable("/api/products/product/red-silk-suit"), true);
  assert.equal(responseCache.isCacheable("/api/setting/store/customization/all"), true);
  assert.equal(responseCache.isCacheable("/api/products"), false);
  assert.equal(responseCache.isCacheable("/api/products/64b7f0c2a1b2c3d4e5f60718"), false);
  assert.equal(responseCache.isCacheable("/api/order/customer"), false);
  assert.equal(responseCache.isCacheable("/api/customer/me"), false);
  assert.equal(responseCache.isCacheable("/api/admin"), false);
});

test("catalogue writes invalidate, read-only POSTs do not", () => {
  assert.equal(responseCache.isMutation("PATCH", "/api/products/64b7f0c2a1b2c3d4e5f60718"), true);
  assert.equal(responseCache.isMutation("POST", "/api/products/add"), true);
  assert.equal(responseCache.isMutation("PUT", "/api/setting/store/customization/update"), true);
  assert.equal(responseCache.isMutation("POST", "/api/order/add"), true);
  assert.equal(responseCache.isMutation("DELETE", "/api/category/abc"), true);
  assert.equal(responseCache.isMutation("POST", "/api/products/view"), false);
  assert.equal(responseCache.isMutation("POST", "/api/products/recommendations"), false);
  assert.equal(responseCache.isMutation("POST", "/api/products/64b7f0c2a1b2c3d4e5f60718"), false);
  assert.equal(responseCache.isMutation("POST", "/api/setting/translate"), false);
  assert.equal(responseCache.isMutation("POST", "/api/customer/login"), false);
  assert.equal(responseCache.isMutation("GET", "/api/products/store"), false);
});

const request = (port, method, path) =>
  new Promise((resolve, reject) => {
    const req = http.request({ host: "127.0.0.1", port, method, path }, (res) => {
      let body = "";
      res.on("data", (c) => (body += c));
      res.on("end", () => resolve({ status: res.statusCode, cache: res.headers["x-cache"], body }));
    });
    req.on("error", reject);
    req.end();
  });

test("serves repeat reads from memory and refreshes after a write", async () => {
  let reads = 0;
  let version = 1;
  let failNext = false;
  const app = express();
  app.use(responseCache.middleware);
  app.get("/api/products/store", (req, res) => {
    reads += 1;
    if (failNext) {
      failNext = false;
      return res.status(500).send({ message: "boom" });
    }
    res.send({ version, q: req.query.category || null });
  });
  app.patch("/api/products/:id", (req, res) => {
    version += 1;
    res.send({ ok: true });
  });

  const server = app.listen(0);
  const { port } = server.address();
  try {
    const first = await request(port, "GET", "/api/products/store");
    assert.equal(first.cache, "MISS");
    assert.deepEqual(JSON.parse(first.body), { version: 1, q: null });

    const second = await request(port, "GET", "/api/products/store");
    assert.equal(second.cache, "HIT");
    assert.equal(second.body, first.body);
    assert.equal(reads, 1);

    const filtered = await request(port, "GET", "/api/products/store?category=silk");
    assert.equal(filtered.cache, "MISS");
    assert.deepEqual(JSON.parse(filtered.body), { version: 1, q: "silk" });

    await request(port, "PATCH", "/api/products/64b7f0c2a1b2c3d4e5f60718");

    const afterWrite = await request(port, "GET", "/api/products/store");
    assert.equal(afterWrite.cache, "MISS");
    assert.deepEqual(JSON.parse(afterWrite.body), { version: 2, q: null });

    responseCache.invalidate();
    failNext = true;
    const failed = await request(port, "GET", "/api/products/store");
    assert.equal(failed.status, 500);
    const retried = await request(port, "GET", "/api/products/store");
    assert.equal(retried.status, 200);
    assert.equal(retried.cache, "MISS");
  } finally {
    server.close();
  }
});
