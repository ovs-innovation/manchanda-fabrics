import React from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation, EffectFade } from "swiper/modules";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { IoChevronForward } from "react-icons/io5";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

import { LOCAL_BANNERS, traditionalPhoto } from "@utils/traditionalImagery";

const HeroBanner = ({ slides: dynamicSlides }) => {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const defaultSlides = [
    {
      style: "layout-left-framed",
      badge: "Straight Suit Sets",
      title: "Gaji Silk Suit Collection",
      subtitle: "Biba-inspired straight kurta sets with rich silk weaves, zari borders & graceful dupattas.",
      highlight: "Festive • Pure Silk Suits",
      btnText: "Shop Gaji Silk Suits",
      btnLink: "/search?category=gaji-silk",
      bgImage: LOCAL_BANNERS.gajiSilk,
    },
    {
      style: "layout-right-split",
      badge: "Wedding Edit",
      title: "Bangalori Silk Suit Sets",
      subtitle: "Embroidered salwar suits with premium resham work — perfect for receptions & celebrations.",
      highlight: "Heritage Ethnic Wear",
      btnText: "Explore Silk Suits",
      btnLink: "/search?category=bangalori-silk-pure",
      bgImage: LOCAL_BANNERS.bangaloriSilk,
    },
    {
      style: "layout-center-minimal",
      badge: "Artisan Craft",
      title: "Applique Work Suit Sets",
      subtitle: "Handcrafted applique on cotton-silk suits — traditional elegance for mehendi & festivals.",
      highlight: "Limited Edition Suits",
      btnText: "Shop Applique Suits",
      btnLink: "/search?category=applique-work",
      bgImage: LOCAL_BANNERS.appliqueSuit,
    },
    {
      style: "layout-offset-box",
      badge: "Daily Elegance",
      title: "Mul Cotton Suit Fabrics",
      subtitle: "Soft pastel suit fabrics in handblock prints — breathable comfort for everyday ethnic style.",
      highlight: "Summer Suit Edit",
      btnText: "Browse Cotton Suits",
      btnLink: "/search?category=mul-cotton",
      bgImage: LOCAL_BANNERS.mulCotton,
    },
  ];

  let slides = [];
  if (dynamicSlides && dynamicSlides.length > 0) {
    slides = dynamicSlides.map((s, idx) => {
      const fallback = defaultSlides[idx % defaultSlides.length];
      return {
        style: s.style || fallback.style,
        badge: s.badge || fallback.badge,
        title: s.title || fallback.title,
        subtitle: s.subtitle || fallback.subtitle,
        highlight: s.highlight || fallback.highlight,
        btnText: s.btnText || fallback.btnText,
        btnLink: s.link || s.btnLink || fallback.btnLink,
        bgImage: s.image || s.bgImage || fallback.bgImage || traditionalPhoto("straightSuit", 1600),
      };
    });
  } else {
    slides = defaultSlides;
  }

  if (!mounted) {
    return (
      <div
        id="hero-section"
        className="relative w-full h-[min(72vh,420px)] sm:h-[480px] md:h-[540px] lg:h-[600px] bg-[#FAF7F5] font-sans hero-slider-container animate-pulse"
      />
    );
  }

  return (
    <div
      id="hero-section"
      className="relative w-full h-[min(72vh,420px)] sm:h-[480px] md:h-[540px] lg:h-[600px] bg-[#FAF7F5] font-sans group hero-slider-container"
    >
      <Swiper
        modules={[Autoplay, Pagination, Navigation, EffectFade]}
        
        spaceBetween={0}
        slidesPerView={1}
        loop={slides.length >= 2}
        pagination={{ clickable: true, el: ".swiper-pagination-custom" }}
        navigation={{
          nextEl: ".swiper-button-next-custom",
          prevEl: ".swiper-button-prev-custom",
        }}
        autoplay={{ delay: 6500, disableOnInteraction: false }}
        className="h-full w-full"
      >
        {slides.map((slide, index) => {
          let alignmentClass = "justify-start text-left";
          let overlayClass = "absolute inset-0 bg-black/45 lg:bg-gradient-to-r lg:from-black/70 lg:via-black/40 lg:to-transparent z-0";
          
          if (slide.style === "layout-right-split") {
            alignmentClass = "justify-end text-right";
            overlayClass = "absolute inset-0 bg-black/45 lg:bg-gradient-to-l lg:from-black/70 lg:via-black/40 lg:to-transparent z-0";
          } else if (slide.style === "layout-center-minimal") {
            alignmentClass = "justify-center text-center";
            overlayClass = "absolute inset-0 bg-black/50 z-0";
          }

          return (
            <SwiperSlide key={index} className="h-full w-full relative">
              {/* Background Image */}
              <div className="absolute inset-0 z-0">
                <img
                  src={slide.bgImage}
                  alt={slide.title}
                  className="w-full h-full object-cover object-[center_35%]"
                />
                {/* Dark Gradient Overlay for high text readability */}
                <div className={overlayClass} />
              </div>
              
              {/* Flat Typographic Content (No Cards, No Borders) */}
              <div className={`absolute inset-0 max-w-screen-2xl mx-auto px-4 sm:px-10 lg:px-16 flex items-center z-10 text-white ${alignmentClass}`}>
                <div className="w-full max-w-xl space-y-3 sm:space-y-4">
                  <span className="inline-block text-[9px] sm:text-xs font-bold uppercase tracking-[0.25em] text-[#E6D1CB]">
                    {slide.badge}
                  </span>
                  
                  <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-light tracking-tight leading-[1.15] text-white">
                    {slide.title}
                  </h2>
                  
                  <p className="text-xs sm:text-sm md:text-base text-neutral-200/90 font-light leading-relaxed max-w-lg mx-auto lg:mx-0 line-clamp-3 sm:line-clamp-none">
                    {slide.subtitle}
                  </p>
                  
                  <div className={`flex items-center gap-2 ${slide.style === "layout-center-minimal" ? "justify-center" : slide.style === "layout-right-split" ? "justify-end" : "justify-start"}`}>
                    <span className="h-[1px] w-6 bg-[#E6D1CB]" />
                    <span className="text-[10px] sm:text-xs font-bold tracking-wider text-[#E6D1CB] uppercase">
                      {slide.highlight}
                    </span>
                  </div>
                  
                  <div className="pt-1 sm:pt-2">
                    <Link
                      href={slide.btnLink}
                      className="inline-flex items-center gap-2 px-5 sm:px-8 py-2.5 sm:py-3.5 bg-[#9C6A5A] hover:bg-[#6F4A3D] text-white font-bold text-[10px] sm:text-xs uppercase tracking-widest transition-all duration-300 rounded shadow-md"
                    >
                      <span>{slide.btnText}</span>
                      <IoChevronForward className="text-xs" />
                    </Link>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>

      {/* Navigation Buttons (Biba Style layout arrows) */}
      <button className="swiper-button-prev-custom absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/40 hover:bg-white text-[#3B2A25] flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hidden md:flex shadow-md">
        <FiChevronLeft className="text-xl" />
      </button>
      <button className="swiper-button-next-custom absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/40 hover:bg-white text-[#3B2A25] flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hidden md:flex shadow-md">
        <FiChevronRight className="text-xl" />
      </button>

      {/* Custom pagination — always visible on mobile */}
      <div className="swiper-pagination-custom absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-2" />

      <style jsx global>{`
        .hero-slider-container .swiper-pagination-custom .swiper-pagination-bullet {
          width: 8px;
          height: 8px;
          background: #ffffff !important;
          opacity: 0.4 !important;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .hero-slider-container .swiper-pagination-custom .swiper-pagination-bullet-active {
          width: 24px;
          background: #ffffff !important;
          opacity: 1 !important;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
};

export default HeroBanner;
