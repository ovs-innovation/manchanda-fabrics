const mongoose = require("mongoose");

const mediaCleanupJobSchema = new mongoose.Schema(
  {
    publicId: { type: String, required: true },
    resourceType: { type: String, enum: ["image", "video", "raw"], default: "image" },
    url: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "retry", "dry_run", "kept", "protected", "deleted", "not_found", "failed"],
      default: "pending",
    },
    reason: { type: String, default: "" },
    sources: { type: [String], default: [] },
    attempts: { type: Number, default: 0 },
    notBefore: { type: Date, default: Date.now },
    lastError: { type: String, default: "" },
    processedAt: { type: Date },
  },
  { timestamps: true, collection: "media_cleanup_jobs" }
);

mediaCleanupJobSchema.index({ status: 1, notBefore: 1 });
mediaCleanupJobSchema.index({ publicId: 1, resourceType: 1, status: 1 });

module.exports =
  mongoose.models.MediaCleanupJob ||
  mongoose.model("MediaCleanupJob", mediaCleanupJobSchema);
