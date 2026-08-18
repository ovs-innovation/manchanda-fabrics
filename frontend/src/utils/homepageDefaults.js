export const DEFAULT_HOMEPAGE = {
  heroVideo: "/main1.mp4",
  heroWelcome: "Welcome to",
  heroBrandName: "Manchanda Fabrics",
  heroTagline: "Luxury Indian Ethnic Boutique",
  heroCtaText: "Explore Latest Collections",
  heroCtaLink: "/search",
  founder: {
    eyebrow: "Our Heritage",
    titleLine1: "Our",
    titleHighlight: "Story",
    paragraph1:
      "Manchanda Fabrics began in 1990, when our father started a small shop in the heart of Chandni Chowk, Delhi — with nothing more than a love for good fabric and honest business.",
    paragraph2:
      "Today, Pradeep still handles the shop and sourcing, packing every order himself. Shallu is the voice on your calls and messages. And us three sisters — Sanjana, Saisha, and Sanaya — have taken the business online, running everything from the reels to the page itself.",
    paragraph3:
      "From one small shop to a family business spanning three generations. No big office, no outsourced team — just one family, splitting the work between us, the same way we have for years.",
    mainImage: "/Suit/s1.jpg",
    secondaryImage: "/Suit/s2.jpg",
    signature: "Manchanda Fabrics",
    estLine: "Est. 1990 · Premium Indian Ethnic Wear",
  },
  stores: [
    {
      name: "Manchanda Fabrics Delhi",
      address: "Chandni Chowk, Delhi",
      image: "/Suit/s4.jpg",
    },
    {
      name: "Manchanda Fabrics Gurgaon",
      address: "Gurgaon, Haryana",
      image: "/Suit/s5.jpg",
    },
    {
      name: "Manchanda Fabrics Mumbai",
      address: "Mumbai, Maharashtra",
      image: "/Suit/s6.jpg",
    },
  ],
  footer: {
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
      { title: "Gaji Silk", href: "/collections/gaji-silk" },
      { title: "Cotton Suits", href: "/collections/cotton-suits" },
      { title: "Party Wear", href: "/collections/party-wear" },
      { title: "Batik", href: "/collections/batik" },
    ],
    quickLinks: [
      { title: "About Us", href: "/about-us" },
      { title: "Terms & Conditions", href: "/terms-and-conditions" },
      { title: "No Exchange & Return", href: "/refund-return-policy" },
      { title: "Privacy Policy", href: "/privacy-policy" },
      { title: "Contact us", href: "/contact-us" },
    ],
    specialCollection: [
      { title: "Bangalori Silk Pure", href: "/collections/bangalori-silk-pure" },
      { title: "Glace Cotton", href: "/collections/glace-cotton" },
    ],
  },
  whatsappNumbers: ["919891595929"],
  videoShopping: {
    enabled: true,
    businessHours: "11:30 AM – 8:00 PM",
    whatsapp: "919891595929",
    buttonText: "Start Video Shopping",
    title: "Live Video Shopping",
    subtitle: "Shop with us through a live video call.",
    image: "/Suit/s3.jpg",
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

export function mergeHomepage(apiData = {}) {
  const safeData = apiData && typeof apiData === "object" ? apiData : {};
  return {
    ...DEFAULT_HOMEPAGE,
    ...safeData,
    founder: { ...DEFAULT_HOMEPAGE.founder, ...(safeData.founder || {}) },
    footer: {
      ...DEFAULT_HOMEPAGE.footer,
      ...(safeData.footer || {}),
      collectionLinks:
        Array.isArray(safeData.footer?.collectionLinks) && safeData.footer.collectionLinks.length > 0
          ? safeData.footer.collectionLinks
          : DEFAULT_HOMEPAGE.footer.collectionLinks,
      quickLinks:
        Array.isArray(safeData.footer?.quickLinks) && safeData.footer.quickLinks.length > 0
          ? safeData.footer.quickLinks
          : DEFAULT_HOMEPAGE.footer.quickLinks,
      specialCollection:
        Array.isArray(safeData.footer?.specialCollection) && safeData.footer.specialCollection.length > 0
          ? safeData.footer.specialCollection
          : DEFAULT_HOMEPAGE.footer.specialCollection,
    },
    videoShopping: {
      ...DEFAULT_HOMEPAGE.videoShopping,
      ...(safeData.videoShopping || {}),
    },
    stores:
      Array.isArray(safeData.stores) && safeData.stores.length > 0
        ? safeData.stores
        : DEFAULT_HOMEPAGE.stores,
    whatsappNumbers:
      Array.isArray(safeData.whatsappNumbers) && safeData.whatsappNumbers.length > 0
        ? safeData.whatsappNumbers
        : DEFAULT_HOMEPAGE.whatsappNumbers,
    marqueePhrases:
      Array.isArray(safeData.marqueePhrases) && safeData.marqueePhrases.length > 0
        ? safeData.marqueePhrases
        : DEFAULT_HOMEPAGE.marqueePhrases,
  };
}
