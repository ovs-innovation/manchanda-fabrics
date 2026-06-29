require("../config/env");
const mongoose = require("mongoose");
const { connectDB } = require("../config/db");
const Setting = require("../models/Setting");

const run = async () => {
  await connectDB();
  const storeCustomization = await Setting.findOne({ name: "storeCustomizationSetting" });
  const globalSetting = await Setting.findOne({ name: "globalSetting" });

  console.log("=== storeCustomizationSetting ===");
  console.log("navbar:", JSON.stringify(storeCustomization?.setting?.navbar, null, 2));
  console.log("logo:", storeCustomization?.setting?.logo);
  console.log("favicon:", storeCustomization?.setting?.favicon);
  console.log("seo:", JSON.stringify(storeCustomization?.setting?.seo, null, 2));

  console.log("=== globalSetting ===");
  console.log("logo:", globalSetting?.setting?.logo);
  console.log("favicon:", globalSetting?.setting?.favicon);

  await mongoose.connection.close();
};

run().catch(console.error);
