import { LOCAL_BANNERS, traditionalPhoto } from "@utils/traditionalImagery";

/**
 * Full Manchanda category catalog — used on homepage & search links.
 * isHit: bestseller / featured row (Gaji Silk, Bangalori Silk Pure).
 */
export const SHOP_CATEGORIES = [
  {
    title: "Applique Work",
    slug: "applique-work",
    image: LOCAL_BANNERS.appliqueSuit,
  },
  {
    title: "Cotton Suits",
    slug: "cotton-suits",
    image: traditionalPhoto("cottonSuitPastel", 500, 640),
  },
  {
    title: "Gaji Silk",
    slug: "gaji-silk",
    image: LOCAL_BANNERS.gajiSilk,
    isHit: true,
    tagline: "Bestseller • Heritage weave",
  },
  {
    title: "Kanjivaram Silk",
    slug: "kanjivaram-silk",
    image: traditionalPhoto("festiveSuitRed", 500, 640),
  },
  {
    title: "Party Wear Suits",
    slug: "party-wear-suits",
    image: traditionalPhoto("anarkaliSuit", 500, 640),
  },
  {
    title: "Mul Cotton",
    slug: "mul-cotton",
    image: LOCAL_BANNERS.mulCotton,
  },
  {
    title: "Bangalori Silk Pure",
    slug: "bangalori-silk-pure",
    image: LOCAL_BANNERS.bangaloriSilk,
    isHit: true,
    tagline: "Bestseller • Pure resham",
  },
  {
    title: "Muslin",
    slug: "muslin",
    image: traditionalPhoto("muslinDrape", 500, 640),
  },
  {
    title: "Kota Doria",
    slug: "kota-doria",
    image: traditionalPhoto("straightSuit", 500, 640),
  },
  {
    title: "Bandhani Suits",
    slug: "bandhani-suits",
    image: traditionalPhoto("mehendiSuit", 500, 640),
  },
  {
    title: "Batik",
    slug: "batik",
    image: traditionalPhoto("fabricWeave", 500, 640),
  },
  {
    title: "Georgette",
    slug: "georgette",
    image: traditionalPhoto("palazzoSuit", 500, 640),
  },
  {
    title: "Organza",
    slug: "organza",
    image: traditionalPhoto("diwaliSuit", 500, 640),
  },
  {
    title: "Crepe",
    slug: "crepe",
    image: traditionalPhoto("embroideredSuit", 500, 640),
  },
  {
    title: "Jamdani Cotton",
    slug: "jamdani-cotton",
    image: traditionalPhoto("cottonFabric", 500, 640),
  },
  {
    title: "Linen Cotton",
    slug: "linen-cotton",
    image: traditionalPhoto("cottonSuitPastel", 500, 640),
  },
  {
    title: "Glace Cotton",
    slug: "glace-cotton",
    image: traditionalPhoto("muslinDrape", 500, 640),
  },
  {
    title: "Modal",
    slug: "modal",
    image: traditionalPhoto("cottonFabric", 500, 640),
  },
];

export const mergeCategoryBanners = (adminBanners = []) => {
  if (!Array.isArray(adminBanners) || adminBanners.length === 0) {
    return SHOP_CATEGORIES;
  }

  return SHOP_CATEGORIES.map((cat) => {
    const match = adminBanners.find(
      (b) => (b.slug || "").toLowerCase().replace(/\s+/g, "-") === cat.slug
    );
    if (!match) return cat;
    return {
      ...cat,
      title: match.title || cat.title,
      image: match.image || cat.image,
    };
  });
};
