require("../config/env");
const mongoose = require("mongoose");
const { connectDB } = require("../config/db");
const Reel = require("../models/Reel");

async function verify() {
  await connectDB();
  
  console.log("Checking Reels collection...");
  const count = await Reel.countDocuments();
  console.log("Reels count in DB:", count);
  
  await mongoose.connection.close();
  console.log("Verified successfully!");
}

verify().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
