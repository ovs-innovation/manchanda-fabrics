import React from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation, EffectFade } from "swiper/modules";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { IoChevronForward } from "react-icons/io5";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";


const HeroBanner = ({ slides: dynamicSlides }) => {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const defaultSlides = [
    {
      style: "layout-left-framed",
      badge: "Signature Collection",
      title: "Exquisite Gaji Silk",
      subtitle: "Handloomed pure satin-silk heritage weaves with intricate golden borders and luxurious drapes.",
      highlight: "Hit Product • Pure Silk",
      btnText: "Shop Gaji Silk",
      btnLink: "/search?category=gaji-silk",
      bgImage: "/banners/gaji-silk.jpg",
    },
    {
      style: "layout-right-split",
      badge: "Bestseller Heritage",
      title: "Bangalori Silk Pure",
      subtitle: "Rich traditional textures, premium resham embroidery, and structured royal falls.",
      highlight: "100% Authentic Handloom",
      btnText: "Explore Collection",
      btnLink: "/search?category=bangalori-silk-pure",
      bgImage: "/banners/bangalori-silk.jpg",
    },
    {
      style: "layout-center-minimal",
      badge: "Artisanal Highlight",
      title: "Applique Work Suits",
      subtitle: "Stunning handcrafted applique embroidery on premium, breathable cotton-silk ensembles.",
      highlight: "Limited Craft Edition",
      btnText: "Discover Applique",
      btnLink: "/search?category=applique-work",
      bgImage: "/banners/applique-suit.jpg",
    },
    {
      style: "layout-offset-box",
      badge: "Summer Luxury Fabrics",
      title: "Mul Cotton & Muslin",
      subtitle: "Feather-light unstitched boutique fabrics in handblock prints and soft pastel shades.",
      highlight: "Premium Summer Edit",
      btnText: "Browse Fabrics",
      btnLink: "/search?category=mul-cotton",
      bgImage: "/banners/mul-cotton.jpg",
    }
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
        btnLink: s.link || fallback.btnLink,
        bgImage: s.image || s.bgImage || fallback.bgImage
      };
    });
    
    if (slides.length < 4) {
      const needed = 4 - slides.length;
      for (let i = 0; i < needed; i++) {
        const fallbackIndex = (slides.length + i) % defaultSlides.length;
        slides.push(defaultSlides[fallbackIndex]);
      }
    }
  } else {
    slides = defaultSlides;
  }

  if (!mounted) {
    return <div className="relative w-full h-[460px] md:h-[540px] lg:h-[620px] bg-[#FAF7F5] font-sans hero-slider-container" />;
  }

  return (
    <div className="relative w-full h-[460px] md:h-[540px] lg:h-[620px] bg-[#FAF7F5] font-sans group hero-slider-container">
      <Swiper
        modules={[Autoplay, Pagination, Navigation, EffectFade]}
        
        spaceBetween={0}
        slidesPerView={1}
        loop={true}
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
              <div className={`absolute inset-0 max-w-screen-2xl mx-auto px-6 sm:px-16 lg:px-24 flex items-center z-10 text-white ${alignmentClass}`}>
                <div className="w-full max-w-xl space-y-4">
                  <span className="inline-block text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] text-[#E6D1CB]">
                    {slide.badge}
                  </span>
                  
                  <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-light tracking-tight leading-[1.1] text-white">
                    {slide.title}
                  </h2>
                  
                  <p className="text-xs sm:text-sm md:text-base text-neutral-200/90 font-light leading-relaxed max-w-lg mx-auto lg:mx-0">
                    {slide.subtitle}
                  </p>
                  
                  <div className={`flex items-center gap-2 ${slide.style === "layout-center-minimal" ? "justify-center" : slide.style === "layout-right-split" ? "justify-end" : "justify-start"}`}>
                    <span className="h-[1px] w-6 bg-[#E6D1CB]" />
                    <span className="text-[10px] sm:text-xs font-bold tracking-wider text-[#E6D1CB] uppercase">
                      {slide.highlight}
                    </span>
                  </div>
                  
                  <div className="pt-2">
                    <Link
                      href={slide.btnLink}
                      className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#9C6A5A] hover:bg-[#6F4A3D] text-white font-bold text-xs uppercase tracking-widest transition-all duration-300 rounded shadow-md hover:shadow-lg"
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

      {/* Custom pagination positioning */}
      <div className="swiper-pagination-custom absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-2" />

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
