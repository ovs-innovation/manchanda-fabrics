require("../config/env");
const mongoose = require("mongoose");
const { connectDB } = require("../config/db");
const Setting = require("../models/Setting");
const Admin = require("../models/Admin");
const Category = require("../models/Category");
const Product = require("../models/Product");

const REPLACEMENTS = [
  [/Farmacykart/gi, "Manchanda Fabrics"],
  [/Farmacy kart/gi, "Manchanda Fabrics"],
  [/Farmcykart/gi, "Manchanda Fabrics"],
  [/Farmcy kart/gi, "Manchanda Fabrics"],
  [/Farmacy/gi, "Manchanda Fabrics"],
];

const isLegacyHomepageKey = (key) =>
  key.endsWith("Homepage") && key !== "manchandaHomepage";

const scrubValue = (value) => {
  if (value instanceof mongoose.Types.ObjectId) return value;
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
      const nextKey = isLegacyHomepageKey(k) ? "manchandaHomepage" : k;
      out[nextKey] = scrubValue(v);
    }
    return out;
  }
  return value;
};

const run = async () => {
  await connectDB();

  console.log("Cleaning settings...");
  const settingsDocs = await Setting.find({});
  for (const doc of settingsDocs) {
    const cleaned = scrubValue(doc.setting);
    if (JSON.stringify(doc.setting) !== JSON.stringify(cleaned)) {
      doc.setting = cleaned;
      doc.markModified("setting");
      await doc.save();
      console.log(`  Updated setting: ${doc.name}`);
    }
  }

  console.log("Cleaning admins...");
  const adminDocs = await Admin.find({});
  for (const doc of adminDocs) {
    let changed = false;
    if (doc.name && doc.name.en) {
      const cleanedEn = scrubValue(doc.name.en);
      if (doc.name.en !== cleanedEn) {
        doc.name.en = cleanedEn;
        doc.markModified("name");
        changed = true;
      }
    }
    const cleanedEmail = scrubValue(doc.email);
    if (doc.email !== cleanedEmail) {
      doc.email = cleanedEmail;
      changed = true;
    }
    if (changed) {
      await doc.save();
      console.log(`  Updated admin email/name: ${doc.email}`);
    }
  }

  console.log("Cleaning categories...");
  const categoryDocs = await Category.find({});
  for (const doc of categoryDocs) {
    let changed = false;
    if (doc.name && doc.name.en) {
      const cleanedName = scrubValue(doc.name.en);
      if (doc.name.en !== cleanedName) {
        doc.name.en = cleanedName;
        doc.markModified("name");
        changed = true;
      }
    }
    if (doc.description && doc.description.en) {
      const cleanedDesc = scrubValue(doc.description.en);
      if (doc.description.en !== cleanedDesc) {
        doc.description.en = cleanedDesc;
        doc.markModified("description");
        changed = true;
      }
    }
    if (changed) {
      await doc.save();
      console.log(`  Updated category: ${doc.name.en}`);
    }
  }

  console.log("Cleaning products...");
  const productDocs = await Product.find({});
  for (const doc of productDocs) {
    let changed = false;
    if (doc.title && doc.title.en) {
      const cleanedTitle = scrubValue(doc.title.en);
      if (doc.title.en !== cleanedTitle) {
        doc.title.en = cleanedTitle;
        doc.markModified("title");
        changed = true;
      }
    }
    if (doc.description && doc.description.en) {
      const cleanedDesc = scrubValue(doc.description.en);
      if (doc.description.en !== cleanedDesc) {
        doc.description.en = cleanedDesc;
        doc.markModified("description");
        changed = true;
      }
    }
    if (changed) {
      await doc.save();
      console.log(`  Updated product: ${doc.title.en}`);
    }
  }

  console.log("\nRebranding run finished successfully!");
  await mongoose.connection.close();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
