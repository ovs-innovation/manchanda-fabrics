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
    // Keep optional; only set when you actually have a reel file or admin provides one.
    video: null,
  },
  {
    title: "Cotton Suits",
    slug: "cotton-suits",
    image: "/p1.jpeg",
    video: null,
  },
  {
    title: "Gaji Silk",
    slug: "gaji-silk",
    image: "/p2.jpeg",
    isHit: true,
    tagline: "Bestseller • Heritage weave",
    video: null,
  },
  {
    title: "Kanjivaram Silk",
    slug: "kanjivaram-silk",
    image: "/p4.jpeg",
    video: null,
  },
  {
    title: "Party Wear Suits",
    slug: "party-wear-suits",
    image: traditionalPhoto("anarkaliSuit", 500, 640),
    video: null,
  },
  {
    title: "Mul Cotton",
    slug: "mul-cotton",
    image: "/p5.jpeg",
    video: null,
  },
  {
    title: "Bangalori Silk Pure",
    slug: "bangalori-silk-pure",
    image: "/p3.jpeg",
    isHit: true,
    tagline: "Bestseller • Pure resham",
    video: null,
  },
  {
    title: "Muslin",
    slug: "muslin",
    image: traditionalPhoto("muslinDrape", 500, 640),
    video: null,
  },
  {
    title: "Kota Doria",
    slug: "kota-doria",
    image: traditionalPhoto("straightSuit", 500, 640),
    video: null,
  },
  {
    title: "Bandhani Suits",
    slug: "bandhani-suits",
    image: "/p6.jpeg",
    video: null,
  },
  {
    title: "Batik",
    slug: "batik",
    image: "/p7.jpeg",
    video: null,
  },
  {
    title: "Georgette",
    slug: "georgette",
    image: "/p8.jpeg",
    video: null,
  },
  {
    title: "Organza",
    slug: "organza",
    image: "/p9.jpeg",
    video: null,
  },
  {
    title: "Crepe",
    slug: "crepe",
    image: "/p10.jpeg",
    video: null,
  },
  {
    title: "Jamdani Cotton",
    slug: "jamdani-cotton",
    image: "/p11.jpeg",
    video: null,
  },
  {
    title: "Linen Cotton",
    slug: "linen-cotton",
    image: "/p12.jpeg",
    video: null,
  },
  {
    title: "Glace Cotton",
    slug: "glace-cotton",
    image: "/p13.jpeg",
    video: null,
  },
  {
    title: "Modal",
    slug: "modal",
    image: "/p14.jpeg",
    video: null,
  },
  {
    title: "Crush Tissue",
    slug: "crush-tissue",
    image: "/p15.jpeg",
    video: null,
  },
  {
    title: "Pakistani Style Suits",
    slug: "pakistani-style-suits",
    image: traditionalPhoto("anarkaliSuit", 500, 640),
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
