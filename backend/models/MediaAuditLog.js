const mongoose = require("mongoose");

const mediaAuditLogSchema = new mongoose.Schema(
  {
    action: { type: String, required: true },
    publicId: { type: String, default: "" },
    resourceType: { type: String, default: "" },
    mode: { type: String, default: "" },
    actor: { type: String, default: "" },
    details: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, collection: "media_audit_logs" }
);

mediaAuditLogSchema.index({ createdAt: -1 });
mediaAuditLogSchema.index({ publicId: 1 });

module.exports =
  mongoose.models.MediaAuditLog ||
  mongoose.model("MediaAuditLog", mediaAuditLogSchema);
