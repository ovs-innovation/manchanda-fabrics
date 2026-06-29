const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const Schema = mongoose.Schema;
const SettingSchema = new Schema({}, { strict: false });
const Setting = mongoose.model("Setting", SettingSchema, "settings");

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { dbName: "manchanda" });
    console.log("Connected to MongoDB");
    const doc = await Setting.findOne({ name: "rasaHomepage" });
    if (doc) {
      console.log("rasaHomepage setting document found:");
      console.log(JSON.stringify(doc.toObject(), null, 2));
    } else {
      console.log("rasaHomepage setting not found");
    }
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
  }
};

run();
