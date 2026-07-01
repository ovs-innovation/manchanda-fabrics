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

export const resolveLineItemPricing = (item) => {
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
};

export const calculateInvoiceTotals = (cart = [], taxSummary = null) => {
  const lines = (cart || []).map(resolveLineItemPricing);

  const mrpTotal = lines.reduce(
    (sum, line) => sum + line.listPrice * line.quantity,
    0
  );
  const totalDiscount = lines.reduce(
    (sum, line) => sum + line.discountTotal,
    0
  );
  const totalGst =
    taxSummary?.exclusiveTax > 0
      ? toAmount(taxSummary.exclusiveTax)
      : lines.reduce((sum, line) => sum + line.gstAmount, 0);

  return {
    lines,
    mrpTotal,
    totalDiscount,
    totalGst,
  };
};

export default resolveLineItemPricing;
