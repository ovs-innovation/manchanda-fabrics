const CLOUDINARY_URL_RE = /(?:https?:)?\/\/res\.cloudinary\.com\/[^\s"'<>()\\]+/gi;
const DELIVERY_RE =
  /res\.cloudinary\.com\/([^/]+)\/(image|video|raw)\/(upload|private|authenticated)\/([^?#\s]+)/i;
const VERSION_RE = /^v\d+$/;
const EXTENSION_RE = /\.[a-z0-9]{2,5}$/i;

const safeDecode = (segment) => {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
};

const stripExtension = (value) => String(value || "").replace(EXTENSION_RE, "");

const extractCloudinaryUrls = (text) => {
  if (typeof text !== "string" || !text.includes("res.cloudinary.com")) return [];
  const matches = text.match(CLOUDINARY_URL_RE) || [];
  return matches.map((url) =>
    url
      .replace(/&amp;/g, "&")
      .replace(/[),;]+$/, "")
  );
};

/**
 * Parses a Cloudinary delivery URL. `publicId` is only set when it can be
 * derived unambiguously (a version segment is present, or there is no
 * leading segment that could be a transformation). Deletion must never act on
 * an ambiguous parse.
 */
const parseCloudinaryUrl = (url) => {
  if (typeof url !== "string") return null;
  const match = url.match(DELIVERY_RE);
  if (!match) return null;

  const [, cloudName, resourceType, deliveryType, rawPath] = match;
  const segments = rawPath.split("/").filter(Boolean).map(safeDecode);
  if (!segments.length) return null;

  let idSegments;
  let ambiguous = false;
  const versionIndex = segments.findIndex((s) => VERSION_RE.test(s));

  if (versionIndex >= 0) {
    idSegments = segments.slice(versionIndex + 1);
  } else {
    let start = 0;
    while (start < segments.length - 1) {
      const seg = segments[start];
      if (seg.includes(",")) {
        start += 1;
      } else if (/^[a-z]{1,3}_[^/]+$/.test(seg)) {
        ambiguous = true;
        start += 1;
      } else {
        break;
      }
    }
    idSegments = segments.slice(start);
  }

  if (!idSegments.length) return null;

  const last = idSegments[idSegments.length - 1];
  const formatMatch = last.match(EXTENSION_RE);
  const publicIdSegments =
    resourceType === "raw"
      ? idSegments
      : [...idSegments.slice(0, -1), stripExtension(last)];

  return {
    url,
    cloudName,
    resourceType: resourceType.toLowerCase(),
    deliveryType: deliveryType.toLowerCase(),
    path: segments.join("/"),
    publicId: ambiguous ? null : publicIdSegments.join("/"),
    format: formatMatch ? formatMatch[0].slice(1).toLowerCase() : null,
    ambiguous,
  };
};

/**
 * Every trailing segment-suffix of the delivery path, with and without the
 * file extension. The real public_id of a delivery URL is always one of these,
 * so matching candidates against this set can only over-protect, never miss.
 */
const referenceKeysForUrl = (url) => {
  const match = typeof url === "string" ? url.match(DELIVERY_RE) : null;
  if (!match) return [];
  const segments = match[4].split("/").filter(Boolean).map(safeDecode);
  const keys = new Set();
  for (let i = 0; i < segments.length; i += 1) {
    const suffix = segments.slice(i).join("/");
    keys.add(suffix);
    keys.add(stripExtension(suffix));
  }
  return [...keys];
};

const isPlainWalkable = (value) => {
  if (!value || typeof value !== "object") return false;
  if (value._bsontype) return false;
  if (value instanceof Date) return false;
  if (Buffer.isBuffer(value)) return false;
  return true;
};

/** Visits every string inside an arbitrarily nested value. */
const walkStrings = (value, visit, seen = new WeakSet(), depth = 0) => {
  if (depth > 60 || value === null || value === undefined) return;
  if (typeof value === "string") {
    visit(value);
    return;
  }
  if (!isPlainWalkable(value)) return;
  if (seen.has(value)) return;
  seen.add(value);

  const source = typeof value.toObject === "function" ? value.toObject() : value;
  if (Array.isArray(source)) {
    for (const item of source) walkStrings(item, visit, seen, depth + 1);
    return;
  }
  for (const key of Object.keys(source)) {
    walkStrings(source[key], visit, seen, depth + 1);
  }
};

/** All Cloudinary delivery URLs found anywhere inside `value`. */
const collectCloudinaryUrls = (value) => {
  const urls = new Set();
  walkStrings(value, (str) => {
    for (const url of extractCloudinaryUrls(str)) urls.add(url);
  });
  return [...urls];
};

module.exports = {
  extractCloudinaryUrls,
  parseCloudinaryUrl,
  referenceKeysForUrl,
  stripExtension,
  walkStrings,
  collectCloudinaryUrls,
};
