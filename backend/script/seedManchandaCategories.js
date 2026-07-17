/**
 * Seeds categories for Manchanda Fabrics.
 * Usage: node backend/script/seedManchandaCategories.js
 */
require("../config/env");
const mongoose = require("mongoose");
const { connectDB } = require("../config/db");
const Category = require("../models/Category");

const MANCHANDA_CATEGORIES = [
  // Root Category
  {
    _id: "6a48e73a47574a53bce8eed2",
    status: "show",
    name: { en: "Home" },
    id: "Root",
    parentName: "Home",
    description: { en: "Manchanda Fabrics Root Category" },
  },

  // Subcategories promoted to Root level
  {
    _id: "6a48e73a47574a53bce8eed4",
    status: "show",
    name: { en: "Gaji Silk" },
    parentId: "Root",
    parentName: "Home",
    slug: "gaji-silk",
    description: { en: "Premium Gaji Silk collection with heritage weaves." },
  },
  {
    _id: "6a48e73a47574a53bce8eed3",
    status: "show",
    name: { en: "Cotton Suits" },
    parentId: "Root",
    parentName: "Home",
    slug: "cotton-suits",
    description: { en: "Premium cotton suit sets." },
  },
  {
    _id: "6a48e73a47574a53bce8eed6",
    status: "show",
    name: { en: "Party Wear" },
    parentId: "Root",
    parentName: "Home",
    slug: "party-wear",
    description: { en: "Designer party wear suit sets." },
  },
  {
    _id: "6a48e73a47574a53bce8eedc",
    status: "show",
    name: { en: "Batik" },
    parentId: "Root",
    parentName: "Home",
    slug: "batik",
    description: { en: "Artistic Batik print suits." },
  },
  {
    _id: "6a48e73a47574a53bce8eed8",
    status: "show",
    name: { en: "Bangalori Silk Pure" },
    parentId: "Root",
    parentName: "Home",
    slug: "bangalori-silk-pure",
    description: { en: "Pure Bangalori Silk classic collection." },
  },
  {
    _id: "6a48e73a47574a53bce8eee2",
    status: "show",
    name: { en: "Glace Cotton" },
    parentId: "Root",
    parentName: "Home",
    slug: "glace-cotton",
    description: { en: "Shiny and premium Glace Cotton suits." },
  },
];

const run = async () => {
  await connectDB();

  const deleted = await Category.deleteMany({});
  console.log(`Removed ${deleted.deletedCount} legacy categories.`);

  const inserted = await Category.insertMany(MANCHANDA_CATEGORIES);
  console.log(`Inserted ${inserted.length} Manchanda Fabrics categories.`);

  await mongoose.connection.close();
  console.log("Done.");
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
