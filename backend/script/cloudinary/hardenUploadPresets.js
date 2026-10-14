/**
 * Restricts the legacy unsigned upload preset to media formats only, so it can no
 * longer be abused to host arbitrary files. Prints the current settings first.
 *
 *   node script/cloudinary/hardenUploadPresets.js                     # show plan only
 *   node script/cloudinary/hardenUploadPresets.js --apply             # apply
 *   node script/cloudinary/hardenUploadPresets.js --preset=ml_default --apply
 *
 * Once every client uses signed uploads (/api/media/sign), turn the preset off entirely
 * in the Cloudinary console (Settings -> Upload -> preset -> Signing mode: Signed).
 */
require("../../config/env");
const { hasFlag, flagValue, requireCloudinary } = require("./_common");

const ALLOWED_FORMATS = "jpg,jpeg,png,webp,gif,svg,avif,ico,bmp,heic,heif,pdf,mp4,webm,mov";

const main = async () => {
  const cloudinary = requireCloudinary();
  const presetName =
    flagValue("preset") ||
    process.env.CLOUDINARY_UPLOAD_PRESET ||
    "E-COMMERCE_INFORMATIVE_CLOUDINARY_UPLOAD_PRESET";

  const current = await cloudinary.api.upload_preset(presetName);
  console.log(`Preset "${presetName}" current settings:`);
  console.log(JSON.stringify(current.settings, null, 2), `unsigned=${current.unsigned}`);

  const planned = {
    unsigned: current.unsigned,
    allowed_formats: ALLOWED_FORMATS,
    overwrite: false,
  };
  console.log("Planned update:", planned);

  if (!hasFlag("apply")) {
    console.log("Dry run only. Re-run with --apply to update the preset.");
    return;
  }
  await cloudinary.api.update_upload_preset(presetName, planned);
  console.log("Preset updated.");
};

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Failed:", err?.error?.message || err.message);
    process.exit(1);
  });
