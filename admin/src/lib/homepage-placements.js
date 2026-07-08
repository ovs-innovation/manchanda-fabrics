export const HOMEPAGE_PLACEMENTS = [
  {
    id: "new-arrival",
    label: "New Arrivals",
    description: "Homepage grid — “New Arrivals” section",
  },
  {
    id: "trending",
    label: "Shop Latest Collection",
    description: "Homepage reels carousel — video product strip",
  },
];

export const HOMEPAGE_PLACEMENT_IDS = HOMEPAGE_PLACEMENTS.map((p) => p.id);

export const sanitizeHomepagePlacementTags = (tags = []) => {
  const list = Array.isArray(tags) ? tags : tags ? [tags] : [];
  return list.filter((id) => HOMEPAGE_PLACEMENT_IDS.includes(id));
};
