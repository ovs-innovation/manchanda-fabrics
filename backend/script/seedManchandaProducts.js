/**
 * Seeds Manchanda products from database categories (one product per category).
 * Product titles match category names; images cycle /h1–h6 and /p1–p15.
 *
 * Usage:
 *   node backend/script/seedManchandaProducts.js
 *   node backend/script/seedManchandaProducts.js --upsert
 *   node backend/script/seedManchandaProducts.js --refresh-images
 */
require("../config/env");
const mongoose = require("mongoose");
const { connectDB } = require("../config/db");
const Product = require("../models/Product");
const Category = require("../models/Category");
const Brand = require("../models/Brand");
const Setting = require("../models/Setting");
const { withManchandaHomepage } = require("../lib/homepage-settings");

const HERO_IMAGES = [1, 2, 3, 4, 5, 6].map((n) => `/h${n}.jpeg`);
const CATALOG_IMAGES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map(
  (n) => `/p${n}.jpeg`
);
const ALL_PRODUCT_IMAGES = [...HERO_IMAGES, ...CATALOG_IMAGES];

const productImageAt = (index) =>
  ALL_PRODUCT_IMAGES[index % ALL_PRODUCT_IMAGES.length];

const PARENT_CATEGORY_SLUGS = new Set(["sarees", "suits", "fabrics"]);

const BRANDS = [
  { name: { en: "Royal Weaves" }, slug: "royal-weaves", status: "show" },
  { name: { en: "Traditional Threads" }, slug: "traditional-threads", status: "show" },
  { name: { en: "Utsav Silks" }, slug: "utsav-silks", status: "show" },
  { name: { en: "Loom Heritage" }, slug: "loom-heritage", status: "show" },
];

/** Categories that may be missing from an older category seed */
const EXTRA_CATEGORIES = [
  {
    status: "show",
    name: { en: "Crush Tissue" },
    parentId: "suits",
    parentName: "Suits",
    slug: "crush-tissue",
    description: { en: "Elegant Crush Tissue suits." },
  },
  {
    status: "show",
    name: { en: "Pakistani Style Suits" },
    parentId: "suits",
    parentName: "Suits",
    slug: "pakistani-style-suits",
    description: { en: "Graceful Pakistani style suit sets." },
  },
];

const buildProductsFromCategories = (categories) => {
  const leaf = categories
    .filter(
      (c) => c.slug && c.id !== "Root" && !PARENT_CATEGORY_SLUGS.has(c.slug)
    )
    .sort((a, b) => (a.name?.en || "").localeCompare(b.name?.en || ""));

  const brandSlugs = BRANDS.map((b) => b.slug);

  return leaf.map((cat, index) => {
    const name = cat.name?.en || cat.slug;
    const isSilk = /silk|kanjivaram|bangalori/i.test(name);
    const isPremium = /party|organza|georgette|applique|crush|pakistani/i.test(
      name
    );
    const originalPrice = isSilk ? 14999 : isPremium ? 9999 : 5499;
    const price = Math.round(originalPrice * 0.82);

    return {
      slug: cat.slug,
      title: name,
      brandSlug: brandSlugs[index % brandSlugs.length],
      categorySlug: cat.slug,
      originalPrice,
      price,
      discount: originalPrice - price,
      stock: 18 + (index % 12),
      sku: `MAN-${String(cat.slug).replace(/-/g, "").slice(0, 10).toUpperCase()}-001`,
      tag:
        index < 4
          ? ["new-arrival", "trending"]
          : index < 10
            ? ["trending"]
            : ["featured"],
      productType: cat.parentName || "Suits",
      gender: "Women",
      occasion: isPremium || isSilk ? "Festive" : "Casual",
      fabricType: name,
      workType: "Premium Craft",
      colorFamily: "Assorted",
      collectionName: "Manchanda Collection",
    };
  });
};

const UPSERT_ONLY = process.argv.includes("--upsert");
const REFRESH_IMAGES = process.argv.includes("--refresh-images");

const run = async () => {
  await connectDB();

  if (REFRESH_IMAGES) {
    const products = await Product.find({}).sort({ createdAt: 1 }).select("_id slug");
    for (let i = 0; i < products.length; i++) {
      const img = productImageAt(i);
      await Product.updateOne(
        { _id: products[i]._id },
        { $set: { image: [img], featuredImage: img, hoverImage: img } }
      );
      console.log(`Updated ${products[i].slug} -> ${img}`);
    }
    console.log(
      `Refreshed images for ${products.length} products (h1-h6 + p1-p15).`
    );
    await mongoose.connection.close();
    return;
  }

  // 1. Brands
  let createdBrands;
  if (UPSERT_ONLY) {
    createdBrands = await Brand.find({});
    for (const b of BRANDS) {
      const existing = createdBrands.find((x) => x.slug === b.slug);
      if (!existing) {
        const created = await Brand.create(b);
        createdBrands.push(created);
        console.log(`Created brand: ${b.name.en}`);
      }
    }
  } else {
    await Brand.deleteMany({});
    console.log("Wiped legacy brands.");
    createdBrands = await Brand.insertMany(BRANDS);
    console.log(`Inserted ${createdBrands.length} premium ethnic brands.`);
  }

  const brandMap = {};
  createdBrands.forEach((b) => {
    brandMap[b.slug] = b._id;
  });

  // 2. Ensure all catalog categories exist
  for (const cat of EXTRA_CATEGORIES) {
    const exists = await Category.findOne({ slug: cat.slug }).select("_id");
    if (!exists) {
      await Category.create(cat);
      console.log(`Created category: ${cat.name.en}`);
    }
  }

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

  const productDefs = buildProductsFromCategories(categories);
  console.log(`Building ${productDefs.length} products from category names.`);

  // 3. Seed products
  if (!UPSERT_ONLY) {
    await Product.deleteMany({});
    console.log("Wiped legacy products.");
  } else {
    console.log("Upsert mode: adding or updating products by category slug.");
  }

  const createdProductIds = [];
  const newArrivalIds = [];
  const trendingIds = [];

  for (let i = 0; i < productDefs.length; i++) {
    const item = productDefs[i];
    const brandId = brandMap[item.brandSlug];
    const categoryId = categoryMap[item.categorySlug];
    const img = productImageAt(i);

    if (!brandId || !categoryId) {
      console.warn(`Skipping product ${item.slug}: Brand or Category not found.`);
      continue;
    }

    const payload = {
      title: { en: item.title },
      description: {
        en: `${item.title} — Premium ${item.fabricType} by Manchanda Fabrics. Sourced directly from master weavers.`,
      },
      slug: item.slug,
      category: categoryId,
      categories: [rootCategory._id, categoryId],
      brand: brandId,
      gender: item.gender,
      productType: item.productType,
      image: [img],
      featuredImage: img,
      hoverImage: img,
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
      taxRate: 5,
      isPriceInclusive: true,
      occasion: item.occasion,
      fabricType: item.fabricType,
      workType: item.workType,
      blouseIncluded: false,
      suitLength: "",
      colorFamily: item.colorFamily,
      collectionName: item.collectionName,
    };

    if (UPSERT_ONLY) {
      const existing = await Product.findOne({ slug: item.slug }).select("_id");
      if (existing) {
        await Product.updateOne({ _id: existing._id }, { $set: payload });
        console.log(`Updated product: ${item.title}`);
        createdProductIds.push(existing._id);
        if (item.tag.includes("new-arrival")) newArrivalIds.push(existing._id);
        if (item.tag.includes("trending")) trendingIds.push(existing._id);
        continue;
      }
    }

    const product = await Product.create(payload);
    console.log(`Created product: ${item.title} (${img})`);
    createdProductIds.push(product._id);
    if (item.tag.includes("new-arrival")) newArrivalIds.push(product._id);
    if (item.tag.includes("trending")) trendingIds.push(product._id);
  }

  // 4. Homepage product picks
  const settingDoc = await Setting.findOne({ name: "storeCustomizationSetting" });
  if (settingDoc) {
    settingDoc.setting = withManchandaHomepage(settingDoc.setting, {
      newArrivalProductIds: newArrivalIds,
      trendingProductIds: trendingIds,
    });
    settingDoc.markModified("setting");
    await settingDoc.save();
    console.log("Updated homepage settings with new arrival and trending product IDs.");
  }

  console.log(`\nSuccessfully seeded ${createdProductIds.length} category products.`);
  await mongoose.connection.close();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
