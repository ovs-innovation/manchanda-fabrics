import fs from "fs";
import path from "path";

/*
  Lists all video files inside public/reels so the storefront can
  auto-assign reels to cards without manual manifest editing.
  Also returns manifest.json mappings (per-product/category overrides).
*/
export default function handler(req, res) {
  try {
    const dir = path.join(process.cwd(), "public", "reels");
    const files = fs.existsSync(dir) ? fs.readdirSync(dir) : [];
    const videos = files
      .filter((f) => /\.(mp4|webm|mov)$/i.test(f))
      .sort()
      .map((f) => `/reels/${f}`);

    // Also pick up R1.mp4, R2.mp4... dropped in the public root
    const rootDir = path.join(process.cwd(), "public");
    const rootFiles = fs.existsSync(rootDir) ? fs.readdirSync(rootDir) : [];
    rootFiles
      .filter((f) => /^r\d+\.(mp4|webm|mov)$/i.test(f))
      .sort()
      .forEach((f) => videos.push(`/${f}`));

    let manifest = { products: {}, categories: {} };
    const manifestPath = path.join(dir, "manifest.json");
    if (fs.existsSync(manifestPath)) {
      try {
        const parsed = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
        manifest = {
          products: parsed?.products || {},
          categories: parsed?.categories || {},
        };
      } catch {
        // ignore malformed manifest
      }
    }

    res.setHeader("Cache-Control", "public, max-age=60");
    res.status(200).json({ videos, manifest });
  } catch {
    res.status(200).json({ videos: [], manifest: { products: {}, categories: {} } });
  }
}
