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
import BrandServices from "@services/BrandServices";
import SectionHeader from "@components/common/SectionHeader";
import NewsletterSection from "@components/newsletter/NewsletterSection";
import CustomerReviewSection from "@components/review/CustomerReviewSection";
import InstagramFeed from "@components/instagram/InstagramFeed";

const Home = ({ popularProducts, bestSellingProducts, attributes, rasaHomepage }) => {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const newArrivals = popularProducts || [];
  const bestSellers = bestSellingProducts || [];

  // Mock items if db is empty initially
  const defaultNewArrivals = newArrivals.length > 0 ? newArrivals : [];
  const defaultBestSellers = bestSellers.length > 0 ? bestSellers : [];

  // Section 2: Dynamic Category Cards from Admin panel, fallback to defaults
  const categoryCards = rasaHomepage?.categoryBanners?.length > 0
    ? rasaHomepage.categoryBanners.map(c => ({
        title: c.title,
        image: c.image || "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600",
        slug: c.slug
      }))
    : [
        { title: "Banarasi Sarees", image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600", slug: "sarees" },
        { title: "Silk Sarees", image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=600", slug: "sarees" },
        { title: "Cotton Sarees", image: "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?q=80&w=600", slug: "sarees" },
        { title: "Designer Sarees", image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600", slug: "sarees" },
        { title: "Premium Suits", image: "https://images.unsplash.com/photo-1608748010899-18f300247112?q=80&w=600", slug: "suits" },
        { title: "Exquisite Fabrics", image: "https://images.unsplash.com/photo-1610030469668-93535c17b6b3?q=80&w=600", slug: "fabrics" },
      ];

  const renderProductCarousel = (products, prevClass, nextClass) => {
    if (!mounted) {
      return <div className="h-96 w-full bg-[#FAF7F5] animate-pulse rounded-xl" />;
    }

    if (!products || products.length === 0) {
      return (
        <div className="py-12 text-center text-[#3B2A25]/60 bg-white border border-[#E6D1CB]/50 rounded-xl">
          No premium items found. Please seed the database catalog.
        </div>
      );
    }

    return (
      <div className="relative group px-2">
        <Swiper
          modules={[Navigation, Autoplay]}
          spaceBetween={20}
          slidesPerView={2}
          loop={products.length >= 5}
          navigation={{ prevEl: `.${prevClass}`, nextEl: `.${nextClass}` }}
          autoplay={{ delay: 4000, disableOnInteraction: false, pauseOnMouseEnter: true }}
          breakpoints={{
            640: { slidesPerView: 2, spaceBetween: 20 },
            768: { slidesPerView: 3, spaceBetween: 24 },
            1024: { slidesPerView: 4, spaceBetween: 24 },
            1280: { slidesPerView: 5, spaceBetween: 24 },
          }}
          className="mySwiper !pb-8 !pt-2"
        >
          {products.map((product) => (
            <SwiperSlide key={product._id}>
              <div className="bg-white p-3 border border-[#E6D1CB]/40 rounded-xl hover:shadow-md transition-all duration-300">
                <ProductCard product={product} attributes={attributes} />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        <button className={`${prevClass} absolute top-1/2 -left-3 z-10 bg-white shadow-md border border-[#E6D1CB] rounded-full p-2.5 hover:bg-[#FAF7F5] transition-colors transform -translate-y-1/2`}>
          <IoChevronBack className="text-lg text-[#9C6A5A]" />
        </button>
        <button className={`${nextClass} absolute top-1/2 -right-3 z-10 bg-white shadow-md border border-[#E6D1CB] rounded-full p-2.5 hover:bg-[#FAF7F5] transition-colors transform -translate-y-1/2`}>
          <IoChevronForward className="text-lg text-[#9C6A5A]" />
        </button>
      </div>
    );
  };

  const order = rasaHomepage?.sectionOrder || ["Hero", "Categories", "New Arrival", "Trending", "Instagram"];

  if (!mounted) {
    return (
      <Layout>
        <div className="min-h-screen bg-[#FAF7F5]" />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-[#FAF7F5] text-[#3B2A25]">
        {order.map((sectionName) => {
          if (sectionName === "Hero") {
            return <HeroBanner key="hero" slides={rasaHomepage?.heroSlides} />;
          }

          if (sectionName === "Categories") {
            return (
              <React.Fragment key="categories">
                {/* Section 2: Shop By Category (Biba Circular Style) */}
                <section className="py-16 md:py-24 mx-auto max-w-screen-2xl px-6 sm:px-10 lg:px-16">
                  <div className="text-center max-w-2xl mx-auto mb-16">
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#9C6A5A] mb-2">Heritage Categories</p>
                    <h2 className="text-3xl md:text-4xl font-serif font-light text-[#3B2A25]">Shop By Category</h2>
                    <div className="h-[2px] w-12 bg-[#9C6A5A] mx-auto mt-4" />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 justify-items-center">
                    {categoryCards.map((cat, idx) => (
                      <Link key={idx} href={`/search?category=${cat.slug}`} className="group flex flex-col items-center select-none w-full max-w-[180px]">
                        {/* Dual Border Luxury Frame */}
                        <div className="relative w-32 h-32 sm:w-36 sm:h-36 lg:w-40 lg:h-40 xl:w-44 xl:h-44 rounded-full p-1.5 border border-[#E6D1CB]/50 group-hover:border-[#9C6A5A]/60 transition-all duration-500 flex-shrink-0 flex items-center justify-center bg-white shadow-sm group-hover:shadow-md">
                          <div className="w-full h-full rounded-full overflow-hidden relative border border-[#E6D1CB]/30">
                            <img
                              src={cat.image}
                              alt={cat.title}
                              className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-108"
                            />
                            <div className="absolute inset-0 bg-[#3B2A25]/5 group-hover:bg-transparent transition-colors duration-300" />
                          </div>
                        </div>
                        {/* Elegant Typography */}
                        <h3 className="mt-4 font-serif text-sm sm:text-base font-normal text-[#3B2A25] group-hover:text-[#9C6A5A] transition-colors duration-300 text-center">
                          {cat.title}
                        </h3>
                        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#9C6A5A] mt-1 opacity-0 transform translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                          Shop Now
                        </span>
                      </Link>
                    ))}
                  </div>
                </section>

                {/* Section 3: Biba Style Campaign Spotlights (3-Column Grid) */}
                <section className="py-12 bg-[#FAF7F5] border-t border-[#E6D1CB]/50">
                  <div className="mx-auto max-w-screen-2xl px-6 sm:px-10 lg:px-16">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <Link href="/search?category=sarees" className="group relative block overflow-hidden rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                        <div className="relative aspect-[4/5] w-full overflow-hidden bg-white">
                          <img
                            src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600"
                            alt="Sarees Spotlight"
                            className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#3B2A25]/90 via-[#3B2A25]/20 to-transparent" />
                          <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
                            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#E6D1CB]">Heritage Weaves</span>
                            <h3 className="text-xl font-serif font-light">The Saree Edit</h3>
                            <p className="text-[10px] text-white/80 uppercase tracking-widest">Shop Pure Silk & Banarasis →</p>
                          </div>
                        </div>
                      </Link>
                      <Link href="/search?category=suits" className="group relative block overflow-hidden rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                        <div className="relative aspect-[4/5] w-full overflow-hidden bg-white">
                          <img
                            src="https://images.unsplash.com/photo-1608748010899-18f300247112?q=80&w=600"
                            alt="Suits Spotlight"
                            className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#3B2A25]/90 via-[#3B2A25]/20 to-transparent" />
                          <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
                            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#E6D1CB]">Traditional Sets</span>
                            <h3 className="text-xl font-serif font-light">Designer Suits</h3>
                            <p className="text-[10px] text-white/80 uppercase tracking-widest">Shop Salwars & Anarkalis →</p>
                          </div>
                        </div>
                      </Link>
                      <Link href="/search?category=fabrics" className="group relative block overflow-hidden rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                        <div className="relative aspect-[4/5] w-full overflow-hidden bg-white">
                          <img
                            src="https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?q=80&w=600"
                            alt="Fabrics Spotlight"
                            className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#3B2A25]/90 via-[#3B2A25]/20 to-transparent" />
                          <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
                            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#E6D1CB]">Tailored Style</span>
                            <h3 className="text-xl font-serif font-light">Premium Fabrics</h3>
                            <p className="text-[10px] text-white/80 uppercase tracking-widest">Shop Unstitched Luxury →</p>
                          </div>
                        </div>
                      </Link>
                    </div>
                  </div>
                </section>
              </React.Fragment>
            );
          }

          if (sectionName === "New Arrival") {
            return (
              <section key="new-arrival" className="py-16 bg-white border-y border-[#E6D1CB]/50">
                <div className="mx-auto max-w-screen-2xl px-6 sm:px-10 lg:px-16">
                  <div className="flex justify-between items-center mb-8 gap-4 border-b border-[#E6D1CB]/40 pb-4">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#FAF7F5] border border-[#E6D1CB] text-[#9C6A5A] text-[9px] font-bold uppercase tracking-widest rounded-full mb-2">
                        <IoSparkles className="text-[#9C6A5A]" />
                        <span>Latest Additions</span>
                      </div>
                      <h2 className="text-2xl md:text-3xl font-serif font-light text-[#3B2A25]">New Arrivals</h2>
                    </div>
                    <Link
                      href="/new-arrivals"
                      className="group inline-flex items-center gap-1.5 px-4 py-2 border border-[#E6D1CB] rounded-md text-xs font-bold uppercase tracking-wider text-[#3B2A25]/80 hover:text-[#9C6A5A] hover:border-[#9C6A5A] transition-all"
                    >
                      <span>View All</span>
                      <IoChevronForward className="transition-transform group-hover:translate-x-0.5 text-[#9C6A5A] text-xs" />
                    </Link>
                  </div>
                  {renderProductCarousel(defaultNewArrivals, "prev-new-arrivals", "next-new-arrivals")}
                </div>
              </section>
            );
          }

          if (sectionName === "Trending") {
            return (
              <section key="trending" className="py-16 md:py-24 mx-auto max-w-screen-2xl px-6 sm:px-10 lg:px-16">
                <div className="text-center max-w-2xl mx-auto mb-16">
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#9C6A5A] mb-2">Most Loved</p>
                  <h2 className="text-3xl md:text-4xl font-serif font-light text-[#3B2A25]">Best Sellers</h2>
                  <div className="h-[2px] w-12 bg-[#9C6A5A] mx-auto mt-4" />
                </div>

                {defaultBestSellers.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {defaultBestSellers.map((product) => (
                      <div key={product._id} className="bg-white p-3 border border-[#E6D1CB]/40 rounded-xl hover:shadow-md transition-all duration-300">
                        <ProductCard product={product} attributes={attributes} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-16 text-center text-[#3B2A25]/60 bg-white border border-[#E6D1CB]/50 rounded-xl max-w-2xl mx-auto">
                    Please seed the best seller items into the database.
                  </div>
                )}
              </section>
            );
          }

          if (sectionName === "Instagram") {
            return (
              <React.Fragment key="instagram">
                <InstagramFeed posts={rasaHomepage?.instagramPosts} />

                {/* Section 6: Biba Style Editorial Split (Heritage Diaries) */}
                <section className="py-16 bg-white border-y border-[#E6D1CB]/50">
                  <div className="max-w-screen-2xl mx-auto px-6 sm:px-10 lg:px-16">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                      <div className="relative aspect-[16/10] lg:aspect-[4/3] rounded-2xl overflow-hidden shadow-lg">
                        <img
                          src="https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=800"
                          alt="Manchanda Heritage Weaving"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-[#3B2A25]/15" />
                      </div>
                      <div className="space-y-6 lg:pl-6">
                        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#9C6A5A]">Crafted with Love</span>
                        <h2 className="text-3xl md:text-4xl font-serif font-light text-[#3B2A25] leading-tight">
                          Generations of <br />
                          <span className="italic font-normal text-[#9C6A5A]">Pure Artistry</span>
                        </h2>
                        <p className="text-sm text-[#3B2A25]/85 leading-relaxed">
                          Every Manchanda creation represents generation-old handloom expertise. Directly cooperating with weaver clusters across Banaras, Kanchipuram, and Bhagalpur, we preserve pure zari, natural silks, and hand-embroidered details to bring royal elegance to your wardrobe.
                        </p>
                        <div className="pt-2">
                          <Link href="/about-us" className="inline-block px-8 py-3.5 bg-[#9C6A5A] hover:bg-[#6F4A3D] text-white text-xs font-bold uppercase tracking-widest rounded transition-colors shadow">
                            Our Weaving Journey
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Section 7: Why Choose Us */}
                <section className="py-16 bg-[#FAF7F5]">
                  <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className="w-12 h-12 bg-white border border-[#E6D1CB] rounded-full flex items-center justify-center text-[#9C6A5A]">
                        <FiAward size={20} />
                      </div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#3B2A25]">Premium Fabrics</h4>
                      <p className="text-[10px] text-[#3B2A25]/60 max-w-[160px]">Finest handloom silk, cotton, and georgette materials</p>
                    </div>
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className="w-12 h-12 bg-white border border-[#E6D1CB] rounded-full flex items-center justify-center text-[#9C6A5A]">
                        <FiShield size={20} />
                      </div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#3B2A25]">Authentic Weaves</h4>
                      <p className="text-[10px] text-[#3B2A25]/60 max-w-[160px]">Directly sourced from master weavers across India</p>
                    </div>
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className="w-12 h-12 bg-white border border-[#E6D1CB] rounded-full flex items-center justify-center text-[#9C6A5A]">
                        <FiSmartphone size={20} />
                      </div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#3B2A25]">Secure Payments</h4>
                      <p className="text-[10px] text-[#3B2A25]/60 max-w-[160px]">Encrypted checkouts & secure transaction gateways</p>
                    </div>
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className="w-12 h-12 bg-white border border-[#E6D1CB] rounded-full flex items-center justify-center text-[#9C6A5A]">
                        <FiRotateCcw size={20} />
                      </div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#3B2A25]">Easy Returns</h4>
                      <p className="text-[10px] text-[#3B2A25]/60 max-w-[160px]">Hassle-free replacement policy if not satisfied</p>
                    </div>
                  </div>
                </section>

                {/* Section 8: Testimonials - moved below */}
              </React.Fragment>
            );
          }
          return null;
        })}

        {/* Section 10: About Brand */}
        <section className="py-20 mx-auto max-w-5xl px-6 text-center space-y-6">
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#9C6A5A]">Our Story</span>
          <h2 className="text-3xl md:text-4xl font-serif font-light text-[#3B2A25]">Manchanda Fabrics</h2>
          <div className="h-[2px] w-12 bg-[#9C6A5A] mx-auto mt-2" />
          <p className="text-sm text-[#3B2A25]/80 leading-relaxed max-w-3xl mx-auto">
            Rooted in heritage and dedicated to absolute purity, Manchanda Fabrics celebrates India's vibrant weaving cultures. We curate the finest pure silks, traditional Banarasis, custom embroideries, and comfortable daily fabrics. Each thread in our collections tells a story of generation-old artisanship, design integrity, and premium quality crafted for the modern woman who values style and tradition.
          </p>
          <div className="pt-2">
            <Link href="/about-us" className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-[#9C6A5A] hover:text-[#6F4A3D] transition-colors">
              <span>Discover Our Heritage</span>
              <span>→</span>
            </Link>
          </div>
        </section>

      </div>

      {/* Customer Reviews — always just above the footer */}
      <CustomerReviewSection />

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
      rasaHomepage: data?.rasaHomepage || null,
    },
    revalidate: 30,
  };
};

export default Home;
