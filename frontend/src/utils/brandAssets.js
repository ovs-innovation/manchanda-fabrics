/** Manchanda Fabrics brand logo */
export const DEFAULT_BRAND_LOGO = "/manchandalogo.png";

const HERO_IMAGES = [1, 2, 3, 4, 5, 6].map((n) => `/h${n}.jpeg`);
const CATALOG_IMAGES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map(
  (n) => `/p${n}.jpeg`
);

export const PRODUCT_IMAGES = [...HERO_IMAGES, ...CATALOG_IMAGES];
export const PRODUCT_IMAGE_COUNT = PRODUCT_IMAGES.length;
export const PRODUCT_PLACEHOLDER = PRODUCT_IMAGES[0];

export const productImageAt = (index = 0) =>
  PRODUCT_IMAGES[
    ((index % PRODUCT_IMAGE_COUNT) + PRODUCT_IMAGE_COUNT) % PRODUCT_IMAGE_COUNT
  ];

const LEGACY_CLOUDS = ["dhqcwkpzp", "ahossain"];

export const isUsableImageUrl = (url) => {
  if (!url || typeof url !== "string") return false;
  const t = url.trim();
  if (!t.startsWith("http")) return false;
  const lower = t.toLowerCase();
  if (lower.includes("logo-light")) return false;
  return !LEGACY_CLOUDS.some((c) => lower.includes(`res.cloudinary.com/${c}/`));
};

/** First valid URL, else default local logo */
export const pickBrandLogo = (...candidates) => {
  for (const url of candidates) {
    if (isUsableImageUrl(url)) return url.trim();
  }
  return DEFAULT_BRAND_LOGO;
};

export const optimizeCloudinaryUrl = (url, width = 600) => {
  if (!url || typeof url !== "string") return url;
  if (url.includes("res.cloudinary.com") && url.includes("/image/upload/")) {
    if (!url.includes("f_auto") && !url.includes("q_auto")) {
      return url.replace("/image/upload/", `/image/upload/f_auto,q_auto,w_${width},c_limit/`);
    }
  }
  return url;
};

/** Normalizes image URLs, sanitizes blob: URLs, auto-optimizes Cloudinary images to WebP */
export const normalizeProductImageUrl = (url, width = 600) => {
  if (!url || typeof url !== "string") return "";
  let trimmed = url.trim();
  if (trimmed.startsWith("blob:")) return "";
  if (typeof window !== "undefined") {
    const is127 = window.location.hostname === "127.0.0.1";
    if (is127 && trimmed.includes("localhost:8092")) {
      trimmed = trimmed.replace("localhost:8092", "127.0.0.1:8092");
    }
    const isLocalhost = window.location.hostname === "localhost";
    if (isLocalhost && trimmed.includes("127.0.0.1:8092")) {
      trimmed = trimmed.replace("127.0.0.1:8092", "localhost:8092");
    }
  }
  return optimizeCloudinaryUrl(trimmed, width);
};

