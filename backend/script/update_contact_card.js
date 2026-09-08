require("../config/env");
const mongoose = require("mongoose");
const { connectDB } = require("../config/db");
const Setting = require("../models/Setting");

const updateContactCard = async () => {
  try {
    await connectDB();
    console.log("Connected to database...");

    const doc = await Setting.findOne({ name: "storeCustomizationSetting" });
    if (!doc) {
      console.log("storeCustomizationSetting not found!");
      process.exit(1);
    }

    if (!doc.setting) doc.setting = {};
    if (!doc.setting.contact_us) doc.setting.contact_us = {};

    doc.setting.contact_us.call_box_text = {
      en: "Call / WhatsApp Us",
      de: "Call / WhatsApp Us",
    };

    doc.markModified("setting");
    await doc.save();

    console.log("Successfully updated contact_us.call_box_text in storeCustomizationSetting!");
    console.log("Current value:", doc.setting.contact_us.call_box_text);

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error("Error updating contact card text in DB:", err);
    process.exit(1);
  }
};

updateContactCard();
