/**
 * Comprehensive Indian Ethnic & Fabric Color Catalog
 * Specifically designed for garments, sarees, suits, dupattas, and fabrics.
 * Includes extensive shade variations (e.g., diverse pinks, greens, reds, blues, etc.)
 */

export const COLOR_FAMILIES = [
  "All",
  "Pink",
  "Red & Wine",
  "Green",
  "Blue",
  "Yellow & Gold",
  "Orange & Peach",
  "Purple & Lavender",
  "Neutral & Metallic",
];

export const FABRIC_COLORS = [
  // =================== PINKS ===================
  { name: "Rani Pink", hex: "#E3007E", family: "Pink", popular: true },
  { name: "Baby Pink", hex: "#F4C2C2", family: "Pink", popular: true },
  { name: "Blush Pink", hex: "#FE828C", family: "Pink", popular: true },
  { name: "Dusty Rose", hex: "#DCAE96", family: "Pink", popular: true },
  { name: "Peach Pink", hex: "#F68B7A", family: "Pink", popular: true },
  { name: "Hot Pink", hex: "#FF69B4", family: "Pink", popular: true },
  { name: "Pastel Pink", hex: "#FFD1DC", family: "Pink" },
  { name: "Fuchsia Pink", hex: "#FF007F", family: "Pink", popular: true },
  { name: "Magenta", hex: "#CA1F7B", family: "Pink", popular: true },
  { name: "Powder Pink", hex: "#FFE4E1", family: "Pink" },
  { name: "Coral Pink", hex: "#F88379", family: "Pink" },
  { name: "Onion Pink", hex: "#C4717A", family: "Pink", popular: true },
  { name: "Rose Gold", hex: "#B76E79", family: "Pink" },
  { name: "Watermelon Pink", hex: "#FC6C85", family: "Pink" },
  { name: "Bubblegum Pink", hex: "#FFC1CC", family: "Pink" },
  { name: "Mauve Pink", hex: "#C59DAA", family: "Pink" },
  { name: "Carnation Pink", hex: "#FFA6C9", family: "Pink" },
  { name: "Deep Ruby Pink", hex: "#9B111E", family: "Pink" },

  // =================== REDS & WINES ===================
  { name: "Bridal Red", hex: "#C41E3A", family: "Red & Wine", popular: true },
  { name: "Sindoor Red", hex: "#E34234", family: "Red & Wine", popular: true },
  { name: "Ruby Red", hex: "#E0115F", family: "Red & Wine", popular: true },
  { name: "Maroon", hex: "#800000", family: "Red & Wine", popular: true },
  { name: "Deep Wine", hex: "#722F37", family: "Red & Wine", popular: true },
  { name: "Cherry Red", hex: "#D2042D", family: "Red & Wine" },
  { name: "Crimson", hex: "#DC143C", family: "Red & Wine" },
  { name: "Burgundy", hex: "#800020", family: "Red & Wine", popular: true },
  { name: "Brick Red", hex: "#CB4154", family: "Red & Wine" },
  { name: "Scarlet", hex: "#FF2400", family: "Red & Wine" },
  { name: "Oxblood", hex: "#4A0000", family: "Red & Wine" },
  { name: "Rust Red", hex: "#B7410E", family: "Red & Wine" },

  // =================== GREENS ===================
  { name: "Pista Green", hex: "#93C572", family: "Green", popular: true },
  { name: "Mehndi Green", hex: "#7F8C42", family: "Green", popular: true },
  { name: "Bottle Green", hex: "#004B23", family: "Green", popular: true },
  { name: "Sage Green", hex: "#9DC183", family: "Green", popular: true },
  { name: "Mint Green", hex: "#98FF98", family: "Green" },
  { name: "Emerald Green", hex: "#50C878", family: "Green", popular: true },
  { name: "Sea Green", hex: "#2E8B57", family: "Green" },
  { name: "Teal Green", hex: "#00827F", family: "Green", popular: true },
  { name: "Parrot Green", hex: "#43B02A", family: "Green" },
  { name: "Olive Green", hex: "#556B2F", family: "Green" },
  { name: "Forest Green", hex: "#228B22", family: "Green" },
  { name: "Moss Green", hex: "#8A9A5B", family: "Green" },

  // =================== BLUES ===================
  { name: "Royal Blue", hex: "#4169E1", family: "Blue", popular: true },
  { name: "Navy Blue", hex: "#000080", family: "Blue", popular: true },
  { name: "Peacock Blue", hex: "#005F73", family: "Blue", popular: true },
  { name: "Sky Blue", hex: "#87CEEB", family: "Blue", popular: true },
  { name: "Powder Blue", hex: "#B0E0E6", family: "Blue" },
  { name: "Turquoise Blue", hex: "#40E0D0", family: "Blue", popular: true },
  { name: "Indigo Blue", hex: "#3F51B5", family: "Blue" },
  { name: "Midnight Blue", hex: "#191970", family: "Blue" },
  { name: "Ice Blue", hex: "#AFEEEE", family: "Blue" },
  { name: "Steel Blue", hex: "#4682B4", family: "Blue" },

  // =================== YELLOWS & GOLDS ===================
  { name: "Mustard Yellow", hex: "#E1AD01", family: "Yellow & Gold", popular: true },
  { name: "Haldi Yellow", hex: "#FFCC00", family: "Yellow & Gold", popular: true },
  { name: "Lemon Yellow", hex: "#FFF44F", family: "Yellow & Gold" },
  { name: "Golden Yellow", hex: "#FFD700", family: "Yellow & Gold", popular: true },
  { name: "Antique Gold", hex: "#C5A059", family: "Yellow & Gold", popular: true },
  { name: "Pastel Yellow", hex: "#FDFD96", family: "Yellow & Gold" },
  { name: "Ochre", hex: "#CC7722", family: "Yellow & Gold" },
  { name: "Honey", hex: "#E5A65D", family: "Yellow & Gold" },

  // =================== ORANGES & PEACHES ===================
  { name: "Rust Orange", hex: "#C45508", family: "Orange & Peach", popular: true },
  { name: "Peach", hex: "#FFE5B4", family: "Orange & Peach", popular: true },
  { name: "Tangerine", hex: "#FF851B", family: "Orange & Peach" },
  { name: "Coral", hex: "#FF7F50", family: "Orange & Peach", popular: true },
  { name: "Apricot", hex: "#FBCEB1", family: "Orange & Peach" },
  { name: "Burnt Orange", hex: "#CC5500", family: "Orange & Peach" },
  { name: "Terracotta", hex: "#E2725B", family: "Orange & Peach" },

  // =================== PURPLES & LAVENDERS ===================
  { name: "Lavender", hex: "#E6E6FA", family: "Purple & Lavender", popular: true },
  { name: "Lilac", hex: "#C8A2C8", family: "Purple & Lavender", popular: true },
  { name: "Mauve", hex: "#E0B0FF", family: "Purple & Lavender", popular: true },
  { name: "Plum", hex: "#8E4585", family: "Purple & Lavender", popular: true },
  { name: "Deep Purple", hex: "#6A0DAD", family: "Purple & Lavender" },
  { name: "Violet", hex: "#7F00FF", family: "Purple & Lavender" },
  { name: "Grape", hex: "#6F2DA8", family: "Purple & Lavender" },
  { name: "Jamun Purple", hex: "#4B1E4A", family: "Purple & Lavender" },

  // =================== NEUTRALS & METALLICS ===================
  { name: "Pure White", hex: "#FFFFFF", family: "Neutral & Metallic", popular: true },
  { name: "Off White", hex: "#FAF9F6", family: "Neutral & Metallic", popular: true },
  { name: "Ivory", hex: "#FFFFF0", family: "Neutral & Metallic", popular: true },
  { name: "Cream", hex: "#FFFDD0", family: "Neutral & Metallic", popular: true },
  { name: "Beige", hex: "#F5F5DC", family: "Neutral & Metallic", popular: true },
  { name: "Nude", hex: "#E3BC9A", family: "Neutral & Metallic" },
  { name: "Champagne", hex: "#F7E7CE", family: "Neutral & Metallic", popular: true },
  { name: "Silver", hex: "#C0C0C0", family: "Neutral & Metallic" },
  { name: "Copper", hex: "#B87333", family: "Neutral & Metallic" },
  { name: "Coffee Brown", hex: "#4A2E18", family: "Neutral & Metallic", popular: true },
  { name: "Chocolate Brown", hex: "#7B3F00", family: "Neutral & Metallic" },
  { name: "Tan", hex: "#D2B48C", family: "Neutral & Metallic" },
  { name: "Charcoal Grey", hex: "#36454F", family: "Neutral & Metallic", popular: true },
  { name: "Slate Grey", hex: "#708090", family: "Neutral & Metallic" },
  { name: "Jet Black", hex: "#000000", family: "Neutral & Metallic", popular: true },
];

/**
 * Convert hex string (#ffffff or #fff) to RGB object { r, g, b }
 */
export const hexToRgb = (hex) => {
  if (!hex || typeof hex !== "string") return null;
  let clean = hex.replace("#", "").trim();
  if (clean.length === 3) {
    clean = clean
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (clean.length !== 6) return null;
  const num = parseInt(clean, 16);
  if (isNaN(num)) return null;
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
};

/**
 * Normalize hex string to standard 6-char uppercase (#RRGGBB)
 */
export const normalizeHex = (hex) => {
  if (!hex || typeof hex !== "string") return "";
  let clean = hex.replace(/[^0-9A-Fa-f]/g, "");
  if (clean.length === 3) {
    clean = clean
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (clean.length >= 6) {
    return `#${clean.substring(0, 6).toUpperCase()}`;
  }
  return hex.startsWith("#") ? hex : `#${hex}`;
};

/**
 * Find the closest named fabric color for any arbitrary hex code
 */
export const findClosestFabricColor = (hex) => {
  const targetRgb = hexToRgb(hex);
  if (!targetRgb) return null;

  let closest = null;
  let minDistance = Infinity;

  FABRIC_COLORS.forEach((color) => {
    const rgb = hexToRgb(color.hex);
    if (!rgb) return;
    // Euclidean distance in RGB color space
    const distance = Math.sqrt(
      Math.pow(targetRgb.r - rgb.r, 2) +
      Math.pow(targetRgb.g - rgb.g, 2) +
      Math.pow(targetRgb.b - rgb.b, 2)
    );
    if (distance < minDistance) {
      minDistance = distance;
      closest = color;
    }
  });

  return closest;
};
