require("../config/env");
const mongoose = require("mongoose");
const { connectDB } = require("../config/db");
const Setting = require("../models/Setting");

const updatePhone = async () => {
  try {
    await connectDB();
    console.log("Connected to database...");

    const settings = await Setting.find({});
    for (const doc of settings) {
      let str = JSON.stringify(doc.toObject());
      if (str.includes("9891595929") || str.includes("6599887766")) {
        str = str.replace(/9891595929/g, "9650544554").replace(/6599887766/g, "9650544554");
        const newObj = JSON.parse(str);
        Object.assign(doc, newObj);
        doc.markModified("setting");
        doc.markModified("value");
        doc.markModified("storeCustomizationSetting");
        await doc.save();
        console.log(`Updated Setting document: ${doc.name || doc._id}`);
      }
    }

    console.log("Phone number update completed successfully.");
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error("Error updating phone number in DB:", err);
    process.exit(1);
  }
};

updatePhone();
