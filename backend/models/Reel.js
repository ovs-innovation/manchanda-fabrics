const mongoose = require("mongoose");

const reelSchema = new mongoose.Schema(
  {
    video: {
      type: String,
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: false,
    },
    title: {
      type: String,
      required: false,
      trim: true,
    },
    thumbnail: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      default: "published",
      enum: ["published", "unpublished"],
    },
  },
  {
    timestamps: true,
  }
);

const Reel = mongoose.model("Reel", reelSchema);
module.exports = Reel;
