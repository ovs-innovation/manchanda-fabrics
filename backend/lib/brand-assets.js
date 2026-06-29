/** Shared manchanda brand asset URLs (emails, push, invoices). */
const storeBase = (process.env.STORE_URL || "https://Manchanda Fabrics.com").replace(/\/$/, "");

const DEFAULT_LOGO_URL =
  process.env.BRAND_LOGO_URL || `${storeBase}/manchandalogo.png`;

const CLOUDINARY_FOLDER = process.env.CLOUDINARY_FOLDER || "manchanda";

module.exports = {
  DEFAULT_LOGO_URL,
  CLOUDINARY_FOLDER,
  storeBase,
};
