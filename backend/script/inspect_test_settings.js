const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const Schema = mongoose.Schema;
const SettingSchema = new Schema({}, { strict: false });
const Setting = mongoose.model("Setting", SettingSchema, "settings");

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { dbName: "test" });
    console.log("Connected to MongoDB database 'test'");
    const doc = await Setting.findOne({ name: "storeCustomizationSetting" });
    if (doc) {
      console.log("storeCustomizationSetting document found:");
      console.log(JSON.stringify(doc.toObject(), null, 2));
    } else {
      console.log("storeCustomizationSetting not found");
    }
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
  }
};

run();
