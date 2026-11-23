require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../../models/Product");

/**
 * Extracts a candidate product ObjectId string from a cart item.
 * Prioritizes item.productId and item.id over item._id because
 * Mongoose assigns a new random subdocument _id when an order is saved.
 */
const resolveProductId = (item) => {
  if (!item) return null;

  // 1. Prefer explicit productId
  if (item.productId) {
    const pid = typeof item.productId === "object" ? item.productId._id || item.productId.id : item.productId;
    const clean = String(pid || "").split("-")[0].trim();
    if (clean && mongoose.Types.ObjectId.isValid(clean)) return clean;
  }

  // 2. Next check item.id (frontend puts `${product._id}-${variantKey}` in item.id)
  if (item.id) {
    const clean = String(item.id).split("-")[0].trim();
    if (clean && mongoose.Types.ObjectId.isValid(clean)) return clean;
  }

  // 3. Fallback to item._id
  if (item._id) {
    const clean = String(item._id).split("-")[0].trim();
    if (clean && mongoose.Types.ObjectId.isValid(clean)) return clean;
  }

  return null;
};

/**
 * Reliably finds the Product document in MongoDB for a given cart item.
 * Tries multiple candidates and fallbacks so stock is never silently dropped.
 */
const findProductForItem = async (item) => {
  if (!item) return null;

  const candidates = [];

  // item.productId
  if (item.productId) {
    const pid = typeof item.productId === "object" ? item.productId._id || item.productId.id : item.productId;
    if (pid) candidates.push(String(pid).split("-")[0].trim());
  }

  // item.id
  if (item.id) {
    const idPrefix = String(item.id).split("-")[0].trim();
    if (idPrefix) candidates.push(idPrefix);
  }

  // item._id
  if (item._id) {
    const idPrefix = String(item._id).split("-")[0].trim();
    if (idPrefix) candidates.push(idPrefix);
  }

  // 1. Try finding by valid ObjectId candidates in priority order
  for (const cand of candidates) {
    if (cand && mongoose.Types.ObjectId.isValid(cand) && String(new mongoose.Types.ObjectId(cand)) === cand) {
      const prod = await Product.findById(cand);
      if (prod) return prod;
    }
  }

  // 2. Fallback: try by slug
  if (item.slug && typeof item.slug === "string") {
    const prod = await Product.findOne({ slug: item.slug.trim() });
    if (prod) return prod;
  }

  // 3. Fallback: try by sku
  if (item.sku && typeof item.sku === "string") {
    const prod = await Product.findOne({ sku: item.sku.trim() });
    if (prod) return prod;
  }

  // 4. Fallback: try by base title
  if (item.title) {
    const baseTitle = String(item.title).split(" - ")[0].split("-")[0].trim();
    if (baseTitle && baseTitle.length > 2) {
      const prod = await Product.findOne({
        $or: [
          { "title.en": baseTitle },
          { "title.hi": baseTitle },
          { title: baseTitle },
        ],
      });
      if (prod) return prod;
    }
  }

  return null;
};

/**
 * Finds the matching variant in product.colorVariants for a given cart item.
 * Supports colors, design/patterns, item.id suffix, image matching, and fallback.
 */
const findMatchedColorVariant = (product, item) => {
  if (!product?.colorVariants || !Array.isArray(product.colorVariants) || product.colorVariants.length === 0) {
    return null;
  }

  const variants = product.colorVariants;

  const itemColor = (item.color || item.colorName || "").trim().toLowerCase();
  const itemDesign = (item.designName || item.design || "").trim().toLowerCase();
  const itemVariantColor = (item.variant?.color || item.variant?.colorName || "").trim().toLowerCase();
  const itemVariantId = item.variant?._id || item.variantId || item.colorVariantId;

  // Suffix from item.id (e.g. "6745...-Royal Blue" -> "royal blue")
  let idSuffix = "";
  if (item.id && String(item.id).includes("-")) {
    idSuffix = String(item.id).split("-").slice(1).join("-").trim().toLowerCase();
  }

  const itemTitle = (item.title || "").toLowerCase();

  // 1. Match by variant _id if provided
  if (itemVariantId) {
    const byId = variants.find((v) => String(v._id) === String(itemVariantId));
    if (byId) return byId;
  }

  // 2. Exact match on colorName or designName
  const exactKey = itemColor || itemDesign || itemVariantColor;
  if (exactKey) {
    const byExact = variants.find((v) => {
      const cName = (v.colorName || "").trim().toLowerCase();
      const dName = (v.designName || "").trim().toLowerCase();
      return (cName && cName === exactKey) || (dName && dName === exactKey);
    });
    if (byExact) return byExact;
  }

  // 3. Match using ID suffix
  if (idSuffix) {
    const bySuffix = variants.find((v) => {
      const cName = (v.colorName || "").trim().toLowerCase();
      const dName = (v.designName || "").trim().toLowerCase();
      return (cName && cName === idSuffix) || (dName && dName === idSuffix);
    });
    if (bySuffix) return bySuffix;
  }

  // 4. Substring match in title
  const byTitle = variants.find((v) => {
    const cName = (v.colorName || "").trim().toLowerCase();
    const dName = (v.designName || "").trim().toLowerCase();
    return (
      (cName && cName.length > 2 && itemTitle.includes(cName)) ||
      (dName && dName.length > 2 && itemTitle.includes(dName))
    );
  });
  if (byTitle) return byTitle;

  // 5. Match by image
  if (item.image) {
    const byImage = variants.find(
      (v) => Array.isArray(v.images) && v.images.some((img) => img === item.image)
    );
    if (byImage) return byImage;
  }

  // 6. If only 1 variant exists, match it
  if (variants.length === 1) {
    return variants[0];
  }

  // 7. Fallback: match first variant with sufficient stock
  const qty = Number(item.quantity) || 1;
  const inStockVar =
    variants.find((v) => Number(v.stock || 0) >= qty) ||
    variants.find((v) => Number(v.stock || 0) > 0);
  if (inStockVar) return inStockVar;

  // 8. Default fallback
  return variants[0];
};

const isNestedVariants = (variants = []) =>
  Array.isArray(variants) &&
  variants.some((v) => v && typeof v === "object" && Array.isArray(v.sizes));

const getVariantQuantity = (product, variantRef) => {
  if (!product || !variantRef) return null;

  const variantId = variantRef.productId || variantRef._id || variantRef.id;
  const color = variantRef.color;
  const size = variantRef.size;
  const sku = variantRef.sku;

  if (Array.isArray(product.variantFilters) && product.variantFilters.length > 0) {
    const match = product.variantFilters.find((vf) => {
      if (sku && vf.sku === sku) return true;
      if (
        color &&
        size &&
        vf.attributes?.color === color &&
        vf.attributes?.size === size
      ) {
        return true;
      }
      if (variantId && vf.sku && String(vf.sku) === String(variantId)) return true;
      return false;
    });
    if (match) return Number(match.quantity || 0);
  }

  const variants = product.variants || [];
  if (isNestedVariants(variants)) {
    for (const colorVar of variants) {
      const colorName = colorVar.color || colorVar.colorName;
      for (const sizeVar of colorVar.sizes || []) {
        const matches =
          (variantId &&
            (String(sizeVar._id) === String(variantId) ||
              String(sizeVar.sku) === String(variantId))) ||
          (sku && sizeVar.sku === sku) ||
          (color && size && colorName === color && sizeVar.size === size);
        if (matches) return Number(sizeVar.quantity ?? sizeVar.stock ?? 0);
      }
    }
    return null;
  }

  const flat = variants.find((v) => {
    const vid = v.productId || v._id || v.id;
    return (
      (variantId && String(vid) === String(variantId)) ||
      (color && size && v.color === color && v.size === size) ||
      (sku && v.sku === sku)
    );
  });
  if (flat) return Number(flat.quantity ?? flat.stock ?? 0);
  return null;
};

const decrementVariantStock = (product, variantRef, quantity) => {
  const variantId = variantRef?.productId || variantRef?._id || variantRef?.id;
  const color = variantRef?.color;
  const size = variantRef?.size;
  const sku = variantRef?.sku;
  let updated = false;

  if (Array.isArray(product.variantFilters) && product.variantFilters.length > 0) {
    product.variantFilters = product.variantFilters.map((vf) => {
      const matches =
        (sku && vf.sku === sku) ||
        (color &&
          size &&
          vf.attributes?.color === color &&
          vf.attributes?.size === size) ||
        (variantId && vf.sku && String(vf.sku) === String(variantId));
      if (!matches) return vf;
      updated = true;
      const nextQty = Math.max(0, Number(vf.quantity || 0) - quantity);
      return { ...vf, quantity: nextQty };
    });
  }

  if (isNestedVariants(product.variants)) {
    product.variants = product.variants.map((colorVar) => {
      const colorName = colorVar.color || colorVar.colorName;
      const sizes = (colorVar.sizes || []).map((sizeVar) => {
        const matches =
          (variantId &&
            (String(sizeVar._id) === String(variantId) ||
              String(sizeVar.sku) === String(variantId))) ||
          (sku && sizeVar.sku === sku) ||
          (color && size && colorName === color && sizeVar.size === size);
        if (!matches) return sizeVar;
        updated = true;
        const nextQty = Math.max(
          0,
          Number(sizeVar.quantity ?? sizeVar.stock ?? 0) - quantity
        );
        return { ...sizeVar, quantity: nextQty, stock: nextQty };
      });
      return { ...colorVar, sizes };
    });
  } else if (Array.isArray(product.variants) && product.variants.length > 0) {
    product.variants = product.variants.map((v) => {
      const vid = v.productId || v._id || v.id;
      const matches =
        (variantId && String(vid) === String(variantId)) ||
        (color && size && v.color === color && v.size === size) ||
        (sku && v.sku === sku);
      if (!matches) return v;
      updated = true;
      const nextQty = Math.max(0, Number(v.quantity ?? v.stock ?? 0) - quantity);
      return { ...v, quantity: nextQty, stock: nextQty };
    });
  }

  return updated;
};

const hasVariantSelection = (item) =>
  Boolean(
    item?.isCombination ||
      (item?.variant &&
        typeof item.variant === "object" &&
        Object.keys(item.variant).length > 0 &&
        (item.variant._id ||
          item.variant.productId ||
          item.variant.color ||
          item.variant.size ||
          item.variant.sku))
  );

/**
 * Decrements product and variant inventory stock after an order is successfully created or paid.
 */
const handleProductQuantity = async (cart) => {
  try {
    if (!cart || !Array.isArray(cart)) return;

    for (const p of cart) {
      const product = await findProductForItem(p);
      if (!product) {
        console.error("handleProductQuantity: product not found for item", p?.id || p?._id || p?.title);
        continue;
      }

      const qty = Math.max(1, Number(p.quantity || 1));

      // Case 1: Product has color or design variants
      if (Array.isArray(product.colorVariants) && product.colorVariants.length > 0) {
        const matchedVariant = findMatchedColorVariant(product, p);
        if (matchedVariant) {
          const oldStock = Number(matchedVariant.stock || 0);
          matchedVariant.stock = Math.max(0, oldStock - qty);
          console.log(`[Stock Decrement] Product "${product.title?.en || product._id}" variant "${matchedVariant.colorName || matchedVariant.designName}": ${oldStock} -> ${matchedVariant.stock} (-${qty})`);
        } else {
          const first = product.colorVariants[0];
          first.stock = Math.max(0, Number(first.stock || 0) - qty);
        }

        // Always recalculate overall product stock from sum of variants
        product.stock = product.colorVariants.reduce(
          (sum, cv) => sum + Math.max(0, Number(cv.stock || 0)),
          0
        );
        product.sales = Number(product.sales || 0) + qty;
        product.markModified("colorVariants");
        await product.save();
      }
      // Case 2: Combination products with legacy variants
      else if (hasVariantSelection(p) || (Array.isArray(product.variants) && product.variants.length > 0)) {
        decrementVariantStock(product, p.variant || p, qty);
        product.stock = Math.max(0, Number(product.stock || 0) - qty);
        product.sales = Number(product.sales || 0) + qty;
        product.markModified("variants");
        product.markModified("variantFilters");
        await product.save();
      }
      // Case 3: Simple product without variants
      else {
        const oldStock = Number(product.stock || 0);
        product.stock = Math.max(0, oldStock - qty);
        product.sales = Number(product.sales || 0) + qty;
        await product.save();
        console.log(`[Stock Decrement] Product "${product.title?.en || product._id}": ${oldStock} -> ${product.stock} (-${qty})`);
      }
    }
  } catch (err) {
    console.error("err on handleProductQuantity:", err.message);
  }
};

/**
 * Restores product and variant inventory stock when an order is Cancelled or Refunded.
 */
const restoreProductQuantity = async (cart) => {
  try {
    if (!cart || !Array.isArray(cart)) return;

    for (const p of cart) {
      const product = await findProductForItem(p);
      if (!product) {
        console.warn("restoreProductQuantity: product not found for item", p?.id || p?._id || p?.title);
        continue;
      }

      const qty = Math.max(1, Number(p.quantity || 1));

      // Case 1: Product has color or design variants
      if (Array.isArray(product.colorVariants) && product.colorVariants.length > 0) {
        const matchedVariant = findMatchedColorVariant(product, p);
        if (matchedVariant) {
          const oldStock = Number(matchedVariant.stock || 0);
          matchedVariant.stock = oldStock + qty;
          console.log(`[Stock Restored] Product "${product.title?.en || product._id}" variant "${matchedVariant.colorName || matchedVariant.designName}": ${oldStock} -> ${matchedVariant.stock} (+${qty})`);
        } else {
          product.colorVariants[0].stock = Number(product.colorVariants[0].stock || 0) + qty;
        }

        // Always recalculate overall product stock
        product.stock = product.colorVariants.reduce(
          (sum, cv) => sum + Math.max(0, Number(cv.stock || 0)),
          0
        );
        product.sales = Math.max(0, Number(product.sales || 0) - qty);
        product.markModified("colorVariants");
        await product.save();
      }
      // Case 2: Combination products
      else if (hasVariantSelection(p) || (Array.isArray(product.variants) && product.variants.length > 0)) {
        product.stock = Number(product.stock || 0) + qty;
        product.sales = Math.max(0, Number(product.sales || 0) - qty);
        product.markModified("variants");
        await product.save();
      }
      // Case 3: Simple product
      else {
        const oldStock = Number(product.stock || 0);
        product.stock = oldStock + qty;
        product.sales = Math.max(0, Number(product.sales || 0) - qty);
        await product.save();
        console.log(`[Stock Restored] Product "${product.title?.en || product._id}": ${oldStock} -> ${product.stock} (+${qty})`);
      }
    }
  } catch (err) {
    console.error("err on restoreProductQuantity:", err.message);
  }
};

/**
 * Validates stock availability for cart items before checkout/payment.
 */
const checkStock = async (cart) => {
  try {
    if (!cart || !Array.isArray(cart)) {
      return [];
    }
    const outOfStockItems = [];
    for (const item of cart) {
      const product = await findProductForItem(item);
      if (!product) {
        console.warn("checkStock: product not found for item", item?.id || item?._id);
        continue;
      }

      const reqQty = Math.max(1, Number(item.quantity || 1));

      // Case 1: Color / Design variants
      if (Array.isArray(product.colorVariants) && product.colorVariants.length > 0) {
        const matchedVariant = findMatchedColorVariant(product, item);
        if (matchedVariant) {
          const varStock = Number(matchedVariant.stock || 0);
          if (varStock < reqQty) {
            outOfStockItems.push({
              _id: product._id,
              id: item.id,
              title: `${item.title || product.title?.en || "Product"} (${matchedVariant.colorName || matchedVariant.designName || "Variant"})`,
              available: varStock,
              requested: reqQty,
            });
          }
        } else if (Number(product.stock || 0) < reqQty) {
          outOfStockItems.push({
            _id: product._id,
            id: item.id,
            title: item.title || product.title?.en || "Product",
            available: Number(product.stock || 0),
            requested: reqQty,
          });
        }
      }
      // Case 2: Legacy combination variants
      else if (hasVariantSelection(item)) {
        const available = getVariantQuantity(product, item.variant);
        if (available !== null && available < reqQty) {
          outOfStockItems.push({
            _id: product._id,
            id: item.id,
            title: item.title,
            available,
            requested: reqQty,
          });
        }
      }
      // Case 3: Simple product
      else if (Number(product.stock || 0) < reqQty) {
        outOfStockItems.push({
          _id: product._id,
          id: item.id,
          title: item.title || product.title?.en || "Product",
          available: Number(product.stock || 0),
          requested: reqQty,
        });
      }
    }
    return outOfStockItems;
  } catch (err) {
    console.error("err on checkStock:", err.message);
    return [];
  }
};

const handleProductAttribute = async (key, value, multi) => {
  try {
    const products = await Product.find({ isCombination: true });

    if (multi) {
      for (const p of products) {
        await Product.updateOne(
          { _id: p._id },
          {
            $pull: {
              variants: { [key]: { $in: value } },
            },
          }
        );
      }
    } else {
      for (const p of products) {
        await Product.updateOne(
          { _id: p._id },
          {
            $pull: {
              variants: { [key]: value },
            },
          }
        );
      }
    }
  } catch (err) {
    console.log("err, when delete product variants", err.message);
  }
};

module.exports = {
  handleProductQuantity,
  restoreProductQuantity,
  handleProductAttribute,
  checkStock,
  findProductForItem,
  findMatchedColorVariant,
  resolveProductId,
};
