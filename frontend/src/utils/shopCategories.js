import { LOCAL_BANNERS, traditionalPhoto } from "@utils/traditionalImagery";

/**
 * Full Manchanda category catalog — used on homepage & search links.
 * isHit: bestseller / featured row (Gaji Silk, Bangalori Silk Pure).
 */
export const SHOP_CATEGORIES = [
  {
    title: "Gaji Silk",
    slug: "gaji-silk",
    image: "/p2.jpeg",
    isHit: true,
    tagline: "Bestseller • Heritage weave",
    video: null,
  },
  {
    title: "Cotton Suits",
    slug: "cotton-suits",
    image: "/Suit/s1.jpg",
    video: null,
  },
  {
    title: "Party Wear",
    slug: "party-wear",
    image: traditionalPhoto("anarkaliSuit", 500, 640),
    video: null,
  },
  {
    title: "Batik",
    slug: "batik",
    image: "/Suit/s10.jpg",
    video: null,
  },
  {
    title: "Bangalori Silk Pure",
    slug: "bangalori-silk-pure",
    image: "/Suit/s6.jpg",
    isHit: true,
    tagline: "Bestseller • Pure resham",
    video: null,
  },
  {
    title: "Glace Cotton",
    slug: "glace-cotton",
    image: "/Suit/s4.jpg",
    video: null,
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
      video: match.video || cat.video,
    };
  });
};
