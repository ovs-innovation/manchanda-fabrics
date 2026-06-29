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
    status: "show",
    name: { en: "Home" },
    id: "Root",
    parentName: "Home",
    description: { en: "Manchanda Fabrics Root Category" },
  },
  
  // Main Categories
  {
    status: "show",
    name: { en: "Sarees" },
    parentId: "Root",
    parentName: "Home",
    slug: "sarees",
    description: { en: "Premium Saree collection including Banarasi, Silk, Cotton & Designer weaves." },
    featured: true,
  },
  {
    status: "show",
    name: { en: "Suits" },
    parentId: "Root",
    parentName: "Home",
    slug: "suits",
    description: { en: "Elegant suit sets, festive suits, and embroidered designer wear." },
    featured: true,
  },
  {
    status: "show",
    name: { en: "Fabrics" },
    parentId: "Root",
    parentName: "Home",
    slug: "fabrics",
    description: { en: "Unstitched premium fabrics in cotton, silk, and exclusive designer prints." },
    featured: true,
  },

  // Saree Subcategories
  {
    status: "show",
    name: { en: "Gaji Silk" },
    parentId: "sarees",
    parentName: "Sarees",
    slug: "gaji-silk",
    description: { en: "Premium Gaji Silk sarees with heritage weaves." },
  },
  {
    status: "show",
    name: { en: "Bangalori Silk Pure" },
    parentId: "sarees",
    parentName: "Sarees",
    slug: "bangalori-silk-pure",
    description: { en: "Pure Bangalori Silk classic sarees." },
  },
  {
    status: "show",
    name: { en: "Kanjivaram Silk" },
    parentId: "sarees",
    parentName: "Sarees",
    slug: "kanjivaram-silk",
    description: { en: "Traditional Kanjivaram silk sarees." },
  },
  {
    status: "show",
    name: { en: "Gorgette" },
    parentId: "sarees",
    parentName: "Sarees",
    slug: "gorgette",
    description: { en: "Premium Gorgette sarees." },
  },
  {
    status: "show",
    name: { en: "Organza" },
    parentId: "sarees",
    parentName: "Sarees",
    slug: "organza",
    description: { en: "Elegant sheer Organza sarees." },
  },
  {
    status: "show",
    name: { en: "Crepe" },
    parentId: "sarees",
    parentName: "Sarees",
    slug: "crepe",
    description: { en: "Graceful Crepe silk sarees." },
  },
  {
    status: "show",
    name: { en: "Jamdani Cotton" },
    parentId: "sarees",
    parentName: "Sarees",
    slug: "jamdani-cotton",
    description: { en: "Traditional Jamdani cotton sarees." },
  },
  {
    status: "show",
    name: { en: "Linen Cotton" },
    parentId: "sarees",
    parentName: "Sarees",
    slug: "linen-cotton",
    description: { en: "Comfortable Linen Cotton sarees." },
  },

  // Suits Subcategories
  {
    status: "show",
    name: { en: "Cotton Suits" },
    parentId: "suits",
    parentName: "Suits",
    slug: "cotton-suits",
    description: { en: "Premium cotton suit sets." },
  },
  {
    status: "show",
    name: { en: "Party Wear Suits" },
    parentId: "suits",
    parentName: "Suits",
    slug: "party-wear-suits",
    description: { en: "Designer party wear suit sets." },
  },
  {
    status: "show",
    name: { en: "Bandhani Suits" },
    parentId: "suits",
    parentName: "Suits",
    slug: "bandhani-suits",
    description: { en: "Traditional Bandhani tie-dye suits." },
  },
  {
    status: "show",
    name: { en: "Batik" },
    parentId: "suits",
    parentName: "Suits",
    slug: "batik",
    description: { en: "Artistic Batik print suits." },
  },
  {
    status: "show",
    name: { en: "Glace Cotton" },
    parentId: "suits",
    parentName: "Suits",
    slug: "glace-cotton",
    description: { en: "Shiny and premium Glace Cotton suits." },
  },
  {
    status: "show",
    name: { en: "Modal" },
    parentId: "suits",
    parentName: "Suits",
    slug: "modal",
    description: { en: "Ultra soft Modal suits." },
  },
  {
    status: "show",
    name: { en: "Applique Work" },
    parentId: "suits",
    parentName: "Suits",
    slug: "applique-work",
    description: { en: "Stunning Applique craft suits." },
  },

  // Fabrics Subcategories
  {
    status: "show",
    name: { en: "Mul Cotton" },
    parentId: "fabrics",
    parentName: "Fabrics",
    slug: "mul-cotton",
    description: { en: "Feather-light Mul Cotton fabrics." },
  },
  {
    status: "show",
    name: { en: "Muslin" },
    parentId: "fabrics",
    parentName: "Fabrics",
    slug: "muslin",
    description: { en: "Premium fine Muslin fabrics." },
  },
  {
    status: "show",
    name: { en: "Kota Doria" },
    parentId: "fabrics",
    parentName: "Fabrics",
    slug: "kota-doria",
    description: { en: "Traditional Kota Doria fabrics." },
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
