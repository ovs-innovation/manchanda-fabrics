const Reel = require("../models/Reel");

const createReel = async (req, res) => {
  try {
    const { video, product, title, thumbnail, status } = req.body;
    if (!video) {
      return res.status(400).send({ message: "Video URL is required." });
    }

    const reel = await Reel.create({
      video,
      product: product || undefined,
      title,
      thumbnail,
      status: status || "published",
    });

    res.status(201).send({ message: "Reel created successfully", reel });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const getPublicReels = async (req, res) => {
  try {
    const reels = await Reel.find({ status: "published" })
      .populate("product")
      .sort({ createdAt: -1 })
      .lean();
    res.send(reels);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const getAllReels = async (req, res) => {
  try {
    const reels = await Reel.find({})
      .populate("product")
      .sort({ createdAt: -1 })
      .lean();
    res.send(reels);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const updateReel = async (req, res) => {
  try {
    const { video, product, title, thumbnail, status } = req.body;
    
    const reel = await Reel.findById(req.params.id);
    if (!reel) {
      return res.status(404).send({ message: "Reel not found" });
    }

    reel.video = video !== undefined ? video : reel.video;
    reel.product = product !== undefined ? (product || undefined) : reel.product;
    reel.title = title !== undefined ? title : reel.title;
    reel.thumbnail = thumbnail !== undefined ? thumbnail : reel.thumbnail;
    reel.status = status !== undefined ? status : reel.status;

    await reel.save();
    
    // Fetch populated reel to return
    const updatedReel = await Reel.findById(reel._id)
      .populate("product");

    res.send({ message: "Reel updated successfully", reel: updatedReel });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const deleteReel = async (req, res) => {
  try {
    const reel = await Reel.findByIdAndDelete(req.params.id);
    if (!reel) {
      return res.status(404).send({ message: "Reel not found" });
    }
    res.send({ message: "Reel deleted successfully" });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

module.exports = {
  createReel,
  getPublicReels,
  getAllReels,
  updateReel,
  deleteReel,
};
