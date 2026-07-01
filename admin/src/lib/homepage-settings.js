export const DEFAULT_MANCHANDA_HOMEPAGE = {
  heroSlides: [],
  trendingProductIds: [],
  newArrivalProductIds: [],
  categoryBanners: [],
  instagramPosts: [],
  sectionOrder: ["Hero", "Categories", "New Arrival", "Trending", "Instagram"],
  brandsSectionEnabled: true,
};

const isLegacyHomepageKey = (key) =>
  key.endsWith("Homepage") && key !== "manchandaHomepage";

export const resolveHomepageFromSetting = (setting = {}) => {
  if (setting.manchandaHomepage) {
    return { ...DEFAULT_MANCHANDA_HOMEPAGE, ...setting.manchandaHomepage };
  }

  for (const [key, value] of Object.entries(setting)) {
    if (isLegacyHomepageKey(key) && value && typeof value === "object") {
      return { ...DEFAULT_MANCHANDA_HOMEPAGE, ...value };
    }
  }

  return { ...DEFAULT_MANCHANDA_HOMEPAGE };
};

export const withManchandaHomepage = (setting = {}, homepagePatch = {}) => {
  const current = resolveHomepageFromSetting(setting);
  return {
    ...setting,
    manchandaHomepage: {
      ...current,
      ...homepagePatch,
    },
  };
};
