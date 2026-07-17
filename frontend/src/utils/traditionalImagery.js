/**
 * Biba-inspired traditional ethnic imagery — salwar suits, kurta sets, festive wear.
 * Central place for all storefront placeholder photos.
 */


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
  { title: "Gaji Silk", image: LOCAL_BANNERS.gajiSilk, slug: "gaji-silk" },
  { title: "Cotton Suits", image: traditionalPhoto("cottonSuitPastel", 600), slug: "cotton-suits" },
  { title: "Party Wear", image: traditionalPhoto("anarkaliSuit", 600), slug: "party-wear" },
  { title: "Batik", image: "/Suit/s10.jpg", slug: "batik" },
  { title: "Bangalori Silk Pure", image: LOCAL_BANNERS.bangaloriSilk, slug: "bangalori-silk-pure" },
  { title: "Glace Cotton", image: "/Suit/s4.jpg", slug: "glace-cotton" },
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
    slug: "batik",
    tag: "Artistic Prints",
    bg: "/Suit/s10.jpg",
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
    title: "Gaji Silk",
    desc: "Premium Gaji Silk sarees and suits with heritage weaves",
    slug: "gaji-silk",
    bg: traditionalPhoto("festiveSuitRed", 800),
  },
  {
    title: "Bengalori Silk Sets",
    desc: "Rich resham embroidery & grand dupatta borders",
    slug: "bangalori-silk-pure",
    bg: traditionalPhoto("embroideredSuit", 800),
  },
  {
    title: "Cotton Suits",
    desc: "Breathable and elegant premium cotton suit sets",
    slug: "cotton-suits",
    bg: traditionalPhoto("cottonSuitPastel", 800),
  },
  {
    title: "Glace Cotton",
    desc: "Shiny and premium Glace Cotton suits",
    slug: "glace-cotton",
    bg: traditionalPhoto("straightSuit", 800),
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
    searchQuery: "cotton-suits",
  },
  {
    title: "Anarkali Suits",
    description: "Flowing anarkali sets for weddings & celebrations.",
    image: traditionalPhoto("anarkaliSuit", 400),
    searchQuery: "party-wear",
  },
  {
    title: "Festive Suit Sets",
    description: "Embroidered salwar suits for every occasion.",
    image: traditionalPhoto("festiveSuitRed", 400),
    searchQuery: "party-wear",
  },
  {
    title: "Unstitched Fabrics",
    description: "Premium cotton, silk & muslin for custom tailoring.",
    image: traditionalPhoto("fabricWeave", 400),
    searchQuery: "gaji-silk",
  },
];

export const SLIDER_DEFAULTS = [
  {
    img: traditionalPhoto("anarkaliSuit", 1200),
    title: "Festive Suit Collection",
    subtitle: "Straight & anarkali sets for every celebration",
    link: "/search?category=party-wear",
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
