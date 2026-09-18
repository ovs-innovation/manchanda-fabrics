require("../config/env");
const mongoose = require("mongoose");
const { connectDB } = require("../config/db");
const Category = require("../models/Category");
const Product = require("../models/Product");
const Setting = require("../models/Setting");
const {
  ensureHindiTitle,
  ensureHindiDescription,
  ensureHindiName,
  translateToHindi,
  translateWithNemotron,
} = require("../utils/fashionTranslator");

const HINDI_STORE_ADDRESS = "12-ए, कृष्णा क्लॉथ मार्केट, चाँदनी चौक - 110006";

async function run() {
  await connectDB();
  console.log("Connected to MongoDB for Hindi synchronization...");

  // 1. Sync Categories
  const categories = await Category.find({});
  console.log(`Found ${categories.length} categories.`);
  let updatedCats = 0;
  for (const cat of categories) {
    let modified = false;
    const currentNameEn = cat.name?.en || (typeof cat.name === "string" ? cat.name : "");
    const currentNameHi = cat.name?.hi;

    const newName = ensureHindiName(cat.name);
    if (!currentNameHi || currentNameHi !== newName.hi) {
      cat.name = newName;
      modified = true;
    }

    if (cat.description) {
      const newDesc = ensureHindiDescription(cat.description);
      if (!cat.description?.hi || cat.description?.hi !== newDesc.hi) {
        cat.description = newDesc;
        modified = true;
      }
    }

    if (modified) {
      cat.markModified("name");
      if (cat.description) cat.markModified("description");
      await cat.save();
      updatedCats++;
      console.log(`  Updated Category "${currentNameEn}": hi -> "${cat.name.hi}"`);
    }
  }
  console.log(`Categories updated: ${updatedCats}/${categories.length}`);

  // 2. Sync Products missing title.hi
  const products = await Product.find({});
  console.log(`Found ${products.length} products.`);
  let updatedProds = 0;
  for (const prod of products) {
    let modified = false;
    const currentTitleEn = prod.title?.en || (typeof prod.title === "string" ? prod.title : "");
    const currentTitleHi = prod.title?.hi;

    if (!currentTitleHi || currentTitleHi === currentTitleEn || !/[\u0900-\u097F]/.test(currentTitleHi) || /[a-zA-Z]/.test(currentTitleHi)) {
      const aiTitleHi = await translateWithNemotron(currentTitleEn);
      prod.title = {
        ...(typeof prod.title === "object" ? prod.title : {}),
        en: currentTitleEn,
        hi: aiTitleHi || ensureHindiTitle(prod.title).hi,
      };
      modified = true;
    }

    if (prod.description && (!prod.description.hi || prod.description.hi === prod.description.en)) {
      prod.description = ensureHindiDescription(prod.description);
      modified = true;
    }

    if (modified) {
      prod.markModified("title");
      if (prod.description) prod.markModified("description");
      await prod.save();
      updatedProds++;
    }
  }
  console.log(`Products updated with Hindi title/desc: ${updatedProds}/${products.length}`);

  // 3. Sync Store Settings & Customization
  const storeSettings = await Setting.find({});
  for (const doc of storeSettings) {
    let modified = false;
    if (doc.name === "storeCustomizationSetting" && doc.setting) {
      // Contact us address
      if (doc.setting.contact_us) {
        if (!doc.setting.contact_us.address) {
          doc.setting.contact_us.address = {};
        }
        if (typeof doc.setting.contact_us.address === "string") {
          doc.setting.contact_us.address = {
            en: doc.setting.contact_us.address,
            hi: HINDI_STORE_ADDRESS,
          };
          modified = true;
        } else if (!doc.setting.contact_us.address.hi) {
          doc.setting.contact_us.address.hi = HINDI_STORE_ADDRESS;
          modified = true;
        }

        // Call box text
        if (doc.setting.contact_us.call_box_text) {
          if (!doc.setting.contact_us.call_box_text.hi) {
            doc.setting.contact_us.call_box_text.hi = "हमें कॉल / व्हाट्सएप करें";
            modified = true;
          }
        }
      }

      // Footer
      if (doc.setting.footer) {
        if (!doc.setting.footer.address) {
          doc.setting.footer.address = {};
        }
        if (typeof doc.setting.footer.address === "string") {
          doc.setting.footer.address = {
            en: doc.setting.footer.address,
            hi: HINDI_STORE_ADDRESS,
          };
          modified = true;
        } else if (!doc.setting.footer.address.hi) {
          doc.setting.footer.address.hi = HINDI_STORE_ADDRESS;
          modified = true;
        }
      }

      // Manchanda Homepage footer
      if (doc.setting.manchandaHomepage?.footer) {
        if (doc.setting.manchandaHomepage.footer.address) {
          if (typeof doc.setting.manchandaHomepage.footer.address === "string") {
            doc.setting.manchandaHomepage.footer.address = {
              en: doc.setting.manchandaHomepage.footer.address,
              hi: HINDI_STORE_ADDRESS,
            };
            modified = true;
          } else if (!doc.setting.manchandaHomepage.footer.address.hi) {
            doc.setting.manchandaHomepage.footer.address.hi = HINDI_STORE_ADDRESS;
            modified = true;
          }
        }
      }
    }

    if (doc.name === "globalSetting" && doc.setting) {
      if (doc.setting.address) {
        if (typeof doc.setting.address === "string") {
          doc.setting.address = {
            en: doc.setting.address,
            hi: HINDI_STORE_ADDRESS,
          };
          modified = true;
        } else if (!doc.setting.address.hi) {
          doc.setting.address.hi = HINDI_STORE_ADDRESS;
          modified = true;
        }
      }
    }

    if (modified) {
      doc.markModified("setting");
      await doc.save();
      console.log(`Updated Setting document: ${doc.name}`);
    }
  }

  console.log("Hindi synchronization complete!");
  await mongoose.connection.close();
  process.exit(0);
}

run().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
