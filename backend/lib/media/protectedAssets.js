const fs = require("fs");
const path = require("path");
const { mediaConfig } = require("./config");

/**
 * Assets referenced from source code / static config rather than MongoDB.
 * They must never be treated as orphans even when no document points at them.
 */
const PROTECTED_PUBLIC_IDS = [
  "brand/manchanda_logo",
  "seo/manchanda_fabrics_og_preview",
  "seo/manchanda_og_preview",
  "homepage/hero_banner_video",
  "manchanda/brand/logo",
];

const SOURCE_EXTENSIONS = new Set([
  ".js", ".jsx", ".ts", ".tsx", ".json", ".hbs", ".html", ".css", ".md", ".txt", ".xml", ".webmanifest", ".env",
]);
const SKIP_DIRS = new Set(["node_modules", ".next", "dist", "build", ".git", "uploads", "coverage", "logs"]);

const repoRoot = path.resolve(__dirname, "..", "..", "..");
const SOURCE_ROOTS = [
  path.join(repoRoot, "backend"),
  path.join(repoRoot, "frontend", "src"),
  path.join(repoRoot, "frontend", "public"),
  path.join(repoRoot, "frontend", "next.config.js"),
  path.join(repoRoot, "frontend", ".env"),
  path.join(repoRoot, "admin", "src"),
  path.join(repoRoot, "admin", "public"),
  path.join(repoRoot, "admin", "index.html"),
  path.join(repoRoot, "admin", ".env"),
  path.join(repoRoot, "backend", ".env"),
];

let cachedSourceTexts = null;

const collectFiles = (entry, out) => {
  let stat;
  try {
    stat = fs.statSync(entry);
  } catch {
    return;
  }
  if (stat.isFile()) {
    const ext = path.extname(entry) || path.basename(entry);
    if (SOURCE_EXTENSIONS.has(ext) && stat.size < 5 * 1024 * 1024) out.push(entry);
    return;
  }
  if (!stat.isDirectory()) return;
  for (const name of fs.readdirSync(entry)) {
    if (SKIP_DIRS.has(name)) continue;
    collectFiles(path.join(entry, name), out);
  }
};

/** Source files that mention Cloudinary, read once per process. */
const getSourceTexts = () => {
  if (cachedSourceTexts) return cachedSourceTexts;
  const files = [];
  for (const root of SOURCE_ROOTS) collectFiles(root, files);
  cachedSourceTexts = [];
  for (const file of files) {
    try {
      const text = fs.readFileSync(file, "utf8");
      if (text.includes("res.cloudinary.com")) cachedSourceTexts.push(text);
    } catch {
      // unreadable file: skip
    }
  }
  return cachedSourceTexts;
};

const isProtectedPublicId = (publicId) => {
  if (!publicId) return true;
  if (PROTECTED_PUBLIC_IDS.includes(publicId)) return true;
  return mediaConfig.protectedPrefixes.some((prefix) => publicId.startsWith(prefix));
};

module.exports = {
  PROTECTED_PUBLIC_IDS,
  getSourceTexts,
  isProtectedPublicId,
};
