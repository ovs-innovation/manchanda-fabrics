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
import YouTubeShorts from "@components/youtube/YouTubeShorts";

import {
  HOME_PREMIUM_COLLECTIONS,
  traditionalPhoto,
  LOCAL_BANNERS,
} from "@utils/traditionalImagery";

/* ── Shared typography helpers ── */
const SectionLabel = ({ children }) => (
  <span
    className="block text-[10px] font-semibold uppercase tracking-[0.3em] text-[#C8A45D] mb-3"
    style={{ fontFamily: "'Montserrat', sans-serif" }}
  >
    {children}
  </span>
);

const SectionHeading = ({ children }) => (
  <h2
    className="text-3xl sm:text-5xl font-light text-[#111111]"
    style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
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
  React.useEffect(() => { setMounted(true); }, []);

  const newArrivals = popularProducts || [];
  const bestSellers = bestSellingProducts || [];

  const occasions = [
    { name: "Wedding", slug: "party-wear", tag: "Royal Splendor", bg: LOCAL_BANNERS.bangaloriSilk },
    { name: "Reception", slug: "party-wear", tag: "Evening Glitz", bg: LOCAL_BANNERS.gajiSilk },
    { name: "Haldi", slug: "cotton-suits", tag: "Bright Marigold", bg: LOCAL_BANNERS.mulCotton },
    { name: "Mehendi", slug: "applique-work", tag: "Festive Greens", bg: LOCAL_BANNERS.appliqueSuit },
    { name: "Festivals", slug: "party-wear", tag: "Divine Grace", bg: traditionalPhoto("festiveSuitRed", 500, 700) },
    { name: "Daily Wear", slug: "cotton-suits", tag: "Premium Comfort", bg: traditionalPhoto("cottonSuitPastel", 500, 700) },
  ];

  const whyChooseUs = [
    { icon: <Award className="w-7 h-7 text-[#C8A45D]" />, title: "Since 1995", desc: "Three decades of trust and direct legacy in luxury Indian fabrics." },
    { icon: <Sparkles className="w-7 h-7 text-[#C8A45D]" />, title: "Handcrafted", desc: "Intricate weaves, resham embroidery and premium handloom details." },
    { icon: <Truck className="w-7 h-7 text-[#C8A45D]" />, title: "Pan India Delivery", desc: "Secure insured premium courier shipping to your doorstep." },
    { icon: <ShieldCheck className="w-7 h-7 text-[#C8A45D]" />, title: "Premium Quality", desc: "Strict quality checks on warp, weft, border weights and finish." },
    { icon: <Users className="w-7 h-7 text-[#C8A45D]" />, title: "Trusted by Thousands", desc: "Over 10,000+ satisfied clients across multiple generations." },
  ];

  const renderProductCarousel = (products, prevClass, nextClass) => {
    if (!mounted) return <div className="h-96 w-full bg-[#F9F6F1] animate-pulse rounded" />;
    if (!products || products.length === 0) {
      return (
        <div className="py-12 text-center text-[#7A7A7A] bg-white border border-neutral-100 text-sm"
          style={{ fontFamily: "'Poppins', sans-serif" }}>
          No premium products available at the moment.
        </div>
      );
    }
    return (
      <div className="relative group px-1">
        <Swiper
          modules={[Navigation, Autoplay]}
          spaceBetween={24}
          slidesPerView={1.2}
          loop={products.length >= 5}
          navigation={{ prevEl: `.${prevClass}`, nextEl: `.${nextClass}` }}
          autoplay={{ delay: 4000, disableOnInteraction: false, pauseOnMouseEnter: true }}
          breakpoints={{
            480: { slidesPerView: 1.5, spaceBetween: 24 },
            640: { slidesPerView: 2, spaceBetween: 24 },
            768: { slidesPerView: 3, spaceBetween: 28 },
            1024: { slidesPerView: 4, spaceBetween: 32 },
            1280: { slidesPerView: 5, spaceBetween: 36 },
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
        <section className="py-20 sm:py-28 bg-white border-b border-black/5">
          <div className="max-w-screen-2xl mx-auto px-6 sm:px-12 lg:px-16">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <SectionLabel>Most Loved Weaves</SectionLabel>
              <SectionHeading>Best Sellers</SectionHeading>
              <GoldLine />
            </div>
            {renderProductCarousel(bestSellers, "prev-best-sellers", "next-best-sellers")}
          </div>
        </section>

        {/* 5 ── Founder Story */}
        <FounderStory />

        {/* 6 ── New Arrivals */}
        <section className="py-20 sm:py-28 bg-[#F9F6F1]">
          <div className="max-w-screen-2xl mx-auto px-6 sm:px-12 lg:px-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 border-b border-black/5 pb-6">
              <div>
                <SectionLabel>Latest Curations</SectionLabel>
                <SectionHeading>New Arrivals</SectionHeading>
              </div>
              <Link
                href="/search"
                className="group flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-[#C8A45D] hover:text-[#a8833d] transition-colors mt-4 md:mt-0"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                <span>View All Collection</span>
                <ChevronRight size={13} className="transition-transform group-hover:translate-x-1 duration-200" />
              </Link>
            </div>
            {newArrivals.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 sm:gap-8">
                {newArrivals.slice(0, 10).map((product) => (
                  <ProductCard key={product._id} product={product} attributes={attributes} />
                ))}
              </div>
            ) : (
              <div className="py-16 text-center text-[#7A7A7A] bg-white border border-neutral-100"
                style={{ fontFamily: "'Poppins', sans-serif" }}>
                Products catalog loading...
              </div>
            )}
          </div>
        </section>

        {/* 7 ── Featured Collections */}
        <section className="py-20 sm:py-28 bg-white border-y border-black/5">
          <div className="max-w-screen-2xl mx-auto px-6 sm:px-12 lg:px-16">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <SectionLabel>Editorial Curations</SectionLabel>
              <SectionHeading>Featured Collections</SectionHeading>
              <GoldLine />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              <div className="lg:col-span-7 group relative overflow-hidden bg-[#F9F6F1] flex flex-col justify-between border border-neutral-100">
                <div className="aspect-[4/3] lg:aspect-auto lg:h-[500px] w-full overflow-hidden relative">
                  <img src={traditionalPhoto("festiveSuitRed", 900)} alt="Heritage Luxury Silk Collection"
                    className="w-full h-full object-cover object-top transition-transform duration-700 ease-in-out group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>
                <div className="p-8 absolute bottom-0 left-0 right-0 text-white z-10">
                  <span className="text-[9px] font-semibold uppercase tracking-[0.3em] text-[#C8A45D]"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}>Handcrafted Heritage</span>
                  <h3 className="text-2xl sm:text-4xl font-light mt-2 text-white"
                    style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                    Banarasi &amp; Kanjivaram Silk Suits
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-200 mt-2 font-light max-w-lg leading-relaxed"
                    style={{ fontFamily: "'Poppins', sans-serif" }}>
                    Intricate zari motifs on absolute premium silk fabrics curated for traditional celebrations.
                  </p>
                  <Link href="/search?category=kanjivaram-silk"
                    className="inline-block mt-4 text-[10px] font-semibold uppercase tracking-widest text-[#C8A45D] border-b border-[#C8A45D]/40 pb-0.5 transition-all"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}>
                    Shop Heritage Collection →
                  </Link>
                </div>
              </div>
              <div className="lg:col-span-5 grid grid-cols-1 gap-8">
                {HOME_PREMIUM_COLLECTIONS.slice(1, 3).map((col, idx) => (
                  <div key={idx} className="group relative flex flex-col sm:flex-row overflow-hidden bg-[#F9F6F1] border border-neutral-100 h-full">
                    <div className="aspect-[4/3] sm:aspect-square sm:w-1/2 overflow-hidden relative shrink-0">
                      <img src={col.bg} alt={col.title}
                        className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105" />
                    </div>
                    <div className="p-6 flex flex-col justify-center">
                      <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#C8A45D]"
                        style={{ fontFamily: "'Montserrat', sans-serif" }}>Premium Curation</span>
                      <h3 className="text-lg font-light text-[#111111] mt-2 group-hover:text-[#C8A45D] transition-colors"
                        style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                        {col.title}
                      </h3>
                      <p className="text-xs text-[#7A7A7A] mt-2 font-light leading-relaxed"
                        style={{ fontFamily: "'Poppins', sans-serif" }}>{col.desc}</p>
                      <Link href={`/search?category=${col.slug}`}
                        className="inline-block mt-4 text-[9px] font-semibold uppercase tracking-widest text-[#C8A45D] border-b border-[#C8A45D]/40 pb-0.5 transition-all"
                        style={{ fontFamily: "'Montserrat', sans-serif" }}>
                        Explore →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 8 ── Shop By Occasion */}
        <section className="py-20 sm:py-28 bg-[#F9F6F1]">
          <div className="max-w-screen-2xl mx-auto px-6 sm:px-12 lg:px-16">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <SectionLabel>Occasion Edit</SectionLabel>
              <SectionHeading>Shop By Occasion</SectionHeading>
              <GoldLine />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
              {occasions.map((occ, idx) => (
                <Link key={idx} href={`/search?category=${occ.slug}`}
                  className="group relative block overflow-hidden bg-neutral-100 aspect-[3/4] shadow-sm hover:shadow-xl transition-all duration-400">
                  <img src={occ.bg} alt={occ.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-108"
                    loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <span className="text-[8px] font-semibold uppercase tracking-widest text-[#C8A45D] block mb-1"
                      style={{ fontFamily: "'Montserrat', sans-serif" }}>{occ.tag}</span>
                    <h3 className="font-light text-lg tracking-wide text-white"
                      style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>{occ.name}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* 9 ── Why Choose Us */}
        <section className="py-20 sm:py-28 bg-white border-y border-black/5">
          <div className="max-w-screen-2xl mx-auto px-6 sm:px-12 lg:px-16">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <SectionLabel>Our Values</SectionLabel>
              <SectionHeading>Why Choose Us</SectionHeading>
              <GoldLine />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
              {whyChooseUs.map((item, idx) => (
                <motion.div key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  className="flex flex-col items-center text-center p-7 bg-[#F9F6F1] border border-neutral-100 hover:shadow-lg transition-shadow duration-300">
                  <div className="mb-5 p-3.5 bg-white rounded-full shadow-sm border border-neutral-100">
                    {item.icon}
                  </div>
                  <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#111111] mb-3"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}>
                    {item.title}
                  </h3>
                  <p className="text-[12px] text-[#7A7A7A] leading-relaxed font-light"
                    style={{ fontFamily: "'Poppins', sans-serif" }}>
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 11 ── Customer Stories */}
        <section className="py-20 sm:py-28 bg-[#F9F6F1] border-b border-black/5">
          <div className="max-w-screen-2xl mx-auto px-6 sm:px-12 lg:px-16">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <SectionLabel>Client Voices</SectionLabel>
              <SectionHeading>Customer Stories</SectionHeading>
              <GoldLine />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
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
                  className="bg-white p-8 border border-neutral-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow duration-300">
                  <div>
                    <Quote className="w-7 h-7 text-[#C8A45D]/30 mb-4" />
                    <p className="text-[13px] text-[#7A7A7A] italic leading-relaxed mb-6 font-light"
                      style={{ fontFamily: "'Poppins', sans-serif" }}>
                      &ldquo;{review.text}&rdquo;
                    </p>
                  </div>
                  <div className="flex items-center gap-4 border-t border-neutral-100 pt-5 mt-auto">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-neutral-200">
                      <img src={review.img} alt={review.name} className="w-full h-full object-cover object-top" />
                    </div>
                    <div>
                      <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[#111111]"
                        style={{ fontFamily: "'Montserrat', sans-serif" }}>{review.name}</h4>
                      <p className="text-[10px] text-[#C8A45D] uppercase tracking-widest"
                        style={{ fontFamily: "'Montserrat', sans-serif" }}>
                        {review.location} · Verified Purchase
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

        {/* 13 ── YouTube Shorts */}
        <YouTubeShorts />

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
