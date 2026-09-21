const Setting = require("../models/Setting");
const Category = require("../models/Category");
const Product = require("../models/Product");
const Reel = require("../models/Reel");

const rewriteUrl = (url) => {
  if (typeof url !== "string") return url;
  if (!url) return url;
  if (url.includes("localhost:8092/uploads/") || url.includes("127.0.0.1:8092/uploads/")) {
    return url.replace(/https?:\/\/(localhost|127\.0\.0\.1):8092\/uploads\//g, "https://api.manchandafabric.in/uploads/");
  }
  return url;
};

const deepRewrite = (obj) => {
  if (!obj) return false;
  let modified = false;

  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      if (typeof obj[i] === "string") {
        const rewritten = rewriteUrl(obj[i]);
        if (rewritten !== obj[i]) {
          obj[i] = rewritten;
          modified = true;
        }
      } else if (typeof obj[i] === "object") {
        if (deepRewrite(obj[i])) modified = true;
      }
    }
    return modified;
  }

  if (typeof obj === "object") {
    for (const key of Object.keys(obj)) {
      if (typeof obj[key] === "string") {
        const rewritten = rewriteUrl(obj[key]);
        if (rewritten !== obj[key]) {
          obj[key] = rewritten;
          modified = true;
        }
      } else if (typeof obj[key] === "object" && obj[key] !== null) {
        if (deepRewrite(obj[key])) modified = true;
      }
    }
  }

  return modified;
};

/**
 * Automatically migrates any localhost:8092 / 127.0.0.1:8092 URLs in MongoDB
 * to production https://api.manchandafabric.in/uploads/ URLs.
 */
const autoMigrateLocalhostMedia = async () => {
  try {
    // 1. Settings (homepage hero video, story images, etc.)
    const settings = await Setting.find({});
    for (const doc of settings) {
      if (doc.setting && deepRewrite(doc.setting)) {
        doc.markModified("setting");
        await doc.save();
        console.log(`[AutoMigrate] Updated localhost URLs in Setting: ${doc.name}`);
      }
    }

    // 2. Categories (icon, banner, images)
    const categories = await Category.find({});
    for (const cat of categories) {
      let changed = false;
      if (cat.icon && rewriteUrl(cat.icon) !== cat.icon) {
        cat.icon = rewriteUrl(cat.icon);
        changed = true;
      }
      if (cat.banner && rewriteUrl(cat.banner) !== cat.banner) {
        cat.banner = rewriteUrl(cat.banner);
        changed = true;
      }
      if (Array.isArray(cat.images)) {
        const updatedImages = cat.images.map(rewriteUrl);
        if (JSON.stringify(updatedImages) !== JSON.stringify(cat.images)) {
          cat.images = updatedImages;
          changed = true;
        }
      }
      if (changed) {
        await cat.save();
        console.log(`[AutoMigrate] Updated Category media: ${cat.slug || cat._id}`);
      }
    }

    // 3. Reels (video, thumbnail)
    const reels = await Reel.find({});
    for (const reel of reels) {
      let changed = false;
      if (reel.video && rewriteUrl(reel.video) !== reel.video) {
        reel.video = rewriteUrl(reel.video);
        changed = true;
      }
      if (reel.thumbnail && rewriteUrl(reel.thumbnail) !== reel.thumbnail) {
        reel.thumbnail = rewriteUrl(reel.thumbnail);
        changed = true;
      }
      if (changed) {
        await reel.save();
        console.log(`[AutoMigrate] Updated Reel media: ${reel.title || reel._id}`);
      }
    }

    // 4. Products (image, featuredImage, gallery)
    const productsWithLocalhost = await Product.find({
      $or: [
        { image: { $regex: /localhost:8092|127\.0\.0\.1:8092/ } },
        { featuredImage: { $regex: /localhost:8092|127\.0\.0\.1:8092/ } },
      ],
    });

    for (const p of productsWithLocalhost) {
      let changed = false;
      if (Array.isArray(p.image)) {
        const newImgs = p.image.map(rewriteUrl);
        if (JSON.stringify(newImgs) !== JSON.stringify(p.image)) {
          p.image = newImgs;
          changed = true;
        }
      }
      if (p.featuredImage && rewriteUrl(p.featuredImage) !== p.featuredImage) {
        p.featuredImage = rewriteUrl(p.featuredImage);
        changed = true;
      }
      if (changed) {
        await p.save();
        console.log(`[AutoMigrate] Updated Product media: ${p.slug || p._id}`);
      }
    }
  } catch (err) {
    console.warn("[AutoMigrate] Migration check skipped/failed:", err.message);
  }
};

module.exports = { autoMigrateLocalhostMedia, rewriteUrl };
