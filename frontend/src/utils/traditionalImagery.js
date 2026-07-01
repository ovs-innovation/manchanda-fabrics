/**
 * Biba-inspired traditional ethnic imagery — salwar suits, kurta sets, festive wear.
 * Central place for all storefront placeholder photos.
 */

const unsplash = (photoId, width = 800, height) => {
  const base = `https://images.unsplash.com/${photoId}?auto=format&fit=crop&q=80&w=${width}`;
  return height ? `${base}&h=${height}` : `${base}`;
};

/** Curated Unsplash IDs — Indian ethnic suits & traditional wear */
export const PHOTO = {
  straightSuit: "photo-1583391733956-3750e0ff4e8b",
  anarkaliSuit: "photo-1596755389378-c31d21fd12d4",
  festiveSuitRed: "photo-1610030469983-98e550d6193c",
  embroideredSuit: "photo-1617627143750-d86bc21e42bb",
  cottonSuitPastel: "photo-1608748010899-18f300247112",
  silkSuitGold: "photo-1610030469668-93535c17b6b3",
  mehendiSuit: "photo-1595777457583-95e059d581b8",
  diwaliSuit: "photo-1617111657625-40569e6569ef",
  palazzoSuit: "photo-1572804013307-08144da27012",
  fabricWeave: "photo-1606744824163-985d376605aa",
  muslinDrape: "photo-1609357605129-26f69add5d6e",
  cottonFabric: "photo-1528459801416-a9e53bbf4e17",
  kanjivaramTexture: "photo-1610030469668-93535c17b6b3",
};

export const traditionalPhoto = (key, width = 800, height) =>
  unsplash(PHOTO[key] || PHOTO.straightSuit, width, height);

export const LOCAL_BANNERS = {
  gajiSilk: "/banners/gaji-silk.jpg",
  bangaloriSilk: "/banners/bangalori-silk.jpg",
  appliqueSuit: "/banners/applique-suit.jpg",
  mulCotton: "/banners/mul-cotton.jpg",
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
    name: "Wedding",
    slug: "party-wear-suits",
    tag: "Royal Splendor",
    bg: LOCAL_BANNERS.bangaloriSilk,
  },
  {
    name: "Reception",
    slug: "party-wear-suits",
    tag: "Evening Glitz",
    bg: LOCAL_BANNERS.gajiSilk,
  },
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
    name: "Diwali",
    slug: "party-wear-suits",
    tag: "Festive Sparkle",
    bg: traditionalPhoto("festiveSuitRed", 500, 700),
  },
  {
    name: "Karwa Chauth",
    slug: "kanjivaram-silk",
    tag: "Traditional Grace",
    bg: traditionalPhoto("embroideredSuit", 500, 700),
  },
  {
    name: "Raksha Bandhan",
    slug: "cotton-suits",
    tag: "Sibling Love",
    bg: traditionalPhoto("anarkaliSuit", 500, 700),
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
