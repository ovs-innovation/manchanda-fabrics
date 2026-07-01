import React from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { IoChevronBack, IoChevronForward, IoSparkles } from "react-icons/io5";
import { FiShield, FiAward, FiSmartphone, FiRotateCcw } from "react-icons/fi";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/autoplay";

import Layout from "@layout/Layout";
import ProductServices from "@services/ProductServices";
import ProductCard from "@components/product/ProductCard";
import HeroBanner from "@components/banner/HeroBanner";
import AttributeServices from "@services/AttributeServices";
import SectionHeader from "@components/common/SectionHeader";

import CustomerReviewSection from "@components/review/CustomerReviewSection";
import InstagramFeed from "@components/instagram/InstagramFeed";
import ShopByCategory from "@components/category/ShopByCategory";
import FestivalCollection from "@components/category/FestivalCollection";
import {
  HOME_PREMIUM_COLLECTIONS,
  HERO_FALLBACK,
  LOCAL_BANNERS,
} from "@utils/traditionalImagery";

const Home = ({ popularProducts, bestSellingProducts, attributes, manchandaHomepage }) => {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const newArrivals = popularProducts || [];
  const bestSellers = bestSellingProducts || [];

  const premiumCollections = HOME_PREMIUM_COLLECTIONS;

  const renderProductCarousel = (products, prevClass, nextClass) => {
    if (!mounted) {
      return <div className="h-96 w-full bg-[#F5ECE8] animate-pulse rounded-xl" />;
    }

    if (!products || products.length === 0) {
      return (
        <div className="py-12 text-center text-[#2B211E]/60 bg-white border border-[#D5BBB4]/50 rounded-xl font-sans">
          No premium items found. Please seed the database catalog.
        </div>
      );
    }

    return (
      <div className="relative group">
        <Swiper
          modules={[Navigation, Autoplay]}
          spaceBetween={10}
          slidesPerView={1.15}
          loop={products.length >= 5}
          navigation={{ prevEl: `.${prevClass}`, nextEl: `.${nextClass}` }}
          autoplay={{ delay: 4000, disableOnInteraction: false, pauseOnMouseEnter: true }}
          breakpoints={{
            480: { slidesPerView: 1.5, spaceBetween: 12 },
            640: { slidesPerView: 2, spaceBetween: 14 },
            768: { slidesPerView: 3, spaceBetween: 18 },
            1024: { slidesPerView: 4, spaceBetween: 22 },
            1280: { slidesPerView: 5, spaceBetween: 24 },
          }}
          className="mySwiper !pb-4 !pt-1 -mx-1 px-1"
        >
          {products.map((product) => (
            <SwiperSlide key={product._id} className="h-auto">
              <ProductCard product={product} attributes={attributes} />
            </SwiperSlide>
          ))}
        </Swiper>
        <button
          type="button"
          className={`${prevClass} hidden sm:flex absolute top-1/2 -left-2 md:-left-3 z-10 bg-white shadow-md border border-[#D5BBB4] rounded-full p-2 hover:bg-[#F5ECE8] transition-colors -translate-y-1/2`}
        >
          <IoChevronBack className="text-lg text-[#93614E]" />
        </button>
        <button
          type="button"
          className={`${nextClass} hidden sm:flex absolute top-1/2 -right-2 md:-right-3 z-10 bg-white shadow-md border border-[#D5BBB4] rounded-full p-2 hover:bg-[#F5ECE8] transition-colors -translate-y-1/2`}
        >
          <IoChevronForward className="text-lg text-[#93614E]" />
        </button>
      </div>
    );
  };

  // Use dynamic hero slides
  const heroSlides =
    manchandaHomepage?.heroSlides && manchandaHomepage.heroSlides.length > 0
      ? manchandaHomepage.heroSlides.map((s, idx) => ({
        style: s.style || "layout-left-framed",
        badge: s.badge || "Ethnic Suit Edit",
        title: s.title || "Traditional Suit Sets",
        subtitle: s.subtitle || "Straight, anarkali & festive salwar suits crafted for every occasion.",
        highlight: s.highlight || "Handcrafted Heritage",
        btnText: s.btnText || "Shop Suits",
        btnLink: s.link || s.btnLink || "/search?category=suits",
        bgImage: s.image || Object.values(LOCAL_BANNERS)[idx % 4] || HERO_FALLBACK,
      }))
    : [
        {
          style: "layout-left-framed",
          badge: "Straight Suit Sets",
          title: "Timeless Elegance in Every Stitch",
          subtitle: "Discover handcrafted salwar suits, anarkali sets & kurta ensembles — Biba-inspired tradition.",
          highlight: "Premium Ethnic Suit Collection",
          btnText: "Shop Suit Sets",
          btnLink: "/search?category=suits",
          bgImage: HERO_FALLBACK,
        }
      ];

  return (
    <Layout>
      <div className="min-h-screen bg-[#FAF7F5] text-[#2B211E] font-serif overflow-x-hidden">

        {/* 1. Hero Banner */}
        <HeroBanner slides={heroSlides} />

        <ShopByCategory adminBanners={manchandaHomepage?.categoryBanners} />

        <FestivalCollection />

        {/* 5. New Arrivals Section */}
        <section className="py-10 sm:py-14 lg:py-20 bg-white border-y border-[#D5BBB4]/40">
          <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-16">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6 sm:mb-8 border-b border-[#D5BBB4]/40 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FAF7F5] border border-[#D5BBB4] text-[#93614E] text-[9px] font-semibold uppercase tracking-widest rounded-full mb-2">
                  <IoSparkles className="text-[#93614E]" />
                  <span>Latest Additions</span>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-[#2B211E] font-serif">New Arrivals</h2>
              </div>
              <Link
                href="/search?tag=new-arrival"
                className="group inline-flex items-center gap-1.5 px-4 py-2 border border-[#D5BBB4] rounded-full text-xs font-semibold uppercase tracking-wider text-[#2B211E]/80 hover:text-[#93614E] hover:border-[#93614E] transition-all"
              >
                <span>View All</span>
                <IoChevronForward className="transition-transform group-hover:translate-x-0.5 text-[#93614E] text-xs" />
              </Link>
            </div>
            {renderProductCarousel(newArrivals, "prev-new-arrivals", "next-new-arrivals")}
          </div>
        </section>

        {/* 6 & 7. Trending & Best Sellers */}
        <section className="py-10 sm:py-14 lg:py-20 mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-16 bg-[#FAF7F5]">
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
            <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.2em] text-[#C7A46A] mb-2">Most Loved</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-[#2B211E] font-serif">Best Sellers & Trending</h2>
            <div className="h-[1px] w-12 bg-[#93614E] mx-auto mt-3 sm:mt-4" />
          </div>

          {bestSellers.length > 0 ? (
            <div className="space-y-8 sm:space-y-12">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-4 md:gap-6">
                {bestSellers.slice(0, 5).map((product) => (
                  <ProductCard key={product._id} product={product} attributes={attributes} />
                ))}
              </div>
              {bestSellers.length > 5 && (
                <div className="text-center pt-4">
                  <Link
                    href="/search"
                    className="inline-flex items-center justify-center px-8 py-3.5 border border-[#93614E] text-xs font-semibold uppercase tracking-widest text-[#93614E] hover:bg-[#93614E] hover:text-white rounded-full transition-all duration-300"
                  >
                    Show All
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="py-16 text-center text-[#2B211E]/60 bg-white border border-[#D5BBB4]/50 rounded-[24px] max-w-2xl mx-auto">
              Please seed the best seller items into the database.
            </div>
          )}
        </section>

        {/* 8. Featured Premium Collections Section */}
        <section className="py-10 sm:py-14 lg:py-20 bg-white border-t border-[#D5BBB4]/40">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-16">
            <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
              <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.2em] text-[#93614E] mb-2">Premium Curations</p>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-[#2B211E] font-serif">Featured Collections</h2>
              <div className="h-[1px] w-12 bg-[#C7A46A] mx-auto mt-3 sm:mt-4" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-8">
              {premiumCollections.map((col, idx) => (
                <Link
                  key={idx}
                  href={`/search?category=${col.slug}`}
                  className="group block relative overflow-hidden rounded-[24px] shadow-sm bg-[#FAF7F5] border border-[#D5BBB4]/30 hover:shadow-md transition-all duration-300"
                >
                  <div className="aspect-[4/3] w-full overflow-hidden relative">
                    <img
                      src={col.bg}
                      alt={col.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-[#2B211E]/5 group-hover:bg-transparent transition-all" />
                  </div>
                  <div className="p-4 sm:p-6">
                    <h3 className="text-base sm:text-xl font-medium text-[#2B211E] group-hover:text-[#93614E] transition-colors">
                      {col.title}
                    </h3>
                    <p className="text-sm text-[#2B211E]/70 mt-1 font-light italic leading-relaxed">
                      {col.desc}
                    </p>
                    <span className="inline-block mt-4 text-xs font-semibold uppercase tracking-widest text-[#93614E] border-b border-[#93614E]/40 pb-0.5 group-hover:border-[#93614E] transition-all">
                      Discover Collection →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* 9. Customer Reviews */}
        <section className="py-10 sm:py-14 lg:py-20 bg-[#FAF7F5] border-y border-[#D5BBB4]/40">
          <CustomerReviewSection />
        </section>

        {manchandaHomepage?.instagramPosts?.length > 0 && (
          <InstagramFeed posts={manchandaHomepage.instagramPosts} />
        )}

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
      manchandaHomepage: data?.manchandaHomepage || null,
    },
    revalidate: 10,
  };
};

export default Home;
