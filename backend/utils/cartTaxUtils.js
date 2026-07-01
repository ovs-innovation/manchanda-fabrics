const mongoose = require("mongoose");
const Product = require("../models/Product");
const { normalizeCartItemPricing } = require("./invoicePricing");

const DEFAULT_SHIPROCKET_HSN =
  process.env.SHIPROCKET_DEFAULT_HSN?.trim() || "3305";

async function populateCartTaxFields(cart) {
  if (!cart || cart.length === 0) return cart;

  const productIds = [
    ...new Set(
      cart
        .filter((item) => item.productId || item.id || item._id)
        .map((item) => item.productId || item.id || item._id)
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
    ),
  ];

  if (productIds.length === 0) return cart;

  const products = await Product.find({ _id: { $in: productIds } }).select(
    "_id taxRate hsnCode prices"
  );

  const productMap = {};
  products.forEach((product) => {
    productMap[product._id.toString()] = {
      taxRate: product.taxRate || 0,
      hsnCode: product.hsnCode || "",
      prices: product.prices || {},
      price: product.prices?.price || 0,
      originalPrice:
        product.prices?.originalPrice || product.prices?.price || 0,
    };
  });

  return cart.map((item) => {
    const productId = item.productId || item.id || item._id;
    const productKey = productId?.toString?.();
    const productData =
      productKey && productMap[productKey] ? productMap[productKey] : null;

    const merged = {
      ...item,
      taxRate: item.taxRate ?? productData?.taxRate,
      hsn: item.hsn || item.hsnCode || productData?.hsnCode,
      prices: item.prices || productData?.prices,
      price: item.price || productData?.price,
      originalPrice: item.originalPrice || productData?.originalPrice,
      mrp: item.mrp || productData?.originalPrice || productData?.price,
    };

    return normalizeCartItemPricing(merged, productData);
  });
}

function normalizeToken(value) {
  if (value === undefined || value === null) return "";
  return String(value).trim();
}

function resolveLineItemHsn(item) {
  const hsn = normalizeToken(item?.hsn || item?.hsnCode);
  return hsn || DEFAULT_SHIPROCKET_HSN;
}

async function enrichOrderItemsForShiprocket(orderItems = [], cart = []) {
  let enrichedCart = cart;
  if (cart?.length) {
    enrichedCart = await populateCartTaxFields(cart);
  }

  const cartByKey = new Map();
  (enrichedCart || []).forEach((item, index) => {
    const keys = [
      item.sku,
      item.productId?.toString?.(),
      item.id?.toString?.(),
      item._id?.toString?.(),
      `index:${index}`,
    ].filter(Boolean);
    keys.forEach((key) => cartByKey.set(String(key), item));
  });

  return (orderItems || []).map((item, index) => {
    const cartMatch =
      cartByKey.get(String(item.sku)) ||
      cartByKey.get(`index:${index}`) ||
      enrichedCart[index];

    const merged = { ...(cartMatch || {}), ...item };
    return {
      name: merged.name || merged.title || `Item-${index + 1}`,
      sku: merged.sku || merged.id || merged._id || `SKU-${index + 1}`,
      units: merged.units ?? merged.quantity ?? 1,
      selling_price: (
        merged.selling_price ??
        merged.price ??
        merged.unit_price ??
        0
      ).toString(),
      discount: merged.discount ?? "",
      tax: merged.tax ?? "",
      hsn: resolveLineItemHsn(merged),
    };
  });
}

module.exports = {
  populateCartTaxFields,
  enrichOrderItemsForShiprocket,
  resolveLineItemHsn,
  DEFAULT_SHIPROCKET_HSN,
};
