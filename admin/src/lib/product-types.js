export const DEFAULT_PRODUCT_TYPES = [
  "Suit Sets",
  "Dress Material",
  "Dupattas",
  "Sarees",
  "Lehengas",
  "Kurtis",
];

export const mergeProductTypes = (saved = [], current = "") => {
  const list = [...DEFAULT_PRODUCT_TYPES];
  (Array.isArray(saved) ? saved : []).forEach((item) => {
    const name = String(item || "").trim();
    if (name && !list.includes(name)) list.push(name);
  });
  const active = String(current || "").trim();
  if (active && !list.includes(active)) list.push(active);
  return list;
};
