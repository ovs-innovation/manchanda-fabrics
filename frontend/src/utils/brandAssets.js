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

/** Normalizes image URLs, sanitizes blob: URLs, and matches backend loopback host */
export const normalizeProductImageUrl = (url) => {
  if (!url || typeof url !== "string") return "";
  const trimmed = url.trim();
  if (trimmed.startsWith("blob:")) return "";

  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;

    // On local dev: swap 127.0.0.1 <-> localhost
    if (hostname === "127.0.0.1" && trimmed.includes("localhost:8092")) {
      return trimmed.replace("localhost:8092", "127.0.0.1:8092");
    }
    if (hostname === "localhost" && trimmed.includes("127.0.0.1:8092")) {
      return trimmed.replace("127.0.0.1:8092", "localhost:8092");
    }

    // On live site: replace any localhost:8092 or 127.0.0.1:8092 with live API domain
    const isLive = hostname !== "localhost" && hostname !== "127.0.0.1";
    if (isLive) {
      if (trimmed.includes("localhost:8092")) {
        return trimmed.replace(/https?:\/\/localhost:8092/g, "https://api.manchandafabric.in");
      }
      if (trimmed.includes("127.0.0.1:8092")) {
        return trimmed.replace(/https?:\/\/127\.0\.0\.1:8092/g, "https://api.manchandafabric.in");
      }
    }
  }
  return trimmed;
};

