// Shipping rate card for Manchanda Fabrics (Backend)
// Ship cost for Delhi:
// 1: 80, 2: 120, 3: 160, 4: 200, 5: 250, 6: 300, 7: 350, 8: 400, 9: 450, 10: 500
// Ship cost out of Delhi:
// 1: 100, 2: 180, 3: 250, 4: 300, 5: 350, 6: 400, 7: 450, 8: 500, 9: 550, 10: 600

const DELHI_SHIPPING_RATES = {
  1: 80,
  2: 120,
  3: 160,
  4: 200,
  5: 250,
  6: 300,
  7: 350,
  8: 400,
  9: 450,
  10: 500,
};

const OUT_OF_DELHI_SHIPPING_RATES = {
  1: 100,
  2: 180,
  3: 250,
  4: 300,
  5: 350,
  6: 400,
  7: 450,
  8: 500,
  9: 550,
  10: 600,
};

const isDelhiLocation = (destination = {}) => {
  if (!destination) return false;
  if (typeof destination === "string") {
    const str = destination.trim().toLowerCase();
    return str === "delhi" || str.includes("delhi") || str.startsWith("11");
  }

  const { state = "", city = "", zipCode = "", zip = "", address = "" } = destination;
  const s = String(state || "").trim().toLowerCase();
  const c = String(city || "").trim().toLowerCase();
  const z = String(zipCode || zip || "").trim();
  const a = String(address || "").trim().toLowerCase();

  if (/^11\d{4}$/.test(z) || (z.length >= 2 && z.startsWith("11"))) {
    return true;
  }
  if (s === "delhi" || s.includes("delhi") || s.includes("nct")) {
    return true;
  }
  if (c === "delhi" || c === "new delhi" || c.includes("delhi")) {
    return true;
  }
  if (a.includes("delhi") && (s === "" || s.includes("delhi"))) {
    return true;
  }
  return false;
};

const calculateShipping = (totalQuantity = 1, destination = null) => {
  const qty = Math.max(0, parseInt(totalQuantity, 10) || 0);
  if (qty === 0) return 0;

  const isDelhi = isDelhiLocation(destination);

  if (isDelhi) {
    if (qty <= 10) return DELHI_SHIPPING_RATES[qty] ?? 80;
    return 500 + (qty - 10) * 50;
  } else {
    if (qty <= 10) return OUT_OF_DELHI_SHIPPING_RATES[qty] ?? 100;
    return 600 + (qty - 10) * 50;
  }
};

module.exports = {
  DELHI_SHIPPING_RATES,
  OUT_OF_DELHI_SHIPPING_RATES,
  isDelhiLocation,
  calculateShipping,
};
