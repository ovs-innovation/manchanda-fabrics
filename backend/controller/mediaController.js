const MediaAsset = require("../models/MediaAsset");
const MediaCleanupJob = require("../models/MediaCleanupJob");
const MediaAuditLog = require("../models/MediaAuditLog");
const { getCloudinary, isCloudinaryConfigured, mediaConfig } = require("../lib/media/config");
const { resolveUploadPolicy } = require("../lib/media/uploadPolicy");
const { processQueue } = require("../lib/media/cleanupService");
const { checkUsage } = require("../lib/media/usageMonitor");
const log = require("../lib/media/logger");

const ADMIN_ROLES = ["Admin", "Super Admin", "Cashier", "Manager", "CEO", "Driver", "Security Guard", "Accountant"];
const isAdminUser = (user) => Boolean(user && user.role && ADMIN_ROLES.includes(user.role));

const findReusableAsset = async (policy) => {
  const known = await MediaAsset.findOne({
    publicId: policy.publicId,
    resourceType: policy.resourceType,
    status: "active",
    url: { $ne: "" },
  }).lean();
  if (!known) return null;

  try {
    const resource = await getCloudinary().api.resource(policy.publicId, {
      resource_type: policy.resourceType,
    });
    return resource?.secure_url ? { ...known, url: resource.secure_url } : null;
  } catch (err) {
    const missing = err?.error?.http_code === 404;
    if (missing) {
      await MediaAsset.updateOne({ _id: known._id }, { $set: { status: "missing" } }).catch(() => {});
      return null;
    }
    // Admin API unavailable / rate limited: let Cloudinary dedupe via overwrite=false.
    log.warn("reuse_check_failed", { publicId: policy.publicId, error: err?.error?.message || err.message });
    return null;
  }
};

/**
 * POST /api/media/sign
 * Returns signed upload parameters for a hash-addressed public_id, or the
 * existing asset URL when identical content was uploaded before.
 */
const signUpload = async (req, res) => {
  try {
    if (!isCloudinaryConfigured()) {
      return res.send({ signingAvailable: false });
    }

    const isAdmin = isAdminUser(req.user);
    const policy = resolveUploadPolicy({ isAdmin, ...req.body });
    if (policy.error) return res.status(400).send({ message: policy.error });

    const actor = String(req.user?._id || "");
    const now = new Date();

    const reusable = await findReusableAsset(policy);
    await MediaAsset.updateOne(
      { publicId: policy.publicId, resourceType: policy.resourceType },
      {
        $set: { lastRequestedAt: now, requestedBy: actor },
        $setOnInsert: {
          folder: policy.folder,
          hash: policy.hash,
          status: "pending",
          source: isAdmin ? "admin" : "customer",
        },
      },
      { upsert: true }
    );

    if (reusable) {
      log.info("upload_reused", { publicId: policy.publicId, actor });
      return res.send({
        signingAvailable: true,
        existing: true,
        secure_url: reusable.url,
        public_id: policy.publicId,
        width: reusable.width,
        height: reusable.height,
        format: reusable.format,
        resource_type: policy.resourceType,
      });
    }

    const cloudinary = getCloudinary();
    const params = {
      timestamp: Math.floor(Date.now() / 1000),
      public_id: policy.publicId,
      overwrite: false,
      allowed_formats: policy.allowedFormats,
    };
    const signature = cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET);

    return res.send({
      signingAvailable: true,
      existing: false,
      uploadUrl: `https://api.cloudinary.com/v1_1/${mediaConfig.cloudName}/${policy.resourceType}/upload`,
      fields: { ...params, signature, api_key: process.env.CLOUDINARY_API_KEY },
      public_id: policy.publicId,
      resource_type: policy.resourceType,
      maxBytes: policy.maxBytes,
    });
  } catch (err) {
    log.error("sign_failed", { error: err.message });
    res.status(500).send({ message: "Unable to prepare upload" });
  }
};

/**
 * POST /api/media/register
 * Records metadata of a completed upload. The Cloudinary response signature is
 * verified so clients cannot register arbitrary assets.
 */
const registerUpload = async (req, res) => {
  try {
    if (!isCloudinaryConfigured()) return res.send({ registered: false });
    const { public_id, version, signature, resource_type = "image" } = req.body || {};
    if (!public_id || !version || !signature) {
      return res.status(400).send({ message: "public_id, version and signature are required" });
    }

    const expected = getCloudinary().utils.api_sign_request(
      { public_id, version },
      process.env.CLOUDINARY_API_SECRET
    );
    if (expected !== signature) {
      return res.status(400).send({ message: "Invalid upload signature" });
    }

    const resourceType = ["image", "video", "raw"].includes(resource_type) ? resource_type : "image";
    const { secure_url, width, height, format, bytes, created_at } = req.body;
    await MediaAsset.updateOne(
      { publicId: public_id, resourceType },
      {
        $set: {
          url: secure_url || "",
          width: Number(width) || 0,
          height: Number(height) || 0,
          format: format || "",
          bytes: Number(bytes) || 0,
          version: Number(version) || 0,
          status: "active",
          cloudinaryCreatedAt: created_at ? new Date(created_at) : undefined,
          lastRequestedAt: new Date(),
        },
        $setOnInsert: { folder: public_id.split("/").slice(0, -1).join("/") },
      },
      { upsert: true }
    );
    res.send({ registered: true });
  } catch (err) {
    log.warn("register_failed", { error: err.message });
    res.status(500).send({ message: "Unable to register upload" });
  }
};

const getUsage = async (req, res) => {
  try {
    if (!isCloudinaryConfigured()) return res.send({ configured: false });
    const report = await checkUsage();
    res.send(report);
  } catch (err) {
    res.status(500).send({ message: err?.error?.message || err.message });
  }
};

const getCleanupStatus = async (req, res) => {
  try {
    const [counts, recent] = await Promise.all([
      MediaCleanupJob.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      MediaAuditLog.find().sort({ createdAt: -1 }).limit(50).lean(),
    ]);
    res.send({
      mode: mediaConfig.cleanupMode,
      jobs: counts.reduce((acc, c) => ({ ...acc, [c._id]: c.count }), {}),
      recentAudit: recent,
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const runCleanup = async (req, res) => {
  try {
    const result = await processQueue();
    res.send(result);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

module.exports = {
  signUpload,
  registerUpload,
  getUsage,
  getCleanupStatus,
  runCleanup,
  isAdminUser,
};
