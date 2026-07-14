import fs from "fs";
import path from "path";

/*
  Fetches video reels from the backend API (MongoDB).
  Falls back to scanning local public/reels/ folder if no DB reels are found.
  This allows the storefront homepage reels to be managed dynamically from the admin panel.
*/
export default async function handler(req, res) {
  try {
    const apiBaseUrl = (
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8092/api"
    ).replace("://localhost", "://127.0.0.1");

    let reels = [];
    try {
      const response = await fetch(`${apiBaseUrl}/reels`);
      if (response.ok) {
        reels = await response.json();
      }
    } catch (err) {
      console.error("Failed to fetch reels from backend API, falling back to local files:", err.message);
    }

    const videos = [];
    const manifest = { products: {}, categories: {} };

    if (Array.isArray(reels) && reels.length > 0) {
      reels.forEach((reel) => {
        if (reel.video) {
          videos.push(reel.video);
          if (reel.product && reel.product.slug) {
            manifest.products[reel.product.slug] = reel.video;
          }
        }
      });
    }

    // Fallback: If no database reels are found, use local public assets
    if (videos.length === 0) {
      const dir = path.join(process.cwd(), "public", "reels");
      const files = fs.existsSync(dir) ? fs.readdirSync(dir) : [];
      files
        .filter((f) => /\.(mp4|webm|mov)$/i.test(f))
        .sort()
        .map((f) => `/reels/${f}`)
        .forEach((v) => videos.push(v));

      const rootDir = path.join(process.cwd(), "public");
      const rootFiles = fs.existsSync(rootDir) ? fs.readdirSync(rootDir) : [];
      rootFiles
        .filter((f) => /^r\d+\.(mp4|webm|mov)$/i.test(f))
        .sort()
        .forEach((f) => videos.push(`/${f}`));

      const manifestPath = path.join(dir, "manifest.json");
      if (fs.existsSync(manifestPath)) {
        try {
          const parsed = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
          manifest.products = parsed?.products || {};
          manifest.categories = parsed?.categories || {};
        } catch {
          // ignore
        }
      }
    }

    res.setHeader("Cache-Control", "public, max-age=60");
    res.status(200).json({ reels, videos, manifest });
  } catch (err) {
    res.status(500).json({ error: err.message, reels: [], videos: [], manifest: { products: {}, categories: {} } });
  }
}
