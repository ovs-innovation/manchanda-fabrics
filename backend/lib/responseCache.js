const http = require("http");
const crypto = require("crypto");

// In-memory cache for public, user-independent catalogue reads.
// The MongoDB link is bandwidth-bound (~85 KB/s), so re-reading the full
// catalogue on every storefront request makes pages take 5-10s. Any
// successful catalogue write clears the cache and re-warms the hot keys.
//
// Assumes a single backend process (see Dockerfile CMD). With multiple
// processes each would hold its own copy and only the one that handled the
// write would be invalidated immediately; the others would follow at FRESH_MS.

const FRESH_MS = Number(process.env.RESPONSE_CACHE_FRESH_MS) || 60 * 1000;
const STALE_MS = Number(process.env.RESPONSE_CACHE_STALE_MS) || 10 * 60 * 1000;
const MAX_ENTRIES = Number(process.env.RESPONSE_CACHE_MAX_ENTRIES) || 500;
const MAX_BODY_BYTES = 5 * 1024 * 1024;
const WARM_KEYS = 25;
const DISABLED = process.env.RESPONSE_CACHE_DISABLED === "true";

const BYPASS_HEADER = "x-response-cache-refresh";
const bypassToken = crypto.randomBytes(16).toString("hex");

const CACHEABLE = [
  /^\/api\/products\/store$/,
  /^\/api\/products\/show$/,
  /^\/api\/products\/product\/[^/]+$/,
  /^\/api\/category\/show$/,
  /^\/api\/brand\/show$/,
  /^\/api\/attributes\/show$/,
  /^\/api\/language\/show$/,
  /^\/api\/currency\/show$/,
  /^\/api\/reels\/?$/,
  /^\/api\/setting\/global\/all$/,
  /^\/api\/setting\/store-setting\/all$/,
  /^\/api\/setting\/store-setting\/seo$/,
  /^\/api\/setting\/store\/customization\/all$/,
];

const MUTATION_PREFIXES = [
  "/api/products",
  "/api/category",
  "/api/brand",
  "/api/attributes",
  "/api/language",
  "/api/currency",
  "/api/reels",
  "/api/setting",
  "/api/order",
  "/api/orders",
  "/api/reviews",
  "/api/coupon",
];

// Non-GET endpoints under the prefixes above that only read data.
const READ_ONLY_WRITES = [
  /^\/api\/products\/view$/,
  /^\/api\/products\/recommendations$/,
  /^\/api\/products\/[0-9a-fA-F]{24}$/,
  /^\/api\/setting\/translate$/,
];

const store = new Map();
const hits = new Map();
const refreshing = new Set();
let generation = 0;
let warmTimer = null;
let port = null;

const isCacheable = (path) => CACHEABLE.some((re) => re.test(path));

const isMutation = (method, path) => {
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") return false;
  if (!MUTATION_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`))) return false;
  if (method === "POST" && READ_ONLY_WRITES.some((re) => re.test(path))) return false;
  return true;
};

const fetchInternal = (key) =>
  new Promise((resolve) => {
    if (!port) return resolve();
    const req = http.get(
      { host: "127.0.0.1", port, path: key, headers: { [BYPASS_HEADER]: bypassToken } },
      (res) => {
        res.resume();
        res.on("end", resolve);
      }
    );
    req.on("error", () => resolve());
    req.setTimeout(60 * 1000, () => {
      req.destroy();
      resolve();
    });
  });

const refresh = (key) => {
  if (refreshing.has(key)) return;
  refreshing.add(key);
  fetchInternal(key).finally(() => refreshing.delete(key));
};

const scheduleWarm = (keys) => {
  if (!keys.length) return;
  clearTimeout(warmTimer);
  warmTimer = setTimeout(async () => {
    for (const key of keys) {
      await fetchInternal(key);
    }
  }, 1000);
  if (warmTimer.unref) warmTimer.unref();
};

const invalidate = () => {
  generation += 1;
  const hot = [...hits.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, WARM_KEYS)
    .map(([key]) => key);
  store.clear();
  hits.clear();
  scheduleWarm(hot);
};

const remember = (key, entry) => {
  if (store.size >= MAX_ENTRIES && !store.has(key)) {
    store.delete(store.keys().next().value);
  }
  store.set(key, entry);
};

const middleware = (req, res, next) => {
  if (DISABLED) return next();

  const path = req.path;

  if (isMutation(req.method, path)) {
    res.on("finish", () => {
      if (res.statusCode < 400) invalidate();
    });
    return next();
  }

  if (req.method !== "GET" || !isCacheable(path)) return next();

  const key = req.originalUrl;
  const isRefresh = req.headers[BYPASS_HEADER] === bypassToken;

  if (!isRefresh) {
    hits.set(key, (hits.get(key) || 0) + 1);
    const entry = store.get(key);
    if (entry) {
      const age = Date.now() - entry.storedAt;
      if (age < STALE_MS) {
        if (age >= FRESH_MS) refresh(key);
        res.set("Content-Type", entry.contentType);
        res.set("X-Cache", age < FRESH_MS ? "HIT" : "STALE");
        return res.send(entry.body);
      }
      store.delete(key);
    }
  }

  const startGeneration = generation;
  const originalSend = res.send;
  res.send = function patchedSend(body) {
    if (
      res.statusCode === 200 &&
      startGeneration === generation &&
      (typeof body === "string" || Buffer.isBuffer(body)) &&
      Buffer.byteLength(body) <= MAX_BODY_BYTES
    ) {
      remember(key, {
        body,
        contentType: res.get("Content-Type") || "application/json; charset=utf-8",
        storedAt: Date.now(),
      });
    }
    if (!res.get("X-Cache")) res.set("X-Cache", "MISS");
    return originalSend.call(this, body);
  };
  return next();
};

const setPort = (value) => {
  port = Number(value) || null;
};

const warm = (keys) => scheduleWarm(keys);

const stats = () => ({ entries: store.size, generation, freshMs: FRESH_MS, staleMs: STALE_MS });

module.exports = {
  middleware,
  invalidate,
  setPort,
  warm,
  stats,
  isCacheable,
  isMutation,
};
