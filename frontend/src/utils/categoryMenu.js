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

const sortCategories = (a, b) => {
  const orderA = a.order !== undefined && a.order !== null && Number(a.order) > 0 ? Number(a.order) : 999999;
  const orderB = b.order !== undefined && b.order !== null && Number(b.order) > 0 ? Number(b.order) : 999999;
  if (orderA !== orderB) return orderA - orderB;
  return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
};

/**
 * Build categories list for mobile menu & category drawer.
 * Respects custom display order (1, 2, 3...) set in admin panel.
 */
export const buildMobileCategoryMenu = (categories, showingTranslateValue) => {
  if (!Array.isArray(categories) || !categories.length) return [];

  // Filter out system Root or Home categories
  const filtered = categories.filter((cat) => {
    const slug = getCategorySlug(cat, showingTranslateValue);
    const name = String(cat?.name?.en || cat?.name?.default || (typeof cat?.name === "string" ? cat.name : "")).toLowerCase().trim();
    return slug && slug !== "home" && slug !== "root" && name !== "home" && cat?.id !== "Root";
  });

  // Sort top-level categories by display order
  const sorted = [...filtered].sort(sortCategories);

  // Also sort children of each category by display order
  sorted.forEach((cat) => {
    if (Array.isArray(cat.children) && cat.children.length > 0) {
      cat.children.sort(sortCategories);
    }
  });

  return sorted;
};
