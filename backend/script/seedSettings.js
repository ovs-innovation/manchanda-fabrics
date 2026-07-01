require("../config/env");
const mongoose = require("mongoose");
const { connectDB } = require("../config/db");
const Setting = require("../models/Setting");
const settingData = require("../utils/settings.json");

const run = async () => {
  await connectDB();

  console.log("Cleaning up old settings...");
  await Setting.deleteMany({});

  console.log("Seeding settings...");
  await Setting.insertMany(settingData);
  console.log("Seeded settings successfully!");

  await mongoose.connection.close();
};

run().catch(console.error);
