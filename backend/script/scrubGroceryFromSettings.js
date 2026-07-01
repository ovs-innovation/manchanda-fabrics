require("../config/env");
const mongoose = require("mongoose");
const { connectDB } = require("../config/db");
const Setting = require("../models/Setting");

const run = async () => {
  await connectDB();
  
  const doc = await Setting.findOne({ name: "storeCustomizationSetting" });
  if (doc) {
    console.log("Found storeCustomizationSetting, scrubbing old grocery references...");
    let serialized = JSON.stringify(doc.setting);
    
    // Replace old grocery product types/categories with suit boutique alternatives
    const replacements = [
      ["fish-meat", "suits"],
      ["drinks", "fabrics"],
      ["milk-dairy", "new-arrivals"],
      ["beauty-health", "about-us"],
      ["fruits-vegetable", "suits"],
      ["Fish & Meat", "Suit Sets"],
      ["Soft Drink", "Unstitched Material"],
      ["Milk & Dairy", "New Arrivals"],
      ["Beauty & Health", "About Us"],
      ["Freshness Guaranteed", "Luxury Suits Guaranteed"],
      ["The Best Quality Products Guaranteed!", "Manchanda Fabrics Signature Luxury Edition"],
      ["grocery", "boutique"],
      ["grocery-store", "manchanda-boutique"],
      ["slider-1.webp", "gaji-silk.jpg"],
      ["slider-2_o6aezc.jpg", "bangalori-silk.jpg"],
      ["slider-3_iw4nnf.jpg", "applique-suit.jpg"]
    ];
    
    for (let [from, to] of replacements) {
      const regex = new RegExp(from, "g");
      serialized = serialized.replace(regex, to);
    }
    
    doc.setting = JSON.parse(serialized);
    doc.markModified("setting");
    await doc.save();
    console.log("Successfully cleaned up all old grocery references from storeCustomizationSetting!");
  } else {
    console.log("storeCustomizationSetting document not found.");
  }
  
  await mongoose.connection.close();
};

run().catch(console.error);
