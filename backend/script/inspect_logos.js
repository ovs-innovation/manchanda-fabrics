require("../config/env");
const mongoose = require("mongoose");
const { connectDB } = require("../config/db");
const Setting = require("../models/Setting");

const run = async () => {
  await connectDB();
  const settings = await Setting.find({});
  for (let s of settings) {
    console.log("====================================");
    console.log("Setting Name:", s.name);
    const str = JSON.stringify(s.setting, null, 2);
    // Find all occurrences of logo or logo keys
    const lines = str.split("\n");
    for (let line of lines) {
      if (line.toLowerCase().includes("logo")) {
        console.log("  ", line.trim());
      }
    }
  }
  await mongoose.connection.close();
};

run().catch(console.error);
