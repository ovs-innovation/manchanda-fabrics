/**
 * Biba-inspired traditional ethnic imagery — salwar suits, kurta sets, festive wear.
 * Central place for all storefront placeholder photos.
 */

const unsplash = (photoId, width = 800, height) => {
  return photoId;
};

/** Curated local Suit images distributed evenly */
export const PHOTO = {
  straightSuit: "/Suit/s1.jpg",
  anarkaliSuit: "/Suit/s2.jpg",
  festiveSuitRed: "/Suit/s3.jpg",
  embroideredSuit: "/Suit/s4.jpg",
  cottonSuitPastel: "/Suit/s5.jpg",
  silkSuitGold: "/Suit/s6.jpg",
  mehendiSuit: "/Suit/s7.jpg",
  diwaliSuit: "/Suit/s8.jpg",
  palazzoSuit: "/Suit/s9.jpg",
  fabricWeave: "/Suit/s10.jpg",
  muslinDrape: "/Suit/s11.jpg",
  cottonFabric: "/Suit/s12.jpg",
  kanjivaramTexture: "/Suit/s1.jpg",
};

export const traditionalPhoto = (key) => PHOTO[key] || PHOTO.straightSuit;

export const LOCAL_BANNERS = {
  gajiSilk: "/banners/gaji-silk.jpg", // Kept untouched as requested
  bangaloriSilk: "/Suit/s2.jpg",
  appliqueSuit: "/Suit/s3.jpg",
  mulCotton: "/Suit/s4.jpg",
};

export const HERO_FALLBACK = LOCAL_BANNERS.appliqueSuit;

export const HOME_CATEGORY_CARDS = [
  { title: "Cotton Suits", image: traditionalPhoto("cottonSuitPastel", 600), slug: "cotton-suits" },
  { title: "Gaji Silk", image: LOCAL_BANNERS.gajiSilk, slug: "gaji-silk" },
  { title: "Kanjivaram Silk", image: traditionalPhoto("festiveSuitRed", 600), slug: "kanjivaram-silk" },
  { title: "Party Wear Suits", image: traditionalPhoto("anarkaliSuit", 600), slug: "party-wear-suits" },
  { title: "Mul Cotton", image: LOCAL_BANNERS.mulCotton, slug: "mul-cotton" },
  { title: "Bangalori Silk Pure", image: LOCAL_BANNERS.bangaloriSilk, slug: "bangalori-silk-pure" },
  { title: "Muslin", image: traditionalPhoto("cottonFabric", 600), slug: "muslin" },
  { title: "Kota Doria", image: traditionalPhoto("straightSuit", 600), slug: "kota-doria" },
];

export const HOME_FESTIVALS = [
  {
    name: "Haldi",
    slug: "cotton-suits",
    tag: "Bright Marigold",
    bg: LOCAL_BANNERS.mulCotton,
  },
  {
    name: "Mehendi",
    slug: "applique-work",
    tag: "Festive Greens",
    bg: LOCAL_BANNERS.appliqueSuit,
  },
  {
    name: "Wedding",
    slug: "party-wear",
    tag: "Royal Splendor",
    bg: LOCAL_BANNERS.bangaloriSilk,
  },
  {
    name: "Reception",
    slug: "party-wear",
    tag: "Evening Glitz",
    bg: LOCAL_BANNERS.gajiSilk,
  },
  {
    name: "Party Wear",
    slug: "party-wear",
    tag: "Celebration Glam",
    bg: traditionalPhoto("festiveSuitRed", 500, 700),
  },
];

export const HOME_PREMIUM_COLLECTIONS = [
  {
    title: "Kanjivaram Silk Suits",
    desc: "Pure zari straight suits inspired by South Indian heritage",
    slug: "kanjivaram-silk",
    bg: traditionalPhoto("festiveSuitRed", 800),
  },
  {
    title: "Bengalori Silk Sets",
    desc: "Rich resham embroidery & grand dupatta borders",
    slug: "bangalori-silk-pure",
    bg: traditionalPhoto("embroideredSuit", 800),
  },
  {
    title: "Kota Doria Suits",
    desc: "Lightweight summer suit sets from Rajasthan weaves",
    slug: "kota-doria",
    bg: traditionalPhoto("straightSuit", 800),
  },
  {
    title: "Jamdani Cotton Sets",
    desc: "Handwoven motifs on breathable cotton suit fabrics",
    slug: "jamdani-cotton",
    bg: traditionalPhoto("cottonFabric", 800),
  },
];

export const NAV_MEGA_BANNERS = {
  suits: traditionalPhoto("anarkaliSuit", 600),
  fabrics: traditionalPhoto("fabricWeave", 600),
};

export const ABOUT_IMAGES = {
  hero: traditionalPhoto("straightSuit", 800),
  lookbook: [
    traditionalPhoto("festiveSuitRed", 400, 660),
    traditionalPhoto("embroideredSuit", 400, 660),
    traditionalPhoto("cottonSuitPastel", 400, 660),
  ],
  suitsCard: traditionalPhoto("anarkaliSuit", 600, 450),
  fabricsCard: traditionalPhoto("fabricWeave", 600, 450),
};

export const CATEGORY_DEPT_CARDS = [
  {
    title: "Straight Suit Sets",
    description: "Biba-style straight kurta, palazzo & dupatta sets.",
    image: traditionalPhoto("straightSuit", 400),
    searchQuery: "suits",
  },
  {
    title: "Anarkali Suits",
    description: "Flowing anarkali sets for weddings & celebrations.",
    image: traditionalPhoto("anarkaliSuit", 400),
    searchQuery: "party-wear-suits",
  },
  {
    title: "Festive Suit Sets",
    description: "Embroidered salwar suits for every occasion.",
    image: traditionalPhoto("festiveSuitRed", 400),
    searchQuery: "party-wear-suits",
  },
  {
    title: "Unstitched Fabrics",
    description: "Premium cotton, silk & muslin for custom tailoring.",
    image: traditionalPhoto("fabricWeave", 400),
    searchQuery: "fabrics",
  },
];

export const SLIDER_DEFAULTS = [
  {
    img: traditionalPhoto("anarkaliSuit", 1200),
    title: "Festive Suit Collection",
    subtitle: "Straight & anarkali sets for every celebration",
    link: "/search?category=party-wear-suits",
  },
  {
    img: traditionalPhoto("cottonSuitPastel", 1200),
    title: "Daily Cotton Suits",
    subtitle: "Soft pastels & handblock prints — Biba-inspired elegance",
    link: "/search?category=cotton-suits",
  },
];

export const INSTAGRAM_FALLBACK = traditionalPhoto("straightSuit", 150);

export const TESTIMONIAL_AVATARS = [
  traditionalPhoto("cottonSuitPastel", 120, 120),
  traditionalPhoto("silkSuitGold", 120, 120),
  traditionalPhoto("mehendiSuit", 120, 120),
];
