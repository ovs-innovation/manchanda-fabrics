/** Manchanda Fabrics brand logo */
export const DEFAULT_BRAND_LOGO = "/manchandalogo.png";

export const PRODUCT_PLACEHOLDER = "/product-placeholder.png";
export const PRODUCT_IMAGES = [PRODUCT_PLACEHOLDER];
export const PRODUCT_IMAGE_COUNT = 1;

export const productImageAt = () => PRODUCT_PLACEHOLDER;

// Cloudinary accounts that are disabled or no longer ours. URLs on them are
// kept in the database (so they can be migrated later) but never requested,
// since every request fails and shows a broken image.
const RETIRED_CLOUDS = ["tu23xpla", "detqbiabu", "dhqcwkpzp", "ahossain", "dse9adftu"];

export const isRetiredMediaUrl = (url) => {
  if (!url || typeof url !== "string") return false;
  const lower = url.trim().toLowerCase();
  return RETIRED_CLOUDS.some((c) => lower.includes(`res.cloudinary.com/${c}/`));
};

export const isUsableImageUrl = (url) => {
  if (!url || typeof url !== "string") return false;
  const t = url.trim();
  if (!t.startsWith("http")) return false;
  const lower = t.toLowerCase();
  if (lower.includes("logo-light")) return false;
  return !isRetiredMediaUrl(t);
};

/** First valid URL, else default local logo */
export const pickBrandLogo = (...candidates) => {
  for (const url of candidates) {
    if (isUsableImageUrl(url)) return url.trim();
  }
  return DEFAULT_BRAND_LOGO;
};

/** Normalizes image URLs, sanitizes blob: URLs, and matches backend loopback host */
export const normalizeProductImageUrl = (url) => {
  if (!url || typeof url !== "string") return "";
  const trimmed = url.trim();
  if (trimmed.startsWith("blob:")) return "";
  if (isRetiredMediaUrl(trimmed)) return "";
  if (typeof window !== "undefined") {
    const is127 = window.location.hostname === "127.0.0.1";
    if (is127 && trimmed.includes("localhost:8092")) {
      return trimmed.replace("localhost:8092", "127.0.0.1:8092");
    }
    const isLocalhost = window.location.hostname === "localhost";
    if (isLocalhost && trimmed.includes("127.0.0.1:8092")) {
      return trimmed.replace("127.0.0.1:8092", "localhost:8092");
    }
  }
  return trimmed;
};

/**
 * Automatically optimizes Cloudinary image URLs with WebP/AVIF format, auto-quality,
 * and exact dimension scaling, reducing payload by 90-98%.
 * Non-Cloudinary URLs or already transformed URLs are safely preserved.
 */
export const getOptimizedImageUrl = (url, width = 600, height = null) => {
  const normalized = normalizeProductImageUrl(url);
  if (!normalized) return "";
  if (normalized.includes("res.cloudinary.com") && normalized.includes("/upload/")) {
    if (!normalized.includes("/upload/c_") && !normalized.includes("/upload/w_")) {
      const transform = height
        ? `c_fill,w_${width},h_${height},q_auto,f_auto`
        : `c_limit,w_${width},q_auto,f_auto`;
      return normalized.replace("/upload/", `/upload/${transform}/`);
    }
  }
  return normalized;
};

/**
 * Resized delivery URL for Cloudinary images only; videos, local files and any
 * other URL are returned exactly as given. Keep widths to a few fixed sizes so
 * the number of derived transformations stays small.
 */
export const cloudinaryImageAt = (url, width, height = null) =>
  typeof url === "string" && url.includes("res.cloudinary.com") && url.includes("/image/upload/")
    ? getOptimizedImageUrl(url, width, height) || url
    : url;

/**
 * Generates an optimized OpenGraph/WhatsApp preview image URL.
 * WhatsApp, Facebook, iMessage & Twitter crawlers require:
 * 1. Image strictly under 300KB (otherwise WhatsApp drops preview or renders tiny 1:1)
 * 2. Standard JPEG format (f_jpg / .jpg) - WebP fails in some crawlers
 * 3. High resolution with explicit dimensions:
 *    - For product pages (portrait 3:4 fashion format): 800x1067 px
 *    - For other pages (landscape 1.91:1 format): 1200x630 px
 */
export const getSocialShareImageUrl = (url, isProduct = true) => {
  if (!url || typeof url !== "string") return "https://manchandafabric.in/og-image.jpg";
  let clean = url.trim();
  if (!clean) return "https://manchandafabric.in/og-image.jpg";
  if (clean.startsWith("/")) clean = `https://manchandafabric.in${clean}`;
  if (!clean.startsWith("http")) clean = `https://manchandafabric.in/${clean}`;

  if (clean.includes("res.cloudinary.com") && clean.includes("/upload/")) {
    // For fashion products, use high-res 3:4 portrait (800x1067) filling the frame (matching Myntra)
    // without artificial sidebars. Under 250KB JPEG for 100% WhatsApp crawler compatibility.
    const transform = isProduct
      ? "c_fill,w_800,h_1067,g_auto,q_80,f_jpg"
      : "c_fill,w_1200,h_630,g_auto,q_80,f_jpg";

    // Replace any existing transformation or inject new one right before version or path
    if (/\/upload\/(c_|w_|h_|q_|f_|t_|b_)[^/]+\/(v\d+\/.*)/i.test(clean)) {
      clean = clean.replace(/\/upload\/[^/]+\/(v\d+\/.*)/i, `/upload/${transform}/$1`);
    } else if (/\/upload\/(v\d+\/.*)/i.test(clean)) {
      clean = clean.replace(/\/upload\/(v\d+\/.*)/i, `/upload/${transform}/$1`);
    } else {
      clean = clean.replace(/\/upload\//, `/upload/${transform}/`);
    }

    // Force .jpg extension so crawlers recognize it as image/jpeg
    clean = clean.replace(/\.(webp|png|jpeg|jpg)(\?.*)?$/i, ".jpg$2");
  }

  return clean;
};
