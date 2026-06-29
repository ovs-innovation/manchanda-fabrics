require("../config/env");
const mongoose = require("mongoose");
const { connectDB } = require("../config/db");
const Setting = require("../models/Setting");

const run = async () => {
  await connectDB();
  const settings = await Setting.find({});
  console.log("Found settings documents:", settings.map(s => ({ id: s._id, name: s.name })));

  for (let doc of settings) {
    if (doc.setting) {
      console.log(`Document: ${doc.name}`);
      let serialized = JSON.stringify(doc.setting);
      if (serialized.includes("RASA")) {
        console.log(`-> Document contains 'RASA', updating...`);
        // Replace RASA with Manchanda Fabrics
        let updatedSerialized = serialized.replace(/RASA/g, "Manchanda Fabrics");
        doc.setting = JSON.parse(updatedSerialized);
        doc.markModified("setting");
        await doc.save();
        console.log(`-> Updated successfully!`);
      }
    }
  }

  await mongoose.connection.close();
};

run().catch(console.error);
