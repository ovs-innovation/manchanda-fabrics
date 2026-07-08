export const DEFAULT_FOUNDER = {
  eyebrow: "Our Heritage",
  titleLine1: "Our",
  titleHighlight: "Story",
  paragraph1:
    "Manchanda Fabrics began in 1990, when our father started a small shop in the heart of Chandni Chowk, Delhi — with nothing more than a love for good fabric and honest business.",
  paragraph2:
    "Today, Pradeep still handles the shop and sourcing, packing every order himself. Shallu is the voice on your calls and messages. And us three sisters — Sanjana, Saisha, and Sanaya — have taken the business online, running everything from the reels to the page itself.",
  paragraph3:
    "From one small shop to a family business spanning three generations. No big office, no outsourced team — just one family, splitting the work between us, the same way we have for years.",
  mainImage:
    "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=720&q=80",
  secondaryImage:
    "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400&q=80",
  signature: "Manchanda Fabrics",
  estLine: "Est. 1990 · Premium Indian Ethnic Wear",
};

export const DEFAULT_STORES = [
  {
    name: "Manchanda Fabrics Delhi",
    address: "Chandni Chowk, Delhi",
    image:
      "https://images.unsplash.com/photo-1521336575822-6da63fb45455?w=1200&q=80",
  },
  {
    name: "Manchanda Fabrics Gurgaon",
    address: "Gurgaon, Haryana",
    image:
      "https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=1200&q=80",
  },
  {
    name: "Manchanda Fabrics Mumbai",
    address: "Mumbai, Maharashtra",
    image:
      "https://images.unsplash.com/photo-1520975916090-3105956dac38?w=1200&q=80",
  },
];

export const DEFAULT_FOOTER = {
  brandStory:
    "Rooted in the heart of Chandni Chowk, Manchanda Fabrics carries forward a family legacy of premium ethnic wear — handpicked silks, suits, and fabrics for weddings, festivals, and everyday grace.",
  address: "",
  email: "",
  phones: [],
  hours: "Mon – Sat · 11 AM – 8 PM (Sun closed)",
  instagram: "https://www.instagram.com/manchandafabrics",
  facebook: "",
  whatsapp: "919891595929",
  copyrightName: "VastoraTech",
  copyrightUrl: "https://vastoratech.com/",
  collectionLinks: [
    { title: "Cotton Suits", href: "/collections/cotton-suits" },
    { title: "Gaji Silk", href: "/collections/gaji-silk" },
    { title: "Kanjivaram Silk", href: "/collections/kanjivaram-silk" },
    { title: "Party Wear", href: "/collections/party-wear" },
  ],
  quickLinks: [
    { title: "Terms & Conditions", href: "/terms-and-conditions" },
    { title: "No Exchange & Return", href: "/refund-return-policy" },
    { title: "Privacy Policy", href: "/privacy-policy" },
    { title: "Contact us", href: "/contact-us" },
  ],
  specialCollection: [
    { title: "Bangalori Silk", href: "/collections/bangalori-silk-pure" },
    { title: "Muslin", href: "/collections/muslin" },
    { title: "Kota Doria", href: "/collections/kota-doria" },
    { title: "Applique Work", href: "/collections/applique-work" },
  ],
};

export const DEFAULT_MANCHANDA_HOMEPAGE = {
  heroVideo: "/main.mp4",
  heroWelcome: "Welcome",
  heroBrandName: "Manchanda Fabrics",
  heroTagline: "Luxury Indian Ethnic Boutique",
  heroCtaText: "Explore Latest Collections",
  heroCtaLink: "/search",
  trendingProductIds: [],
  newArrivalProductIds: [],
  founder: DEFAULT_FOUNDER,
  stores: DEFAULT_STORES,
  footer: DEFAULT_FOOTER,
  whatsappNumbers: ["919891595929"],
  videoShopping: {
    image: "/h2.jpeg",
    title: "Shop from Anywhere, Anytime! Enjoy Live Video Shopping from 11 AM – 7 PM",
    subtitle: "Stylists On Call (English & Hindi)",
    whatsapp: "919891595929",
  },
  marqueePhrases: [
    "Crafted from the Finest Fabrics for You",
    "Elegance Woven Into Every Thread",
    "Designed to Drape, Made to Impress",
    "Feel the Quality, See the Elegance",
    "Comfort Meets Craftsmanship in Every Fabric",
    "From Traditional Weaves to Modern Fabrics",
    "Where Tradition Meets Trend",
  ],
};

const isLegacyHomepageKey = (key) =>
  key.endsWith("Homepage") && key !== "manchandaHomepage";

export const resolveHomepageFromSetting = (setting = {}) => {
  let raw = {};
  if (setting.manchandaHomepage) {
    raw = setting.manchandaHomepage;
  } else {
    for (const [key, value] of Object.entries(setting)) {
      if (isLegacyHomepageKey(key) && value && typeof value === "object") {
        raw = value;
        break;
      }
    }
  }

  return {
    ...DEFAULT_MANCHANDA_HOMEPAGE,
    ...raw,
    founder: { ...DEFAULT_FOUNDER, ...(raw.founder || {}) },
    footer: {
      ...DEFAULT_FOOTER,
      ...(raw.footer || {}),
      collectionLinks:
        Array.isArray(raw.footer?.collectionLinks) && raw.footer.collectionLinks.length > 0
          ? raw.footer.collectionLinks
          : DEFAULT_FOOTER.collectionLinks,
      quickLinks:
        Array.isArray(raw.footer?.quickLinks) && raw.footer.quickLinks.length > 0
          ? raw.footer.quickLinks
          : DEFAULT_FOOTER.quickLinks,
      specialCollection:
        Array.isArray(raw.footer?.specialCollection) && raw.footer.specialCollection.length > 0
          ? raw.footer.specialCollection
          : DEFAULT_FOOTER.specialCollection,
    },
    stores:
      Array.isArray(raw.stores) && raw.stores.length > 0
        ? raw.stores
        : DEFAULT_STORES,
    videoShopping: {
      ...DEFAULT_MANCHANDA_HOMEPAGE.videoShopping,
      ...(raw.videoShopping || {}),
    },
    whatsappNumbers:
      Array.isArray(raw.whatsappNumbers) && raw.whatsappNumbers.length > 0
        ? raw.whatsappNumbers
        : DEFAULT_MANCHANDA_HOMEPAGE.whatsappNumbers,
    marqueePhrases:
      Array.isArray(raw.marqueePhrases) && raw.marqueePhrases.length > 0
        ? raw.marqueePhrases
        : DEFAULT_MANCHANDA_HOMEPAGE.marqueePhrases,
  };
};

export const withManchandaHomepage = (setting = {}, homepagePatch = {}) => {
  const current = resolveHomepageFromSetting(setting);
  return {
    ...setting,
    manchandaHomepage: {
      ...current,
      ...homepagePatch,
      founder: { ...current.founder, ...(homepagePatch.founder || {}) },
      footer: { ...current.footer, ...(homepagePatch.footer || {}) },
      videoShopping: {
        ...current.videoShopping,
        ...(homepagePatch.videoShopping || {}),
      },
    },
  };
};
