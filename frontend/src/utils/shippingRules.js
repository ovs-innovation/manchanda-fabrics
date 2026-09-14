// Shipping rate card for Manchanda Fabrics
// Ship cost for Delhi:
// 1: 80, 2: 120, 3: 160, 4: 200, 5: 250, 6: 300, 7: 350, 8: 400, 9: 450, 10: 500
// Ship cost out of Delhi:
// 1: 100, 2: 180, 3: 250, 4: 300, 5: 350, 6: 400, 7: 450, 8: 500, 9: 550, 10: 600

export const INDIAN_STATES = [
  "Delhi",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

export const DELHI_SHIPPING_RATES = {
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

export const OUT_OF_DELHI_SHIPPING_RATES = {
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

/**
 * Checks if a given location is within Delhi.
 * Checks state, city, PIN code (Delhi pincodes start with 11), and street address.
 */
export const isDelhiLocation = (destination = {}) => {
  if (!destination) return false;
  if (typeof destination === "string") {
    const str = destination.trim().toLowerCase();
    return str === "delhi" || str.includes("delhi") || str.startsWith("11");
  }

  const { state = "", city = "", zipCode = "", address = "" } = destination;
  const s = String(state || "").trim().toLowerCase();
  const c = String(city || "").trim().toLowerCase();
  const z = String(zipCode || "").trim();
  const a = String(address || "").trim().toLowerCase();

  // All 6-digit Delhi PIN codes start with 11 (110001 - 110099)
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

/**
 * Checks whether user has provided enough address information (state, city, or pincode)
 * to determine shipping cost.
 */
export const hasAddressInfo = (destination = {}) => {
  if (!destination) return false;
  if (typeof destination === "string") return destination.trim().length > 0;

  const { state = "", city = "", zipCode = "", address = "" } = destination;
  return Boolean(
    (state && String(state).trim().length > 0) ||
    (city && String(city).trim().length > 0) ||
    (zipCode && String(zipCode).trim().length >= 2) ||
    (address && String(address).trim().length >= 4)
  );
};

/**
 * Calculates shipping cost based on item quantity and destination.
 * Returns null if address has not been provided yet (so UI can show "Enter address to calculate").
 * @param {number} totalQuantity - total items count across cart
 * @param {object|string} destination - { state, city, zipCode, address } or state string
 * @param {boolean} requireAddress - if true and no address info given, returns null
 */
export const calculateShipping = (totalQuantity = 1, destination = null, requireAddress = true) => {
  const qty = Math.max(0, parseInt(totalQuantity, 10) || 0);
  if (qty === 0) return 0;

  if (requireAddress && !hasAddressInfo(destination)) {
    return null; // Not calculated yet
  }

  const isDelhi = isDelhiLocation(destination);

  if (isDelhi) {
    if (qty <= 10) {
      return DELHI_SHIPPING_RATES[qty] ?? 80;
    }
    return 500 + (qty - 10) * 50;
  } else {
    if (qty <= 10) {
      return OUT_OF_DELHI_SHIPPING_RATES[qty] ?? 100;
    }
    return 600 + (qty - 10) * 50;
  }
};
