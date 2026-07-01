const toAmount = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const pickNestedPrice = (item) => {
  if (!item || typeof item !== "object") return 0;
  return (
    toAmount(item.price) ||
    toAmount(item.prices?.price) ||
    toAmount(item.prices?.salePrice) ||
    toAmount(item.salePrice)
  );
};

const pickNestedOriginalPrice = (item) => {
  if (!item || typeof item !== "object") return 0;
  return (
    toAmount(item.originalPrice) ||
    toAmount(item.prices?.originalPrice) ||
    (toAmount(item.mrp) > 0 ? toAmount(item.mrp) : 0)
  );
};

function resolveLineItemPricing(item) {
  const quantity = toAmount(item?.quantity) || 1;
  const salePrice = pickNestedPrice(item);
  let listPrice = pickNestedOriginalPrice(item);

  if (listPrice <= 0) listPrice = salePrice;
  if (salePrice > 0 && listPrice < salePrice) listPrice = salePrice;

  const discountPerUnit = Math.max(0, listPrice - salePrice);
  const gstRate = toAmount(
    item?.taxRate ?? item?.gstRate ?? item?.gstPercentage ?? 0
  );
  const gstPerUnit = (salePrice * gstRate) / 100;
  const gstAmount = gstPerUnit * quantity;
  const discountTotal = discountPerUnit * quantity;
  const lineSubtotal = salePrice * quantity;
  const lineTotal =
    item?.itemTotal != null && toAmount(item.itemTotal) > 0
      ? toAmount(item.itemTotal)
      : lineSubtotal + gstAmount;

  return {
    quantity,
    salePrice,
    listPrice,
    rate: listPrice,
    discountPerUnit,
    discountTotal,
    gstRate,
    gstAmount,
    lineSubtotal,
    lineTotal,
  };
}

function normalizeCartItemPricing(item, product = null) {
  const merged = {
    ...item,
    price: pickNestedPrice(item) || pickNestedPrice(product),
    originalPrice:
      pickNestedOriginalPrice(item) || pickNestedOriginalPrice(product),
    mrp:
      pickNestedOriginalPrice(item) ||
      pickNestedOriginalPrice(product) ||
      pickNestedPrice(item) ||
      pickNestedPrice(product),
  };

  const pricing = resolveLineItemPricing(merged);

  return {
    ...merged,
    price: pricing.salePrice,
    originalPrice: pricing.listPrice,
    mrp: pricing.listPrice,
  };
}

function normalizeCartPricing(cart = []) {
  return (cart || []).map((item) => normalizeCartItemPricing(item));
}

module.exports = {
  resolveLineItemPricing,
  normalizeCartItemPricing,
  normalizeCartPricing,
  pickNestedPrice,
  pickNestedOriginalPrice,
};
