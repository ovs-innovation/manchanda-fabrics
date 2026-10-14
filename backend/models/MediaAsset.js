const mongoose = require("mongoose");

const mediaAssetSchema = new mongoose.Schema(
  {
    publicId: { type: String, required: true },
    resourceType: { type: String, enum: ["image", "video", "raw"], default: "image" },
    url: { type: String, default: "" },
    folder: { type: String, default: "" },
    hash: { type: String, default: "" },
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
    format: { type: String, default: "" },
    bytes: { type: Number, default: 0 },
    version: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["pending", "active", "deleted", "missing"],
      default: "pending",
    },
    source: { type: String, default: "" },
    requestedBy: { type: String, default: "" },
    lastRequestedAt: { type: Date },
    lastReferenceCount: { type: Number, default: null },
    lastScannedAt: { type: Date },
    cloudinaryCreatedAt: { type: Date },
    deletedAt: { type: Date },
  },
  { timestamps: true, collection: "media_assets" }
);

mediaAssetSchema.index({ publicId: 1, resourceType: 1 }, { unique: true });
mediaAssetSchema.index({ hash: 1 });
mediaAssetSchema.index({ status: 1, lastRequestedAt: 1 });

module.exports =
  mongoose.models.MediaAsset || mongoose.model("MediaAsset", mediaAssetSchema);
