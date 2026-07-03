const slugify = (value = "") =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const getCategorySlug = (cat, showingTranslateValue) => {
  if (cat?.slug) return String(cat.slug).toLowerCase();
  const label = showingTranslateValue
    ? showingTranslateValue(cat?.name)
    : cat?.name?.en || cat?.name || "";
  return slugify(label);
};

const flattenCategories = (categories) => {
  if (!Array.isArray(categories)) return [];
  const flat = [];
  const walk = (nodes) => {
    nodes.forEach((node) => {
      flat.push(node);
      if (node?.children?.length) walk(node.children);
    });
  };
  walk(categories);
  return flat;
};

const childBelongsToParent = (child, parent, parentKey, showingTranslateValue) => {
  if (!child || !parent) return false;
  if (String(child._id) === String(parent._id)) return false;

  const pid = String(child.parentId || "").toLowerCase();
  const parentSlug = getCategorySlug(parent, showingTranslateValue);
  const parentName = String(
    showingTranslateValue
      ? showingTranslateValue(parent?.name)
      : parent?.name?.en || parent?.name || ""
  ).toLowerCase();

  return (
    pid === parentKey ||
    pid === parentSlug ||
    pid === String(parent._id).toLowerCase() ||
    String(child.parentName || "").toLowerCase() === parentKey ||
    String(child.parentName || "").toLowerCase() === parentName
  );
};

/**
 * Build Sarees / Suits / Fabrics groups for mobile menu & category drawer.
 * Handles API trees where parentId is a slug string (not Mongo _id).
 */
export const buildMobileCategoryMenu = (categories, showingTranslateValue) => {
  const flat = flattenCategories(categories);
  if (!flat.length) return [];

  const allowedSlugs = [
    "cotton-suits",
    "gaji-silk",
    "kanjivaram-silk",
    "party-wear",
    "mul-cotton",
    "bangalori-silk-pure",
    "muslin",
    "kota-doria",
    "bandhani",
    "batik",
    "georgette",
    "organza",
    "crepe",
    "jamdani-cotton",
    "linen-cotton",
    "glace-cotton",
    "modal",
    "applique-work",
    "crush-tissue",
    "pakistani-style-suits"
  ];

  // Filter categories whose slug is allowed
  const filtered = flat.filter((cat) => {
    const slug = getCategorySlug(cat, showingTranslateValue);
    return allowedSlugs.includes(slug);
  });

  // Map children properly
  return filtered.map((parent) => {
    const children = (parent.children || []).filter((child) => {
      const childSlug = getCategorySlug(child, showingTranslateValue);
      return allowedSlugs.includes(childSlug);
    });
    return { ...parent, children };
  });
};
