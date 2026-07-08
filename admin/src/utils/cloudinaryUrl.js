/** Old Cloudinary accounts — images return 401 after account change */
const LEGACY_CLOUD_NAMES = ["dhqcwkpzp", "ahossain"];

/** Admin panel favicon + sidebar/login logo */
export const ADMIN_BRAND_LOGO = "/manchandalogo.png";
export const CLOUDINARY_PLACEHOLDER = ADMIN_BRAND_LOGO;

const LEGACY_NOTIFICATION_MARKERS = [
  "placeholder_kvepfp",
  "favicon-transparent",
  "ahossain",
  "dhqcwkpzp",
];

export function getBrandLogoUrl(globalSetting) {
  return resolveCloudinaryUrl(globalSetting?.logo) || ADMIN_BRAND_LOGO;
}

/** Notification list avatar — brand logo instead of old template placeholder */
export function getNotificationAvatarUrl(image, globalSetting) {
  const resolved = resolveCloudinaryUrl(image);
  if (
    resolved &&
    !LEGACY_NOTIFICATION_MARKERS.some((marker) =>
      resolved.toLowerCase().includes(marker)
    )
  ) {
    return resolved;
  }
  return getBrandLogoUrl(globalSetting);
}

/**
 * Returns a safe image URL for <img src>. Blocks legacy cloud URLs so the browser
 * does not request files that always return 401.
 */
export function resolveCloudinaryUrl(url) {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed.startsWith("http")) return trimmed;

  const lower = trimmed.toLowerCase();
  const isLegacy = LEGACY_CLOUD_NAMES.some((cloud) =>
    lower.includes(`res.cloudinary.com/${cloud}/`)
  );

  if (isLegacy) return null;
  return trimmed;
}

export function isLegacyCloudinaryUrl(url) {
  return resolveCloudinaryUrl(url) === null && !!url;
}
