/**
 * Remove legacy Farmacy/Farmcy Kart branding from MongoDB settings.
 * Run: node backend/script/migrateRemoveFarmacyBranding.js
 */
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const { connectDB } = require("../config/db");
const Setting = require("../models/Setting");

const REPLACEMENTS = [
  [/farmacykart/gi, "Manchanda Fabrics"],
  [/farmacy kart/gi, "Manchanda Fabrics"],
  [/farmcykart/gi, "Manchanda Fabrics"],
  [/farmcy kart/gi, "Manchanda Fabrics"],
  [/farmcy_kart/gi, "manchanda_fabrics"],
  [/AQOSU FARMACYKART PRIVATE LIMITED/gi, "Manchanda Fabrics Private Limited"],
  [/farmacykart\.com/gi, "manchandafabrics.com"],
];

const scrubValue = (value) => {
  if (typeof value === "string") {
    let next = value;
    for (const [pattern, replacement] of REPLACEMENTS) {
      next = next.replace(pattern, replacement);
    }
    return next;
  }
  if (Array.isArray(value)) return value.map(scrubValue);
  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = scrubValue(v);
    }
    return out;
  }
  return value;
};

const run = async () => {
  await connectDB();
  const docs = await Setting.find({});
  let updated = 0;

  for (const doc of docs) {
    const cleaned = scrubValue(doc.setting);
    const before = JSON.stringify(doc.setting);
    const after = JSON.stringify(cleaned);
    if (before !== after) {
      doc.setting = cleaned;
      doc.markModified("setting");
      await doc.save();
      updated += 1;
      console.log(`  updated: ${doc.name}`);
    }
  }

  console.log(`\nDone — ${updated} setting document(s) cleaned.`);
  await mongoose.connection.close();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
