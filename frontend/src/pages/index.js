import React from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import {
  Award,
  Sparkles,
  Truck,
  ShieldCheck,
  Users,
  ChevronRight,
  Quote,
} from "lucide-react";
import { motion } from "framer-motion";
import useTranslation from "next-translate/useTranslation";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/autoplay";

import Layout from "@layout/Layout";
import ProductServices from "@services/ProductServices";
import ProductCard from "@components/product/ProductCard";
import HeroBanner from "@components/banner/HeroBanner";
import AttributeServices from "@services/AttributeServices";
import CustomerReviewSection from "@components/review/CustomerReviewSection";
import InstagramFeed from "@components/instagram/InstagramFeed";
import ShopByCategory from "@components/category/ShopByCategory";
import FounderStory from "@components/founder/FounderStory";
import LuxuryFeatures from "@components/trust/LuxuryFeatures";
import WhatsAppSection from "@components/whatsapp/WhatsAppSection";

import {
  HOME_PREMIUM_COLLECTIONS,
  traditionalPhoto,
  LOCAL_BANNERS,
} from "@utils/traditionalImagery";

/* ── Shared typography helpers ── */
const SectionLabel = ({ children }) => (
  <span
    className="block text-[13px] sm:text-[14px] font-bold uppercase tracking-[0.3em] text-[#C8A45D] mb-4"
    style={{ fontFamily: "'Poppins', sans-serif" }}
  >
    {children}
  </span>
);

const SectionHeading = ({ children }) => (
  <h2
    className="text-4xl sm:text-5xl lg:text-[54px] xl:text-[60px] font-semibold text-[#111111] leading-tight"
    style={{ fontFamily: "'Poppins', sans-serif" }}
  >
    {children}
  </h2>
);

const GoldLine = () => (
  <div className="h-[1.5px] w-12 bg-[#C8A45D] mx-auto mt-5" />
);

/* ── Main Page ── */
const Home = ({ popularProducts, bestSellingProducts, attributes }) => {
  const [mounted, setMounted] = React.useState(false);
  const { t } = useTranslation("common");
  React.useEffect(() => { setMounted(true); }, []);

  const newArrivals = popularProducts || [];
  const bestSellers = bestSellingProducts || [];

  const occasions = [
    { name: "Wedding", slug: "party-wear", tag: "Royal Splendor", bg: "/h1.jpeg" },
    { name: "Reception", slug: "party-wear", tag: "Evening Glitz", bg: "/h2.jpeg" },
    { name: "Haldi", slug: "cotton-suits", tag: "Bright Marigold", bg: "/h3.jpeg" },
    { name: "Mehendi", slug: "applique-work", tag: "Festive Greens", bg: "/h4.jpeg" },
    { name: "Festivals", slug: "party-wear", tag: "Divine Grace", bg: "/h5.jpeg" },
    { name: "Daily Wear", slug: "cotton-suits", tag: "Premium Comfort", bg: "/h6.jpeg" },
  ];

  const whyChooseUs = [
    { icon: <Award className="w-10 h-10 text-[#C8A45D]" />, title: "Since 1995", desc: "Three decades of trust and direct legacy in luxury Indian fabrics." },
    { icon: <Sparkles className="w-10 h-10 text-[#C8A45D]" />, title: "Handcrafted", desc: "Intricate weaves, resham embroidery and premium handloom details." },
    { icon: <Truck className="w-10 h-10 text-[#C8A45D]" />, title: "Pan India Delivery", desc: "Secure insured premium courier shipping to your doorstep." },
    { icon: <ShieldCheck className="w-10 h-10 text-[#C8A45D]" />, title: "Premium Quality", desc: "Strict quality checks on warp, weft, border weights and finish." },
    { icon: <Users className="w-10 h-10 text-[#C8A45D]" />, title: "Trusted by Thousands", desc: "Over 10,000+ satisfied clients across multiple generations." },
  ];

  const renderProductCarousel = (products, prevClass, nextClass) => {
    if (!mounted) return <div className="h-96 w-full bg-[#F9F6F1] animate-pulse rounded" />;
    if (!products || products.length === 0) {
      return (
        <div className="py-12 text-center text-[#7A7A7A] bg-white border border-neutral-100 text-sm"
          style={{ fontFamily: "'Poppins', sans-serif" }}>
          {t("No premium products available at the moment.")}
        </div>
      );
    }
    return (
      <div className="relative group px-1">
        <Swiper
          modules={[Navigation, Autoplay]}
          spaceBetween={32}
          slidesPerView={1.2}
          loop={products.length >= 4}
          navigation={{ prevEl: `.${prevClass}`, nextEl: `.${nextClass}` }}
          autoplay={{ delay: 4000, disableOnInteraction: false, pauseOnMouseEnter: true }}
          breakpoints={{
            480: { slidesPerView: 1.5, spaceBetween: 24 },
            640: { slidesPerView: 2, spaceBetween: 24 },
            768: { slidesPerView: 2.5, spaceBetween: 28 },
            1024: { slidesPerView: 3, spaceBetween: 32 },
            1280: { slidesPerView: 3.5, spaceBetween: 36 },
          }}
          className="mySwiper !pb-6 !pt-1"
        >
          {products.map((product) => (
            <SwiperSlide key={product._id} className="h-auto">
              <ProductCard product={product} attributes={attributes} />
            </SwiperSlide>
          ))}
        </Swiper>
        <button type="button"
          className={`${prevClass} hidden sm:flex absolute top-1/2 -left-6 z-10 bg-white shadow-md border border-neutral-100 rounded-full p-3.5 hover:bg-[#F9F6F1] transition-colors -translate-y-1/2 focus:outline-none`}>
          <IoChevronBack className="text-lg text-[#111111]" />
        </button>
        <button type="button"
          className={`${nextClass} hidden sm:flex absolute top-1/2 -right-6 z-10 bg-white shadow-md border border-neutral-100 rounded-full p-3.5 hover:bg-[#F9F6F1] transition-colors -translate-y-1/2 focus:outline-none`}>
          <IoChevronForward className="text-lg text-[#111111]" />
        </button>
      </div>
    );
  };

  return (
    <Layout>
      <div className="min-h-screen bg-[#F9F6F1] text-[#3A3A3A] overflow-x-hidden">

        {/* 1 ── Hero */}
        <HeroBanner />

        {/* 2 ── Compact WhatsApp CTA — directly below hero */}
        <WhatsAppSection />

        {/* 3 ── Luxury Features Bar */}
        <LuxuryFeatures />

        {/* 4 ── Shop By Category */}
        <ShopByCategory />

        {/* 4 ── Best Sellers */}
        <section className="py-32 sm:py-36 bg-white border-b border-black/5">
          <div className="max-w-screen-2xl mx-auto px-6 sm:px-12 lg:px-16">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <SectionLabel>{t("Most Loved Weaves")}</SectionLabel>
              <SectionHeading>{t("Best Sellers")}</SectionHeading>
              <GoldLine />
            </div>
            {renderProductCarousel(bestSellers, "prev-best-sellers", "next-best-sellers")}
          </div>
        </section>

        {/* 5 ── Founder Story */}
        <FounderStory />
        {/* 6 ── New Arrivals */}
        <section className="py-32 sm:py-36 lg:py-40 bg-[#F9F6F1]">
          <div className="max-w-[1800px] mx-auto px-6 sm:px-10 lg:px-16 xl:px-20">

            {/* Section Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-24 border-b border-black/5 pb-8">

              <div>
                <SectionLabel>{t("Latest Curations")}</SectionLabel>

                <h2
                  className="mt-3 text-4xl sm:text-5xl lg:text-[54px] xl:text-[60px] font-semibold leading-tight text-[#111111]"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  {t("New Arrivals")}
                </h2>
              </div>

              <Link
                href="/search"
                className="group inline-flex items-center gap-3 self-start lg:self-auto px-10 py-5 border border-[#C8A45D] text-[#C8A45D] text-[15px] sm:text-[16px] font-bold uppercase tracking-[0.18em] rounded-sm transition-all duration-300 hover:bg-[#C8A45D] hover:text-white"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                <span>{t("View Collection")}</span>

                <ChevronRight
                  size={20}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>

            </div>

            {newArrivals.length > 0 ? (

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 xl:gap-12">

                {newArrivals.slice(0, 8).map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    attributes={attributes}
                  />
                ))}

              </div>

            ) : (

              <div
                className="py-24 rounded-md border border-neutral-200 bg-white text-center text-xl text-[#666]"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                {t("Products catalog loading...")}
              </div>

            )}
          </div>
        </section>

        {/* 7 ── Featured Collections */}
        <section className="py-32 sm:py-36 bg-white border-y border-black/5">
          <div className="max-w-screen-2xl mx-auto px-6 sm:px-12 lg:px-16">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <SectionLabel>{t("Editorial Curations")}</SectionLabel>
              <SectionHeading>{t("Featured Collections")}</SectionHeading>
              <GoldLine />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              <div className="lg:col-span-7 group relative overflow-hidden bg-[#F9F6F1] flex flex-col justify-between border border-neutral-100">
                <div className="aspect-[4/3] lg:aspect-auto lg:h-[500px] w-full overflow-hidden relative">
                  <img src="/h1.jpeg" alt="Heritage Luxury Silk Collection"
                    className="w-full h-full object-cover object-top transition-transform duration-700 ease-in-out group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>
                <div className="p-8 absolute bottom-0 left-0 right-0 text-white z-10">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#C8A45D]"
                    style={{ fontFamily: "'Poppins', sans-serif" }}>{t("Handcrafted Heritage")}</span>
                  <h3 className="text-2xl sm:text-4xl font-light mt-2 text-white"
                    style={{ fontFamily: "'Poppins', sans-serif" }}>
                    Banarasi &amp; Kanjivaram Silk Suits
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-200 mt-2 font-light max-w-lg leading-relaxed"
                    style={{ fontFamily: "'Poppins', sans-serif" }}>
                    Intricate zari motifs on absolute premium silk fabrics curated for traditional celebrations.
                  </p>
                  <Link href="/search?category=kanjivaram-silk"
                    className="inline-block mt-4 text-[10px] font-semibold uppercase tracking-widest text-[#C8A45D] border-b border-[#C8A45D]/40 pb-0.5 transition-all"
                    style={{ fontFamily: "'Poppins', sans-serif" }}>
                    {t("Shop Heritage Collection")} →
                  </Link>
                </div>
              </div>
              <div className="lg:col-span-5 grid grid-cols-1 gap-8">
                {HOME_PREMIUM_COLLECTIONS.slice(1, 3).map((col, idx) => (
                  <div key={idx} className="group relative flex flex-col sm:flex-row overflow-hidden bg-[#F9F6F1] border border-neutral-100 h-full">
                    <div className="aspect-[4/3] sm:aspect-square sm:w-1/2 overflow-hidden relative shrink-0">
                      <img src="/h2.jpeg" alt={col.title}
                        className="w-full h-[200px] object-cover transition-transform duration-700 ease-in-out group-hover:scale-105" />
                    </div>
                    <div className="p-6 flex flex-col justify-center">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#C8A45D]"
                        style={{ fontFamily: "'Poppins', sans-serif" }}>{t("Premium Curation")}</span>
                      <h3 className="text-lg font-light text-[#111111] mt-2 group-hover:text-[#C8A45D] transition-colors"
                        style={{ fontFamily: "'Poppins', sans-serif" }}>
                        {col.title}
                      </h3>
                      <p className="text-xs text-[#7A7A7A] mt-2 font-light leading-relaxed"
                        style={{ fontFamily: "'Poppins', sans-serif" }}>{col.desc}</p>
                      <Link href={`/search?category=${col.slug}`}
                        className="inline-block mt-4 text-[10px] font-semibold uppercase tracking-widest text-[#C8A45D] border-b border-[#C8A45D]/40 pb-0.5 transition-all"
                        style={{ fontFamily: "'Poppins', sans-serif" }}>
                        {t("Explore")} →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 8 ── Shop By Occasion */}
        <section className="py-32 sm:py-36 lg:py-36 bg-[#F9F6F1]">
          <div className="max-w-screen-2xl mx-auto px-6 sm:px-10 lg:px-16">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <SectionLabel>{t("Occasion Edit")}</SectionLabel>
              <SectionHeading>{t("Shop By Occasion")}</SectionHeading>
              <GoldLine />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
              {occasions.map((occ, idx) => (
                <Link
                  key={idx}
                  href={`/search?category=${occ.slug}`}
                  className="group relative block overflow-hidden rounded-sm bg-neutral-100 h-[500px] md:h-[600px] lg:h-[680px] shadow-sm hover:shadow-2xl transition-all duration-500"
                >
                  <img
                    src={occ.bg}
                    alt={occ.name}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                  <div className="absolute bottom-8 left-8 right-8 text-white">
                    <span
                      className="block mb-2 text-[14px] font-bold uppercase tracking-[0.25em] text-[#C8A45D]"
                      style={{ fontFamily: "'Poppins', sans-serif" }}
                    >
                      {t(occ.tag)}
                    </span>

                    <h3
                      className="text-3xl md:text-4xl font-semibold leading-tight"
                      style={{ fontFamily: "'Poppins', sans-serif" }}
                    >
                      {t(occ.name)}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* 9 ── Why Choose Us */}
        <section className="py-32 sm:py-36 bg-white border-y border-black/5">
          <div className="max-w-screen-2xl mx-auto px-6 sm:px-12 lg:px-16">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <SectionLabel>{t("Our Values")}</SectionLabel>
              <SectionHeading>{t("Why Choose Us")}</SectionHeading>
              <GoldLine />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
              {whyChooseUs.map((item, idx) => (
                <motion.div key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  className="flex flex-col items-center text-center p-9 bg-[#F9F6F1] border border-neutral-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 min-h-[340px] flex flex-col justify-between">
                  <div className="mb-6 p-4.5 bg-white rounded-full shadow-md border border-neutral-100">
                    {item.icon}
                  </div>
                  <h3 className="text-[16px] md:text-[18px] font-bold uppercase tracking-wider text-[#111111] mb-3"
                    style={{ fontFamily: "'Poppins', sans-serif" }}>
                    {t(item.title)}
                  </h3>
                  <p className="text-[15px] sm:text-[16px] text-[#7A7A7A] leading-relaxed font-light mt-auto"
                    style={{ fontFamily: "'Poppins', sans-serif" }}>
                    {t(item.desc)}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 11 ── Customer Stories */}
        <section className="py-32 sm:py-36 bg-[#F9F6F1] border-b border-black/5">
          <div className="max-w-screen-2xl mx-auto px-6 sm:px-12 lg:px-16">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <SectionLabel>{t("Client Voices")}</SectionLabel>
              <SectionHeading>{t("Customer Stories")}</SectionHeading>
              <GoldLine />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10 xl:gap-12 max-w-7xl mx-auto">
              {[
                { name: "Pooja Malhotra", location: "Delhi", text: "Ordered three silk suits for a family wedding. The Resham work is absolutely pristine and the fabric weight is premium. Received compliments from everyone!", img: traditionalPhoto("straightSuit", 150) },
                { name: "Kiran Sharma", location: "Gurugram", text: "The Mul Cotton suits are extremely soft and lightweight. Perfect for daily luxury. The ordering process via WhatsApp was incredibly fast and smooth.", img: traditionalPhoto("cottonSuitPastel", 150) },
                { name: "Radhika Sen", location: "Kolkata", text: "Bought unstitched Gajis. Beautiful traditional gold zari weaves. The colour is rich and exactly as showcased in the video reels. Five stars!", img: traditionalPhoto("silkSuitGold", 150) },
              ].map((review, idx) => (
                <motion.div key={idx}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: idx * 0.15 }}
                  className="bg-white p-6 md:p-10 lg:p-12 border border-neutral-100 shadow-sm flex flex-col justify-between hover:shadow-lg hover:-translate-y-1.5 transform duration-300 md:max-w-md lg:max-w-lg mx-auto w-full">
                  <div>
                    <Quote className="w-12 h-12 text-[#C8A45D]/25 mb-6" />
                    <p className="text-sm sm:text-base md:text-lg text-[#7A7A7A] italic leading-relaxed md:leading-9 mb-8 font-light"
                      style={{ fontFamily: "'Poppins', sans-serif" }}>
                      &ldquo;{t(review.text)}&rdquo;
                    </p>
                  </div>
                  <div className="flex items-center gap-4 border-t border-neutral-100 pt-8 mt-auto">
                    <div className="w-10 h-10 md:w-16 md:h-16 rounded-full overflow-hidden border border-neutral-200">
                      <img src={review.img} alt={review.name} className="w-full h-full object-cover object-top" />
                    </div>
                    <div>
                      <h4 className="text-sm md:text-xl font-bold md:font-semibold uppercase tracking-wider text-[#111111]"
                        style={{ fontFamily: "'Poppins', sans-serif" }}>{review.name}</h4>
                      <p className="text-xs md:text-sm text-[#C8A45D] uppercase tracking-widest mt-1"
                        style={{ fontFamily: "'Poppins', sans-serif" }}>
                        {t(review.location)} · Verified Purchase
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 12 ── Instagram Reels */}
        <InstagramFeed />



      </div>
    </Layout>
  );
};

export const getStaticProps = async () => {
  const [dataResult, attributesResult] = await Promise.allSettled([
    ProductServices.getShowingStoreProducts({}),
    AttributeServices.getShowingAttributes(),
  ]);

  const data = dataResult.status === "fulfilled" ? dataResult.value : null;
  const attributes = attributesResult.status === "fulfilled" ? attributesResult.value : [];

  return {
    props: {
      attributes: attributes || [],
      popularProducts: data?.popularProducts || [],
      bestSellingProducts: data?.bestSellingProducts || [],
    },
    revalidate: 10,
  };
};

export default Home;
