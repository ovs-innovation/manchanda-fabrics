/**
 * Resolves any color code or color name to a valid hex string for CSS background rendering.
 * Prevents color swatches from displaying as white or transparent when a color name like
 * "Rani Pink", "Baby Pink", "Dusty Rose", or "Mustard" is saved without a hex prefix.
 */

const COLOR_MAP = {
  // Pinks
  "rani pink": "#E3007E",
  "baby pink": "#F4C2C2",
  "blush pink": "#FE828C",
  "dusty rose": "#DCAE96",
  "peach pink": "#F68B7A",
  "hot pink": "#FF69B4",
  "pastel pink": "#FFD1DC",
  "fuchsia pink": "#FF007F",
  "fuchsia": "#FF007F",
  "magenta": "#CA1F7B",
  "powder pink": "#FFE4E1",
  "coral pink": "#F88379",
  "onion pink": "#C4717A",
  "rose gold": "#B76E79",
  "pink": "#EC4899",

  // Reds & Wines
  "bridal red": "#C41E3A",
  "sindoor red": "#E34234",
  "ruby red": "#E0115F",
  "maroon": "#800000",
  "deep wine": "#722F37",
  "wine": "#722F37",
  "burgundy": "#800020",
  "red": "#DC2626",

  // Greens
  "pista green": "#93C572",
  "pista": "#93C572",
  "mehndi green": "#7F8C42",
  "mehndi": "#7F8C42",
  "bottle green": "#004B23",
  "sage green": "#9DC183",
  "mint green": "#98FF98",
  "emerald green": "#50C878",
  "teal green": "#00827F",
  "teal": "#00827F",
  "green": "#16A34A",

  // Blues
  "royal blue": "#4169E1",
  "navy blue": "#000080",
  "navy": "#000080",
  "peacock blue": "#005F73",
  "sky blue": "#87CEEB",
  "turquoise blue": "#40E0D0",
  "turquoise": "#40E0D0",
  "blue": "#2563EB",

  // Yellows & Golds
  "mustard yellow": "#E1AD01",
  "mustard": "#E1AD01",
  "haldi yellow": "#FFCC00",
  "haldi": "#FFCC00",
  "golden yellow": "#FFD700",
  "golden": "#FFD700",
  "gold": "#FFD700",
  "antique gold": "#C5A059",
  "lemon yellow": "#FFF44F",
  "yellow": "#FFD700",

  // Oranges & Peaches
  "rust orange": "#C45508",
  "rust": "#C45508",
  "peach": "#FFE5B4",
  "coral": "#FF7F50",
  "orange": "#FF851B",

  // Purples & Lavenders
  "lavender": "#E6E6FA",
  "lilac": "#C8A2C8",
  "mauve": "#E0B0FF",
  "plum": "#8E4585",
  "purple": "#8E4585",

  // Neutrals & Metallics
  "pure white": "#FFFFFF",
  "off white": "#FAF9F6",
  "ivory": "#FFFFF0",
  "cream": "#FFFDD0",
  "beige": "#F5F5DC",
  "coffee brown": "#4A2E18",
  "brown": "#92400E",
  "charcoal grey": "#36454F",
  "grey": "#6B7280",
  "gray": "#6B7280",
  "black": "#000000",
};

export function resolveColorHex(code, name) {
  if (code && typeof code === "string" && /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/.test(code.trim())) {
    return code.trim();
  }
  if (name && typeof name === "string" && /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/.test(name.trim())) {
    return name.trim();
  }

  const terms = [name, code].filter(Boolean).map((s) => String(s).trim().toLowerCase());
  for (const term of terms) {
    if (COLOR_MAP[term]) {
      return COLOR_MAP[term];
    }
  }

  for (const term of terms) {
    for (const [k, v] of Object.entries(COLOR_MAP)) {
      if (term.includes(k) || k.includes(term)) {
        return v;
      }
    }
  }

  // If single word valid CSS color
  if (code && typeof code === "string" && !code.includes(" ")) {
    return code;
  }

  return "#E3007E";
}
