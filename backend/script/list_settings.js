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
    const docs = await Setting.find({});
    console.log("Settings documents found: " + docs.length);
    docs.forEach(doc => {
      console.log("- Name:", doc.get("name"));
    });
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
  }
};

run();
