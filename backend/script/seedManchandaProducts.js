/**
 * Seeds premium products and brands for Manchanda Fabrics.
 * Usage: node backend/script/seedManchandaProducts.js
 */
require("../config/env");
const mongoose = require("mongoose");
const { connectDB } = require("../config/db");
const Product = require("../models/Product");
const Category = require("../models/Category");
const Brand = require("../models/Brand");
const Setting = require("../models/Setting");

const BRANDS = [
  { name: { en: "Royal Weaves" }, slug: "royal-weaves", status: "show" },
  { name: { en: "Traditional Threads" }, slug: "traditional-threads", status: "show" },
  { name: { en: "Utsav Silks" }, slug: "utsav-silks", status: "show" },
  { name: { en: "Loom Heritage" }, slug: "loom-heritage", status: "show" },
];

const PRODUCTS = [
  {
    slug: "gaji-silk-heritage-saree",
    title: "Premium Handloom Gaji Silk Saree",
    brandSlug: "royal-weaves",
    categorySlug: "gaji-silk",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800",
    originalPrice: 18999,
    price: 15999,
    discount: 3000,
    stock: 15,
    sku: "MAN-GAJI-001",
    tag: ["new-arrival", "trending", "featured"],
    productType: "Sarees",
    gender: "Women",
    occasion: "Festive",
    fabricType: "Gaji Silk",
    workType: "Zari Border Weave",
    blouseIncluded: true,
    sareeLength: "5.5 meters + 0.8 meters blouse",
    colorFamily: "Royal Red & Gold",
    collectionName: "Heritage Collection",
  },
  {
    slug: "pure-bangalori-silk-saree",
    title: "Pure Bangalori Silk Embroidered Saree",
    brandSlug: "utsav-silks",
    categorySlug: "bangalori-silk-pure",
    image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=800",
    originalPrice: 14999,
    price: 11999,
    discount: 3000,
    stock: 12,
    sku: "MAN-BANG-002",
    tag: ["trending", "featured"],
    productType: "Sarees",
    gender: "Women",
    occasion: "Wedding",
    fabricType: "Bangalori Silk",
    workType: "Fine Resham Embroidery",
    blouseIncluded: true,
    sareeLength: "5.5 meters + 0.8 meters blouse",
    colorFamily: "Fuchsia Pink",
    collectionName: "Wedding Edit",
  },
  {
    slug: "traditional-kanjivaram-silk-saree",
    title: "Traditional Kanjivaram Silk Saree",
    brandSlug: "royal-weaves",
    categorySlug: "kanjivaram-silk",
    image: "https://images.unsplash.com/photo-1610030469668-93535c17b6b3?q=80&w=800",
    originalPrice: 28999,
    price: 24999,
    discount: 4000,
    stock: 8,
    sku: "MAN-KANJ-003",
    tag: ["featured"],
    productType: "Sarees",
    gender: "Women",
    occasion: "Wedding",
    fabricType: "Kanjivaram Silk",
    workType: "Golden Zari Kanjivaram Weave",
    blouseIncluded: true,
    sareeLength: "5.5 meters + 0.8 meters blouse",
    colorFamily: "Deep Maroon",
    collectionName: "Wedding Edit",
  },
  {
    slug: "premium-cotton-suit-set",
    title: "Classic Handblock Printed Cotton Suit Set",
    brandSlug: "loom-heritage",
    categorySlug: "cotton-suits",
    image: "https://images.unsplash.com/photo-1608748010899-18f300247112?q=80&w=800",
    originalPrice: 4500,
    price: 3499,
    discount: 1001,
    stock: 20,
    sku: "MAN-CS-004",
    tag: ["new-arrival"],
    productType: "Suits",
    gender: "Women",
    occasion: "Casual",
    fabricType: "Cotton",
    workType: "Handblock Print",
    blouseIncluded: false,
    colorFamily: "Indigo Blue",
    collectionName: "Daily Wear",
  },
  {
    slug: "embroidered-party-wear-suit",
    title: "Embellished Organza Party Wear Suit Set",
    brandSlug: "traditional-threads",
    categorySlug: "party-wear-suits",
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800",
    originalPrice: 9999,
    price: 7999,
    discount: 2000,
    stock: 10,
    sku: "MAN-PWS-005",
    tag: ["new-arrival", "featured"],
    productType: "Suits",
    gender: "Women",
    occasion: "Party",
    fabricType: "Organza",
    workType: "Gota Patti Handwork",
    blouseIncluded: false,
    colorFamily: "Lime Green",
    collectionName: "Festive Edit",
  },
  {
    slug: "applique-work-suit-set",
    title: "Handcrafted Applique Work Suit Set",
    brandSlug: "loom-heritage",
    categorySlug: "applique-work",
    image: "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?q=80&w=800",
    originalPrice: 8500,
    price: 6999,
    discount: 1501,
    stock: 14,
    sku: "MAN-APP-006",
    tag: ["trending"],
    productType: "Suits",
    gender: "Women",
    occasion: "Festive",
    fabricType: "Cotton Silk",
    workType: "Hand Applique Craft",
    blouseIncluded: false,
    colorFamily: "Ivory & Red",
    collectionName: "Artisanal Edit",
  },
  {
    slug: "mul-cotton-soft-fabric",
    title: "Super Soft Pure Mul Cotton Fabric",
    brandSlug: "loom-heritage",
    categorySlug: "mul-cotton",
    image: "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?q=80&w=800",
    originalPrice: 599,
    price: 499,
    discount: 100,
    stock: 150,
    sku: "MAN-MUL-007",
    tag: ["new-arrival"],
    productType: "Fabrics",
    gender: "Unisex",
    occasion: "Casual",
    fabricType: "Mul Cotton",
    workType: "Plain Dyed",
    blouseIncluded: false,
    colorFamily: "Pastel Yellow",
    collectionName: "Summer Solace",
  },
  {
    slug: "bandhani-suits-tie-dye",
    title: "Traditional Rajasthani Bandhani Silk Suit",
    brandSlug: "traditional-threads",
    categorySlug: "bandhani-suits",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800",
    originalPrice: 7999,
    price: 6499,
    discount: 1500,
    stock: 18,
    sku: "MAN-BAND-008",
    tag: ["trending"],
    productType: "Suits",
    gender: "Women",
    occasion: "Festive",
    fabricType: "Art Silk",
    workType: "Tie & Dye Bandhej",
    blouseIncluded: false,
    colorFamily: "Mustard Orange",
    collectionName: "Festive Edit",
  },
];

const run = async () => {
  await connectDB();

  // 1. Wipe & Seed Brands
  await Brand.deleteMany({});
  console.log("Wiped legacy brands.");
  const createdBrands = await Brand.insertMany(BRANDS);
  console.log(`Inserted ${createdBrands.length} premium ethnic brands.`);

  const brandMap = {};
  createdBrands.forEach((b) => {
    brandMap[b.slug] = b._id;
  });

  // Get Categories Map
  const categories = await Category.find({});
  const categoryMap = {};
  categories.forEach((c) => {
    categoryMap[c.slug] = c._id;
  });

  const rootCategory = categories.find((c) => c.id === "Root");
  if (!rootCategory) {
    console.error("Root category not found. Run seedManchandaCategories.js first.");
    process.exit(1);
  }

  // 2. Wipe & Seed Products
  await Product.deleteMany({});
  console.log("Wiped legacy products.");

  const createdProductIds = [];
  const newArrivalIds = [];
  const trendingIds = [];

  for (const item of PRODUCTS) {
    const brandId = brandMap[item.brandSlug];
    const categoryId = categoryMap[item.categorySlug];

    if (!brandId || !categoryId) {
      console.warn(`Skipping product ${item.slug}: Brand or Category not found.`);
      continue;
    }

    const payload = {
      title: { en: item.title },
      description: {
        en: `${item.title} — Premium collection by Manchanda Fabrics. Sourced directly from master weavers.`,
      },
      slug: item.slug,
      category: categoryId,
      categories: [rootCategory._id, categoryId],
      brand: brandId,
      gender: item.gender,
      productType: item.productType,
      image: [item.image],
      stock: item.stock,
      sales: Math.floor(Math.random() * 50) + 10,
      sku: item.sku,
      tag: item.tag,
      prices: {
        originalPrice: item.originalPrice,
        price: item.price,
        discount: item.discount,
      },
      isCombination: false,
      variants: [],
      status: "show",
      taxRate: 5, // 5% GST standard on sarees/textiles
      isPriceInclusive: true,

      // Custom Manchanda Fields
      occasion: item.occasion,
      fabricType: item.fabricType,
      workType: item.workType,
      blouseIncluded: item.blouseIncluded,
      sareeLength: item.sareeLength || "",
      colorFamily: item.colorFamily,
      collectionName: item.collectionName,
    };

    const product = await Product.create(payload);
    console.log(`Created product: ${item.title}`);

    createdProductIds.push(product._id);
    if (item.tag.includes("new-arrival")) newArrivalIds.push(product._id);
    if (item.tag.includes("trending")) trendingIds.push(product._id);
  }

  // 3. Update homepage setting IDs
  const settingDoc = await Setting.findOne({ name: "storeCustomizationSetting" });
  if (settingDoc) {
    const hp = settingDoc.setting?.rasaHomepage || {};
    settingDoc.setting = {
      ...settingDoc.setting,
      rasaHomepage: {
        ...hp,
        newArrivalProductIds: newArrivalIds,
        trendingProductIds: trendingIds,
      },
    };
    settingDoc.markModified("setting");
    await settingDoc.save();
    console.log("Updated homepage settings with new arrival and trending product IDs.");
  }

  console.log(`\nSuccessfully seeded ${createdProductIds.length} premium products.`);
  await mongoose.connection.close();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
