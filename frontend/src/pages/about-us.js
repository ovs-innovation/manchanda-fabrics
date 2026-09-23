import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronRight, Award, Shield, Truck, RefreshCw, Users, Package } from "lucide-react";
import useTranslation from "next-translate/useTranslation";

import Layout from "@layout/Layout";
import ProductCard from "@components/product/ProductCard";
import ProductServices from "@services/ProductServices";
import AttributeServices from "@services/AttributeServices";
import SettingServices from "@services/SettingServices";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: "easeOut", delay },
  }),
};

const AboutUs = ({ products = [], attributes = [], homepage = null }) => {
  const { t } = useTranslation("common");
  const [isStoryExpanded, setIsStoryExpanded] = React.useState(false);
  const [productList, setProductList] = React.useState(products);
  const [homepageData, setHomepageData] = React.useState(homepage);

  React.useEffect(() => {
    if (!productList || productList.length === 0) {
      ProductServices.getShowingProducts()
        .then((res) => {
          if (res && res.length > 0) {
            setProductList(res.slice(0, 4));
          }
        })
        .catch((err) => console.error("Client fetch products failed:", err));
    }
  }, []);

  React.useEffect(() => {
    if (!homepageData) {
      SettingServices.getStoreCustomizationSetting()
        .then((res) => {
          const hp = res?.manchandaHomepage || res?.setting?.manchandaHomepage;
          if (hp) setHomepageData(hp);
        })
        .catch((err) => console.error("Client fetch homepage customization failed:", err));
    }
  }, [homepageData]);

  const founder = homepageData?.founder || {};

  // Dynamic image resolution: prioritize user-uploaded photo from admin, fallback to local clean family portrait
  const isCustomImage = (url) => {
    if (!url || typeof url !== "string") return false;
    return !url.includes("images.unsplash.com") && !url.includes("placehold");
  };

  const desktopImageSrc = isCustomImage(founder.mainImage)
    ? founder.mainImage
    : "/Family/family_portrait_clean.jpeg";

  const mobileImageSrc = isCustomImage(founder.secondaryImage)
    ? founder.secondaryImage
    : isCustomImage(founder.mainImage)
    ? founder.mainImage
    : "/Family/family_2.jpeg";

  const p1 =
    founder.paragraph1 ||
    t(
      "Established in 1990 in the historical lanes of Chandni Chowk, Delhi, Manchanda Fabrics was founded on a simple vision: to bring the finest hand-selected ethnic textiles to discerning women. What started as a humble family store has matured into a cherished heritage of trust, quality, and celebration."
    );

  const p2 =
    founder.paragraph2 ||
    t(
      "We specialize in exquisite suit sets and unstitched fabrics, ranging from breezy summer cottons to luxurious celebratory silks. Every weave in our collection is handpicked directly from artisans across India, ensuring we offer only the most genuine threads and designs."
    );

  const p3 =
    founder.paragraph3 ||
    t(
      "Today, our family remains at the heart of everything we do. Pradeep oversees quality and sourcing directly from weavers, Shallu personally manages customer relations with absolute care, and their daughters Sanjana, Saisha, and Sanaya drive our digital journey. From our family to yours, we weave love, honesty, and heritage into every fabric we ship."
    );

  return (
    <Layout title="About Us" description="Our Heritage & Story - Manchanda Fabrics">
      <div className="min-h-screen bg-[#F8F5F1] text-[#111111] overflow-x-hidden">

        {/* Section 1: Hero Legacy */}
        <section className="py-8 sm:py-16 lg:py-20 bg-[#F8F5F1]">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-14 items-start">
              
              {/* Left Column: Story Text */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeUp}
                custom={0}
                className="lg:col-span-6 xl:col-span-6 flex flex-col justify-start space-y-5 sm:space-y-6 lg:space-y-7"
              >
                {/* Subtitle: Centered on mobile with dual gold lines, left-aligned on desktop */}
                <div className="flex items-center justify-center lg:justify-start">
                  <span
                    className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.25em] sm:tracking-[0.3em] text-[#C8A45D] flex items-center gap-2.5 sm:gap-3"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    <span className="w-6 sm:w-8 h-[1px] bg-[#C8A45D]" />
                    {t("ABOUT MANCHANDA FABRICS")}
                    <span className="w-6 sm:w-8 h-[1px] bg-[#C8A45D] lg:hidden" />
                  </span>
                </div>

                {/* Heading: Poetic balanced layout on mobile, editorial lines on desktop */}
                <h1
                  className="text-2xl sm:text-4xl lg:text-[42px] xl:text-[46px] font-light text-[#111111] text-center lg:text-left leading-tight sm:leading-tight lg:leading-[1.25]"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  {/* Mobile Heading (balanced, non-wrapping lines) */}
                  <span className="lg:hidden block space-y-1">
                    <span className="block text-[23px] sm:text-[28px] font-light text-[#111111]">
                      {t("A Legacy of")}
                    </span>
                    <span className="block text-[25px] sm:text-[30px] font-normal text-[#C8A45D] italic -mt-0.5">
                      {t("Women's Ethnic Wear")}
                    </span>
                    <span className="block text-[11px] sm:text-xs uppercase tracking-[0.22em] text-[#8C7A70] font-medium pt-1.5">
                      {t("Since 1990 · Chandni Chowk")}
                    </span>
                  </span>

                  {/* Desktop Heading (matches desktop layout) */}
                  <span className="hidden lg:inline">
                    {t("A Legacy of")} <br />
                    <span className="text-[#C8A45D] font-normal">
                      {t("Premium Women's")}
                    </span> <br />
                    <span className="text-[#C8A45D] font-normal">
                      {t("Ethnic Wear")}
                    </span> <br />
                    {t("Since 1990")}
                  </span>
                </h1>

                {/* Gold divider line: centered on mobile, left on desktop */}
                <div className="w-12 sm:w-14 h-[1.5px] bg-[#C8A45D] mx-auto lg:mx-0" />

                {/* Mobile-Only Family Photo Card (Dynamic with clean fallback, native 5:4 aspect ratio) */}
                <div className="block lg:hidden my-2 sm:my-3">
                  <div className="relative w-full rounded-2xl overflow-hidden shadow-[0_12px_32px_rgba(59,42,37,0.12)] border border-[#E6D1CB] bg-white p-1.5 sm:p-2">
                    <div className="relative aspect-[5/4] sm:aspect-[4/3] w-full rounded-xl overflow-hidden bg-neutral-100">
                      <Image
                        src={mobileImageSrc}
                        alt={founder.signature || "The Manchanda Family"}
                        fill
                        priority
                        unoptimized={typeof mobileImageSrc === "string" && mobileImageSrc.startsWith("http")}
                        sizes="(max-width: 1024px) 100vw, 500px"
                        className="object-cover object-top"
                      />
                      {/* Subtle luxury caption vignette */}
                      <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/60 via-black/25 to-transparent flex items-end justify-center pb-2 px-3">
                        <span className="text-[11px] font-medium text-white/95 uppercase tracking-[0.2em] drop-shadow-sm">
                          {founder.signature || t("The Manchanda Family · Est. 1990")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Story Body Paragraphs */}
                <div
                  className="space-y-4 sm:space-y-5 text-[13.5px] sm:text-[15px] text-[#3A3A3A] leading-[1.85] font-light text-center lg:text-left"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  <p className="max-w-xl mx-auto lg:mx-0">{p1}</p>

                  {/* On desktop: always visible. On mobile: expandable with smooth toggle */}
                  <div className={`space-y-4 sm:space-y-5 ${isStoryExpanded ? "block" : "hidden lg:block"}`}>
                    <p className="max-w-xl mx-auto lg:mx-0">{p2}</p>
                    <p className="max-w-xl mx-auto lg:mx-0">{p3}</p>
                  </div>

                  {/* Mobile Read More Toggle */}
                  <div className="lg:hidden pt-1 flex justify-center">
                    <button
                      type="button"
                      onClick={() => setIsStoryExpanded(!isStoryExpanded)}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-[#C8A45D]/40 bg-white/80 text-xs font-medium uppercase tracking-[0.14em] text-[#9C6A5A] hover:bg-white active:scale-95 transition-all shadow-xs"
                    >
                      <span>{isStoryExpanded ? t("Show Less") : t("Read Full Story")}</span>
                      <span className="text-xs">{isStoryExpanded ? "▲" : "▼"}</span>
                    </button>
                  </div>
                </div>

                {/* Quick Highlight Stats: Mobile luxury badge cards, Desktop classic border row */}
                <div className="grid grid-cols-3 gap-2 sm:gap-4 py-2 sm:py-3 lg:border-y lg:border-black/5 lg:py-3">
                  <div className="bg-white/90 lg:bg-transparent border border-[#E6D1CB]/70 lg:border-0 rounded-xl lg:rounded-none p-2.5 sm:p-3 lg:p-0 text-center lg:text-left shadow-xs lg:shadow-none">
                    <span className="block text-lg sm:text-2xl font-semibold text-[#111111]">1990</span>
                    <span className="text-[9.5px] sm:text-xs text-neutral-500 font-light uppercase tracking-wider block mt-0.5">{t("Established")}</span>
                  </div>
                  <div className="bg-white/90 lg:bg-transparent border border-[#E6D1CB]/70 lg:border-0 lg:border-x lg:border-black/5 rounded-xl lg:rounded-none p-2.5 sm:p-3 lg:py-0 lg:px-4 text-center lg:text-left shadow-xs lg:shadow-none">
                    <span className="block text-lg sm:text-2xl font-semibold text-[#111111]">100%</span>
                    <span className="text-[9.5px] sm:text-xs text-neutral-500 font-light uppercase tracking-wider block mt-0.5">{t("Handpicked")}</span>
                  </div>
                  <div className="bg-white/90 lg:bg-transparent border border-[#E6D1CB]/70 lg:border-0 rounded-xl lg:rounded-none p-2.5 sm:p-3 lg:p-0 text-center lg:text-left shadow-xs lg:shadow-none">
                    <span className="block text-lg sm:text-2xl font-semibold text-[#111111]">{t("30+ Yrs")}</span>
                    <span className="text-[9.5px] sm:text-xs text-neutral-500 font-light uppercase tracking-wider block mt-0.5">{t("Heritage")}</span>
                  </div>
                </div>

                <div className="pt-2 sm:pt-4">
                  <Link
                    href="/search"
                    className="group inline-flex items-center justify-center gap-3 w-full sm:w-auto px-8 sm:px-10 py-3.5 sm:py-4 bg-[#111111] text-white border border-[#111111] text-[13px] sm:text-[14px] font-medium uppercase tracking-[0.18em] transition-all duration-300 hover:bg-[#333333] shadow-sm"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    <span>{t("Explore Collections")}</span>
                    <ChevronRight
                      size={18}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </Link>
                </div>
              </motion.div>

              {/* Right Column: Family Portrait (Desktop Only) */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={fadeUp}
                custom={0.15}
                className="hidden lg:flex lg:col-span-6 xl:col-span-6 relative flex-col justify-start w-full pt-1 lg:pt-2"
              >
                {/* Vertical Accent Line (matching reference screenshot) */}
                <div className="hidden lg:block absolute -left-5 lg:-left-6 top-2 w-[1.5px] h-14 bg-[#C8A45D]/50" />

                {/* Main Image Frame Container (Dynamic with clean fallback) */}
                <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_16px_45px_rgba(59,42,37,0.08)] border border-[#E6D1CB] bg-white p-2 sm:p-2.5">
                  <div className="relative aspect-[6/5] sm:aspect-[6/5] lg:aspect-[6/5] xl:aspect-[6/5] w-full rounded-xl sm:rounded-2xl overflow-hidden bg-neutral-100 group">
                    <Image
                      src={desktopImageSrc}
                      alt={founder.signature || "The Manchanda Family"}
                      fill
                      priority
                      unoptimized={typeof desktopImageSrc === "string" && desktopImageSrc.startsWith("http")}
                      sizes="(max-width: 1024px) 100vw, 650px"
                      className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.015]"
                    />
                  </div>
                </div>
              </motion.div>

            </div>
          </div>
        </section>

        {/* Section 3: Premium Collection Cards */}
        <section className="py-12 sm:py-20 lg:py-28 bg-[#FAF7F5] border-t border-b border-[#E6D1CB]/50">
          <div className="max-w-screen-2xl mx-auto px-3.5 sm:px-8 lg:px-16">

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeUp}
              className="text-center max-w-3xl mx-auto mb-8 sm:mb-14"
            >
              <span
                className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.3em] text-[#9C6A5A] flex justify-center items-center gap-3 mb-3 sm:mb-4"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                <span className="w-6 sm:w-8 h-[1px] bg-[#9C6A5A]" />
                {t("PREMIUM SELECTIONS")}
                <span className="w-6 sm:w-8 h-[1px] bg-[#9C6A5A]" />
              </span>

              <h2
                className="text-2xl sm:text-4xl lg:text-5xl font-serif font-light text-[#3B2A25] leading-tight"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                {t("Curated")}{" "}
                <em className="not-italic font-normal italic text-[#9C6A5A]">{t("Suits & Fabrics")}</em>
              </h2>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              variants={fadeUp}
              className={`grid gap-3 sm:gap-6 lg:gap-8 justify-center ${
                productList?.length === 1
                  ? "grid-cols-1 max-w-[280px] sm:max-w-[320px] mx-auto"
                  : productList?.length === 2
                  ? "grid-cols-2 max-w-2xl mx-auto"
                  : productList?.length === 3
                  ? "grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto"
                  : "grid-cols-2 lg:grid-cols-4"
              }`}
            >
              {productList?.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  attributes={attributes}
                />
              ))}
            </motion.div>

            {productList?.length === 0 && (
              <div className="text-center py-12 text-neutral-400 font-light text-sm">
                {t("No new arrivals available.")}
              </div>
            )}

          </div>
        </section>

        {/* Section 4: Why Shop With Us (Trust Badges) */}
        <section className="bg-white border-y border-black/5 py-12 sm:py-16">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-12 lg:px-16">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 md:gap-12">
              {[
                { icon: Award, title: "AUTHENTIC WEAVES", desc: "100% premium quality, hand-checked fibers." },
                { icon: Shield, title: "QUALITY ASSURED", desc: "Sourced directly under rigorous quality audits." },
                { icon: Truck, title: "SAFE SHIPPING", desc: "Insured and reliable delivery across PAN India." },
                { icon: RefreshCw, title: "NO EXCHANGE & RETURN", desc: "Strict policies to keep prices transparent." }
              ].map((badge, idx) => {
                const Icon = badge.icon;
                return (
                  <div key={idx} className="flex flex-col items-center text-center gap-3">
                    <div className="w-12 h-12 rounded-full border border-black/5 flex items-center justify-center text-[#C8A45D]">
                      <Icon size={22} strokeWidth={1.5} />
                    </div>
                    <h4
                      className="text-xs font-semibold tracking-widest text-[#111111] uppercase"
                      style={{ fontFamily: "'Poppins', sans-serif" }}
                    >
                      {t(badge.title)}
                    </h4>
                    <p
                      className="text-xs text-neutral-400 font-light max-w-[200px]"
                      style={{ fontFamily: "'Poppins', sans-serif" }}
                    >
                      {t(badge.desc)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Section 5: Brand Statistics & CTA */}
        <section className="bg-[#F8F5F1] py-12 sm:py-20 lg:py-24">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-12 lg:px-16">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeUp}
              className="bg-white border border-black/5 rounded-[14px] p-6 sm:p-8 md:p-14 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 shadow-[0_6px_24px_rgba(0,0,0,0.02)]"
            >

              {/* Stats Area */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-10 lg:gap-16 w-full lg:w-auto text-left lg:border-r lg:border-black/5 pr-0 lg:pr-16">

                {/* Stat 1 */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#F8F5F1] flex items-center justify-center text-[#C8A45D]">
                    <Users size={20} strokeWidth={1.5} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[#111111] leading-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>10,000+</div>
                    <div className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold" style={{ fontFamily: "'Poppins', sans-serif" }}>{t("Happy Patrons")}</div>
                  </div>
                </div>

                {/* Stat 2 */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#F8F5F1] flex items-center justify-center text-[#C8A45D]">
                    <Package size={20} strokeWidth={1.5} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[#111111] leading-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>15,000+</div>
                    <div className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold" style={{ fontFamily: "'Poppins', sans-serif" }}>{t("Orders Shipped")}</div>
                  </div>
                </div>

                {/* Stat 3 */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#F8F5F1] flex items-center justify-center text-[#C8A45D]">
                    <Award size={20} strokeWidth={1.5} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[#111111] leading-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>150+</div>
                    <div className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold" style={{ fontFamily: "'Poppins', sans-serif" }}>{t("Artisan Partners")}</div>
                  </div>
                </div>

              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto sm:justify-end">
                <Link
                  href="/search?category=fabrics"
                  className="group inline-flex items-center justify-center gap-3 px-8 py-4 border border-[#111111] text-[#111111] text-xs font-semibold uppercase tracking-[0.18em] transition-all duration-300 hover:bg-[#111111] hover:text-white bg-transparent"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  <span>{t("Shop Fabrics")}</span>
                  <ChevronRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/search?category=suits"
                  className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#111111] text-white border border-[#111111] text-xs font-semibold uppercase tracking-[0.18em] transition-all duration-300 hover:bg-transparent hover:text-[#111111]"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  <span>{t("Shop Suits")}</span>
                  <ChevronRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>

            </motion.div>
          </div>
        </section>

      </div>
    </Layout>
  );
};

export const getServerSideProps = async () => {
  try {
    const [products, attributes, storeCustomization] = await Promise.all([
      ProductServices.getShowingProducts(),
      AttributeServices.getShowingAttributes(),
      SettingServices.getStoreCustomizationSetting().catch(() => null),
    ]);

    const latestFour = (products || []).slice(0, 4);
    const homepage =
      storeCustomization?.manchandaHomepage ||
      storeCustomization?.setting?.manchandaHomepage ||
      null;

    return {
      props: {
        products: latestFour,
        attributes: attributes || [],
        homepage: homepage,
      },
    };
  } catch (err) {
    console.error("Error in AboutUs getServerSideProps:", err);
    return {
      props: {
        products: [],
        attributes: [],
        homepage: null,
      },
    };
  }
};

export default AboutUs;
