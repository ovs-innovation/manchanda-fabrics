const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const { resolveHomepageSettings } = require("../lib/homepage-settings");

const Schema = mongoose.Schema;
const SettingSchema = new Schema({}, { strict: false });
const Setting = mongoose.model("Setting", SettingSchema, "settings");

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { dbName: "manchanda" });
    console.log("Connected to MongoDB");
    const doc = await Setting.findOne({ name: "storeCustomizationSetting" });
    const homepage = resolveHomepageSettings(doc?.setting);
    if (homepage && Object.keys(homepage).length > 0) {
      console.log("manchandaHomepage setting found:");
      console.log(JSON.stringify(homepage, null, 2));
    } else {
      console.log("manchandaHomepage setting not found");
    }
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
  }
};

run();
