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
    image: "/p1.jpeg",
  },
  {
    title: "Gaji Silk",
    slug: "gaji-silk",
    image: "/p2.jpeg",
    isHit: true,
    tagline: "Bestseller • Heritage weave",
  },
  {
    title: "Kanjivaram Silk",
    slug: "kanjivaram-silk",
    image: "/p4.jpeg",
  },
  {
    title: "Party Wear Suits",
    slug: "party-wear-suits",
    image: traditionalPhoto("anarkaliSuit", 500, 640),
  },
  {
    title: "Mul Cotton",
    slug: "mul-cotton",
    image: "/p5.jpeg",
  },
  {
    title: "Bangalori Silk Pure",
    slug: "bangalori-silk-pure",
    image: "/p3.jpeg",
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
    image: "/p6.jpeg",
  },
  {
    title: "Batik",
    slug: "batik",
    image: "/p7.jpeg",
  },
  {
    title: "Georgette",
    slug: "georgette",
    image: "/p8.jpeg",
  },
  {
    title: "Organza",
    slug: "organza",
    image: "/p9.jpeg",
  },
  {
    title: "Crepe",
    slug: "crepe",
    image: "/p10.jpeg",
  },
  {
    title: "Jamdani Cotton",
    slug: "jamdani-cotton",
    image: "/p11.jpeg",
  },
  {
    title: "Linen Cotton",
    slug: "linen-cotton",
    image: "/p12.jpeg",
  },
  {
    title: "Glace Cotton",
    slug: "glace-cotton",
    image: "/p13.jpeg",
  },
  {
    title: "Modal",
    slug: "modal",
    image: "/p14.jpeg",
  },
  {
    title: "Crush Tissue",
    slug: "crush-tissue",
    image: "/p15.jpeg",
  },
  {
    title: "Pakistani Style Suits",
    slug: "pakistani-style-suits",
    image: traditionalPhoto("anarkaliSuit", 500, 640),
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
