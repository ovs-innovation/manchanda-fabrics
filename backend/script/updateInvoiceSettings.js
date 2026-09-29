require("../config/env");
const mongoose = require("mongoose");
const { connectDB } = require("../config/db");
const Setting = require("../models/Setting");

const run = async () => {
  await connectDB();

  console.log("Updating global settings with MANCHANDA FAB, GSTIN and Phone numbers...");
  let globalSet = await Setting.findOne({ name: "globalSetting" });
  if (globalSet) {
    globalSet.setting = {
      ...globalSet.setting,
      company_name: "MANCHANDA FAB",
      gstin: "07ADKPM4552G1ZG",
      vat_number: "07ADKPM4552G1ZG",
      contact: "9654582246, 9650544554",
      authorized_signatory: "For MANCHANDA FAB",
      email: "manchandafabrics@gmail.com",
      website: "manchandafabric.in",
    };
    globalSet.markModified("setting");
    await globalSet.save();
    console.log("✅ Successfully updated globalSetting in MongoDB Atlas:");
    console.log("   Company Name:", globalSet.setting.company_name);
    console.log("   GSTIN:", globalSet.setting.gstin);
    console.log("   Contact:", globalSet.setting.contact);
    console.log("   Address:", globalSet.setting.address);
  } else {
    console.warn("globalSetting document not found.");
  }

  await mongoose.connection.close();
  console.log("Invoice settings update complete.");
};

run().catch(err => {
  console.error("Failed to update invoice settings:", err);
  process.exit(1);
});
