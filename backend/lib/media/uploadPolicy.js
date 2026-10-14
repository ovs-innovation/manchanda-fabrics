const ADMIN_FOLDERS = new Set([
  "manchanda",
  "product",
  "product-media",
  "product-videos",
  "product/videos",
  "variant",
  "category",
  "brand",
  "business",
  "favicon",
  "seo",
  "homepage",
  "homepage-videos",
  "homepage-reels",
  "notifications",
  "coupon",
  "admin",
  "customer",
  "testimonials",
]);

const CUSTOMER_FOLDER = "customers";
const DEFAULT_ADMIN_FOLDER = "manchanda";

const MB = 1024 * 1024;

const KINDS = {
  image: {
    resourceType: "image",
    mimes: [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/svg+xml",
      "image/avif",
      "image/x-icon",
      "image/vnd.microsoft.icon",
      "image/bmp",
    ],
    allowedFormats: "jpg,jpeg,png,webp,gif,svg,avif,ico,bmp",
    maxBytes: 15 * MB,
  },
  video: {
    resourceType: "video",
    mimes: ["video/mp4", "video/webm", "video/quicktime"],
    allowedFormats: "mp4,webm,mov",
    maxBytes: 100 * MB,
  },
  pdf: {
    resourceType: "image",
    mimes: ["application/pdf"],
    allowedFormats: "pdf",
    maxBytes: 20 * MB,
  },
};

const CUSTOMER_KIND = {
  ...KINDS.image,
  mimes: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  allowedFormats: "jpg,jpeg,png,webp",
  maxBytes: 5 * MB,
};

const HASH_RE = /^[a-f0-9]{16,64}$/;

const resolveAdminFolder = (folder) => {
  const clean = String(folder || "")
    .trim()
    .replace(/^\/+|\/+$/g, "")
    .toLowerCase();
  return ADMIN_FOLDERS.has(clean) ? clean : DEFAULT_ADMIN_FOLDER;
};

/**
 * Validates an upload request and returns the normalized policy or `{ error }`.
 * Admins may target any whitelisted folder; customers are pinned to
 * `customers/` with images only.
 */
const resolveUploadPolicy = ({ isAdmin, kind, folder, hash, mime, bytes }) => {
  const kindKey = String(kind || "image").toLowerCase();
  if (!KINDS[kindKey]) return { error: `Unsupported upload kind: ${kindKey}` };
  if (!isAdmin && kindKey !== "image") return { error: "Only image uploads are allowed" };

  const rules = isAdmin ? KINDS[kindKey] : CUSTOMER_KIND;
  const normalizedHash = String(hash || "").toLowerCase();
  if (!HASH_RE.test(normalizedHash)) return { error: "A valid content hash is required" };

  const normalizedMime = String(mime || "").toLowerCase();
  if (normalizedMime && !rules.mimes.includes(normalizedMime)) {
    return { error: `File type ${normalizedMime} is not allowed` };
  }

  const size = Number(bytes || 0);
  if (!Number.isFinite(size) || size < 0) return { error: "Invalid file size" };
  if (size > rules.maxBytes) {
    return { error: `File is too large. Maximum is ${Math.round(rules.maxBytes / MB)}MB` };
  }

  const resolvedFolder = isAdmin ? resolveAdminFolder(folder) : CUSTOMER_FOLDER;
  const shortHash = normalizedHash.slice(0, 40);

  return {
    kind: kindKey,
    resourceType: rules.resourceType,
    allowedFormats: rules.allowedFormats,
    maxBytes: rules.maxBytes,
    folder: resolvedFolder,
    hash: normalizedHash,
    publicId: `${resolvedFolder}/${shortHash}`,
  };
};

module.exports = {
  ADMIN_FOLDERS,
  CUSTOMER_FOLDER,
  KINDS,
  resolveAdminFolder,
  resolveUploadPolicy,
};
