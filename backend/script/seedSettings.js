require("../config/env");
const mongoose = require("mongoose");
const { connectDB } = require("../config/db");
const Setting = require("../models/Setting");
const settingData = require("../utils/settings.json");

const run = async () => {
  await connectDB();
  
  console.log("Cleaning up old settings...");
  await Setting.deleteMany({});

  console.log("Rebranding and seeding settings...");
  const rebrandedSettings = settingData.map(doc => {
    let serialized = JSON.stringify(doc);
    let updatedSerialized = serialized.replace(/RASA/g, "Manchanda Fabrics");
    // Also clean up any legacy email / websites
    updatedSerialized = updatedSerialized.replace(/contact@rasastore.com/g, "manchandafabrics@gmail.com");
    updatedSerialized = updatedSerialized.replace(/info\.RASA@gmail\.com/g, "manchandafabrics@gmail.com");
    updatedSerialized = updatedSerialized.replace(/info@RASA\.com/g, "manchandafabrics@gmail.com");
    updatedSerialized = updatedSerialized.replace(/RASA\.com/g, "manchandafabrics.com");
    return JSON.parse(updatedSerialized);
  });

  await Setting.insertMany(rebrandedSettings);
  console.log("✅ Seeded and rebranded settings successfully!");

  await mongoose.connection.close();
};

run().catch(console.error);
