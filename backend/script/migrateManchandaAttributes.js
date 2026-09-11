/**
 * Seeds Manchanda fashion color variants (non-destructive).
 * Usage: node backend/script/migrateManchandaAttributes.js
 */
require("../config/env");
const mongoose = require("mongoose");
const { connectDB } = require("../config/db");
const Attribute = require("../models/Attribute");

const FASHION_COLORS = [
  // Pinks
  { name: { en: "Rani Pink" }, hexColor: "#E3007E" },
  { name: { en: "Baby Pink" }, hexColor: "#F4C2C2" },
  { name: { en: "Blush Pink" }, hexColor: "#FE828C" },
  { name: { en: "Dusty Rose" }, hexColor: "#DCAE96" },
  { name: { en: "Peach Pink" }, hexColor: "#F68B7A" },
  { name: { en: "Hot Pink" }, hexColor: "#FF69B4" },
  { name: { en: "Pastel Pink" }, hexColor: "#FFD1DC" },
  { name: { en: "Fuchsia Pink" }, hexColor: "#FF007F" },
  { name: { en: "Magenta" }, hexColor: "#CA1F7B" },
  { name: { en: "Powder Pink" }, hexColor: "#FFE4E1" },
  { name: { en: "Coral Pink" }, hexColor: "#F88379" },
  { name: { en: "Onion Pink" }, hexColor: "#C4717A" },
  { name: { en: "Pink" }, hexColor: "#EC4899" },

  // Reds & Wines
  { name: { en: "Bridal Red" }, hexColor: "#C41E3A" },
  { name: { en: "Sindoor Red" }, hexColor: "#E34234" },
  { name: { en: "Ruby Red" }, hexColor: "#E0115F" },
  { name: { en: "Maroon" }, hexColor: "#800000" },
  { name: { en: "Deep Wine" }, hexColor: "#722F37" },
  { name: { en: "Burgundy" }, hexColor: "#800020" },
  { name: { en: "Red" }, hexColor: "#DC2626" },

  // Greens
  { name: { en: "Pista Green" }, hexColor: "#93C572" },
  { name: { en: "Mehndi Green" }, hexColor: "#7F8C42" },
  { name: { en: "Bottle Green" }, hexColor: "#004B23" },
  { name: { en: "Sage Green" }, hexColor: "#9DC183" },
  { name: { en: "Mint Green" }, hexColor: "#98FF98" },
  { name: { en: "Emerald Green" }, hexColor: "#50C878" },
  { name: { en: "Teal Green" }, hexColor: "#00827F" },
  { name: { en: "Green" }, hexColor: "#16A34A" },

  // Blues
  { name: { en: "Royal Blue" }, hexColor: "#4169E1" },
  { name: { en: "Navy Blue" }, hexColor: "#000080" },
  { name: { en: "Peacock Blue" }, hexColor: "#005F73" },
  { name: { en: "Sky Blue" }, hexColor: "#87CEEB" },
  { name: { en: "Turquoise Blue" }, hexColor: "#40E0D0" },
  { name: { en: "Blue" }, hexColor: "#2563EB" },

  // Yellows & Golds
  { name: { en: "Mustard Yellow" }, hexColor: "#E1AD01" },
  { name: { en: "Haldi Yellow" }, hexColor: "#FFCC00" },
  { name: { en: "Golden Yellow" }, hexColor: "#FFD700" },
  { name: { en: "Antique Gold" }, hexColor: "#C5A059" },
  { name: { en: "Lemon Yellow" }, hexColor: "#FFF44F" },

  // Oranges & Peaches
  { name: { en: "Rust Orange" }, hexColor: "#C45508" },
  { name: { en: "Peach" }, hexColor: "#FFE5B4" },
  { name: { en: "Coral" }, hexColor: "#FF7F50" },

  // Purples & Lavenders
  { name: { en: "Lavender" }, hexColor: "#E6E6FA" },
  { name: { en: "Lilac" }, hexColor: "#C8A2C8" },
  { name: { en: "Mauve" }, hexColor: "#E0B0FF" },
  { name: { en: "Plum" }, hexColor: "#8E4585" },

  // Neutrals & Metallics
  { name: { en: "Pure White" }, hexColor: "#FFFFFF" },
  { name: { en: "Off White" }, hexColor: "#FAF9F6" },
  { name: { en: "Ivory" }, hexColor: "#FFFFF0" },
  { name: { en: "Cream" }, hexColor: "#FFFDD0" },
  { name: { en: "Beige" }, hexColor: "#F5F5DC" },
  { name: { en: "Coffee Brown" }, hexColor: "#4A2E18" },
  { name: { en: "Brown" }, hexColor: "#92400E" },
  { name: { en: "Charcoal Grey" }, hexColor: "#36454F" },
  { name: { en: "Grey" }, hexColor: "#6B7280" },
  { name: { en: "Black" }, hexColor: "#000000" },
];

const UK_SIZES = [
  "UK 3", "UK 4", "UK 5", "UK 6", "UK 7", "UK 8", "UK 9", "UK 10",
];

const upsertAttribute = async (nameEn, payload) => {
  let attr = await Attribute.findOne({ "name.en": nameEn });
  if (!attr) {
    attr = await Attribute.create(payload);
    console.log(`  + created ${nameEn} attribute`);
  } else {
    Object.assign(attr, payload);
    await attr.save();
    console.log(`  ~ updated ${nameEn} attribute`);
  }
  return attr;
};

const run = async () => {
  await connectDB();

  await upsertAttribute("Color", {
    type: "attribute",
    status: "show",
    title: { en: "Color" },
    name: { en: "Color" },
    option: "Dropdown",
    variants: FASHION_COLORS.map((c) => ({
      status: "show",
      name: c.name,
      hexColor: c.hexColor,
    })),
  });

  await upsertAttribute("Size", {
    type: "attribute",
    status: "show",
    title: { en: "Size" },
    name: { en: "Size" },
    option: "Radio",
    variants: UK_SIZES.map((size) => ({
      status: "show",
      name: { en: size },
    })),
  });

  await mongoose.connection.close();
  console.log("Done.");
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
