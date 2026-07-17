require("../config/env");
const mongoose = require("mongoose");
const { connectDB } = require("../config/db");
const Setting = require("../models/Setting");

async function run() {
  await connectDB();

  // Find storeCustomizationSetting
  const doc = await Setting.findOne({ name: "storeCustomizationSetting" });
  if (!doc) {
    console.log("storeCustomizationSetting not found!");
    process.exit(1);
  }

  console.log("Original address_box_address_one:", doc.setting?.contact_us?.address_box_address_one);

  const contact_us = {
    ...doc.setting?.contact_us,
    address_box_address_one: {
      en: "12-A, Krishna Cloth Market, Chandni Chowk - 110006",
      de: "12-A, Krishna Cloth Market, Chandni Chowk - 110006"
    }
  };

  doc.setting = {
    ...doc.setting,
    contact_us
  };

  doc.markModified("setting");
  await doc.save();
  console.log("Updated storeCustomizationSetting address successfully!");

  // Also verify by printing
  const updatedDoc = await Setting.findOne({ name: "storeCustomizationSetting" });
  console.log("Updated address:", updatedDoc.setting?.contact_us?.address_box_address_one);

  await mongoose.connection.close();
}

run().catch(console.error);
