const express = require("express");
const router = express.Router();
const {
  createReel,
  getPublicReels,
  getAllReels,
  updateReel,
  deleteReel,
} = require("../controller/reelController");
const { isAuth } = require("../config/auth");

// Public listing
router.get("/", getPublicReels);

// Admin listing
router.get("/admin/all", isAuth, getAllReels);

// Create reel
router.post("/", isAuth, createReel);

// Update reel
router.put("/:id", isAuth, updateReel);

// Delete reel
router.delete("/:id", isAuth, deleteReel);

module.exports = router;
