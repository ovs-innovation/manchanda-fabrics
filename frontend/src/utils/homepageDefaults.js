export const DEFAULT_HOMEPAGE = {
  heroVideo: "/main1.mp4",
  heroWelcome: "Welcome",
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
    mainImage:
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=720&q=80",
    secondaryImage:
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400&q=80",
    signature: "Manchanda Fabrics",
    estLine: "Est. 1990 · Premium Indian Ethnic Wear",
  },
  stores: [
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
      { title: "Cotton Suits", href: "/collections/cotton-suits" },
      { title: "Gaji Silk", href: "/collections/gaji-silk" },
      { title: "Kanjivaram Silk", href: "/collections/kanjivaram-silk" },
      { title: "Party Wear", href: "/collections/party-wear" },
    ],
    quickLinks: [
      { title: "About Us", href: "/about-us" },
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
  },
  whatsappNumbers: ["919891595929"],
  videoShopping: {
    enabled: true,
    businessHours: "11:30 AM – 8:00 PM",
    whatsapp: "919891595929",
    buttonText: "Start Video Shopping",
    title: "Live Video Shopping",
    subtitle: "Shop with us through a live video call.",
    image: "/h2.jpeg",
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
  return {
    ...DEFAULT_HOMEPAGE,
    ...apiData,
    founder: { ...DEFAULT_HOMEPAGE.founder, ...(apiData.founder || {}) },
    footer: {
      ...DEFAULT_HOMEPAGE.footer,
      ...(apiData.footer || {}),
      collectionLinks:
        Array.isArray(apiData.footer?.collectionLinks) && apiData.footer.collectionLinks.length > 0
          ? apiData.footer.collectionLinks
          : DEFAULT_HOMEPAGE.footer.collectionLinks,
      quickLinks:
        Array.isArray(apiData.footer?.quickLinks) && apiData.footer.quickLinks.length > 0
          ? apiData.footer.quickLinks
          : DEFAULT_HOMEPAGE.footer.quickLinks,
      specialCollection:
        Array.isArray(apiData.footer?.specialCollection) && apiData.footer.specialCollection.length > 0
          ? apiData.footer.specialCollection
          : DEFAULT_HOMEPAGE.footer.specialCollection,
    },
    videoShopping: {
      ...DEFAULT_HOMEPAGE.videoShopping,
      ...(apiData.videoShopping || {}),
    },
    stores:
      Array.isArray(apiData.stores) && apiData.stores.length > 0
        ? apiData.stores
        : DEFAULT_HOMEPAGE.stores,
    whatsappNumbers:
      Array.isArray(apiData.whatsappNumbers) && apiData.whatsappNumbers.length > 0
        ? apiData.whatsappNumbers
        : DEFAULT_HOMEPAGE.whatsappNumbers,
    marqueePhrases:
      Array.isArray(apiData.marqueePhrases) && apiData.marqueePhrases.length > 0
        ? apiData.marqueePhrases
        : DEFAULT_HOMEPAGE.marqueePhrases,
  };
}
