import React, { useState, useEffect, useRef, useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/autoplay";

import { PRODUCT_PLACEHOLDER } from "@utils/brandAssets";
import { resolveColorHex } from "@utils/resolveColorHex";

const ProductImageGallery = ({
  slides: rawSlides,
  images,
  productTitle = "Product",
  buttons,
  variant = "default",
  selectedColorVar,
  onColorVarChange,
}) => {
  const isAisha = variant === "aisha";
  const swiperRef = useRef(null);
  const thumbRefs = useRef([]);
  const [activeIndex, setActiveIndex] = useState(0);

  // Helper media checkers
  const isVideoUrl = (url = "") => {
    if (!url || typeof url !== "string") return false;
    const lowered = url.toLowerCase();
    return (
      lowered.includes(".mp4") ||
      lowered.includes(".mov") ||
      lowered.includes(".webm")
    );
  };

  const isYoutubeUrl = (url = "") => {
    if (!url || typeof url !== "string") return false;
    const lowered = url.toLowerCase();
    return lowered.includes("youtube.com/") || lowered.includes("youtu.be/");
  };

  const getYoutubeThumbnail = (url = "") => {
    if (!isYoutubeUrl(url)) return null;
    const ytMatch =
      url.match(/[?&]v=([^&#]+)/i) ||
      url.match(/youtu\.be\/([^&#?/]+)/i) ||
      url.match(/\/embed\/([^&#?/]+)/i);
    const videoId = ytMatch?.[1];
    if (!videoId) return null;
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  };

  const getYoutubeEmbedUrl = (url = "") => {
    if (!isYoutubeUrl(url)) return null;
    const ytMatch =
      url.match(/[?&]v=([^&#]+)/i) ||
      url.match(/youtu\.be\/([^&#?/]+)/i) ||
      url.match(/\/embed\/([^&#?/]+)/i);
    const videoId = ytMatch?.[1];
    if (!videoId) return null;
    return `https://www.youtube.com/embed/${videoId}`;
  };

  // Build clean slides list from slides prop or fallback images
  const displaySlides = useMemo(() => {
    if (Array.isArray(rawSlides) && rawSlides.length > 0) {
      const valid = rawSlides.filter(
        (s) => s && s.url && typeof s.url === "string" && s.url.trim() !== ""
      );
      if (valid.length > 0) return valid;
    }
    if (Array.isArray(images) && images.length > 0) {
      const valid = images.filter(
        (u) => u && typeof u === "string" && u.trim() !== ""
      );
      if (valid.length > 0) {
        return valid.map((url, i) => ({
          url,
          colorVar: null,
          colorName: null,
          id: `img-${i}-${url}`,
        }));
      }
    }
    return [
      {
        url: PRODUCT_PLACEHOLDER,
        colorVar: null,
        colorName: null,
        id: "placeholder",
      },
    ];
  }, [rawSlides, images]);

  const isLoop = displaySlides.length > 1;

  // Sync active slide index when selectedColorVar changes from outside (e.g. user clicked a color circle)
  useEffect(() => {
    if (!selectedColorVar || !swiperRef.current || displaySlides.length <= 1) return;
    const currentSlide = displaySlides[activeIndex];
    const isMatching =
      currentSlide?.colorVar &&
      ((selectedColorVar._id &&
        currentSlide.colorVar._id &&
        String(selectedColorVar._id) === String(currentSlide.colorVar._id)) ||
        (selectedColorVar.colorName &&
          currentSlide.colorVar.colorName &&
          selectedColorVar.colorName.toLowerCase() ===
            currentSlide.colorVar.colorName.toLowerCase()));

    if (isMatching) return;

    const targetIdx = displaySlides.findIndex((s) => {
      if (!s.colorVar) return false;
      if (selectedColorVar._id && s.colorVar._id) {
        return String(selectedColorVar._id) === String(s.colorVar._id);
      }
      return (
        selectedColorVar.colorName &&
        s.colorVar.colorName &&
        selectedColorVar.colorName.toLowerCase() ===
          s.colorVar.colorName.toLowerCase()
      );
    });

    if (targetIdx !== -1 && targetIdx !== activeIndex) {
      if (isLoop) {
        swiperRef.current.slideToLoop(targetIdx, 400);
      } else {
        swiperRef.current.slideTo(targetIdx, 400);
      }
      setActiveIndex(targetIdx);
    }
  }, [selectedColorVar, displaySlides, isLoop, activeIndex]);

  // Scroll active thumbnail into view
  useEffect(() => {
    if (thumbRefs.current[activeIndex]) {
      try {
        thumbRefs.current[activeIndex].scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "nearest",
        });
      } catch (err) {}
    }
  }, [activeIndex]);

  const handleSlideChange = (swiper) => {
    const idx = isLoop ? swiper.realIndex : swiper.activeIndex;
    setActiveIndex(idx);
    const activeSlide = displaySlides[idx];
    if (activeSlide?.colorVar && onColorVarChange) {
      onColorVarChange(activeSlide.colorVar);
    }
  };

  const handleThumbnailClick = (index) => {
    if (index >= 0 && index < displaySlides.length) {
      if (swiperRef.current) {
        if (isLoop) {
          swiperRef.current.slideToLoop(index, 400);
        } else {
          swiperRef.current.slideTo(index, 400);
        }
      }
      setActiveIndex(index);
      const activeSlide = displaySlides[index];
      if (activeSlide?.colorVar && onColorVarChange) {
        onColorVarChange(activeSlide.colorVar);
      }
    }
  };

  const handlePrev = (e) => {
    e?.stopPropagation?.();
    if (swiperRef.current) {
      swiperRef.current.slidePrev(400);
    }
  };

  const handleNext = (e) => {
    e?.stopPropagation?.();
    if (swiperRef.current) {
      swiperRef.current.slideNext(400);
    }
  };

  const handleImageError = (e) => {
    if (e.target.src !== PRODUCT_PLACEHOLDER) {
      e.target.src = PRODUCT_PLACEHOLDER;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 lg:items-start bg-transparent">
      {/* Thumbnail Strip: Left Vertical on Desktop, Horizontal Scroll on Mobile */}
      {displaySlides.length > 1 && (
        <div className="flex lg:flex-col flex-row gap-2.5 order-2 lg:order-1 overflow-x-auto lg:overflow-x-visible lg:overflow-y-auto max-h-[560px] pb-2 lg:pb-0 scrollbar-thin select-none">
          {displaySlides.map((slide, index) => {
            const isSlideActive = index === activeIndex;
            const mediaUrl = slide.url;
            return (
              <button
                key={`thumb-${slide.id || index}`}
                ref={(el) => (thumbRefs.current[index] = el)}
                onClick={() => handleThumbnailClick(index)}
                className={`flex-shrink-0 relative w-16 h-20 sm:w-[72px] sm:h-[90px] rounded-lg border overflow-hidden transition-all duration-200 cursor-pointer ${
                  isSlideActive
                    ? isAisha
                      ? "border-[#111111] ring-2 ring-[#111111]/30 shadow-md scale-[1.03]"
                      : "border-[#9C6A5A] ring-2 ring-[#9C6A5A]/30 shadow-md scale-[1.03]"
                    : "border-neutral-200/90 hover:border-neutral-400 opacity-70 hover:opacity-100 bg-neutral-50"
                }`}
                type="button"
                title={slide.colorName ? `${productTitle} - ${slide.colorName}` : `${productTitle} - ${index + 1}`}
              >
                {isVideoUrl(mediaUrl) ? (
                  <video
                    src={mediaUrl}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                  />
                ) : (
                  <>
                    <img
                      src={
                        isYoutubeUrl(mediaUrl)
                          ? getYoutubeThumbnail(mediaUrl) || PRODUCT_PLACEHOLDER
                          : mediaUrl || PRODUCT_PLACEHOLDER
                      }
                      alt={`${productTitle} - View ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={handleImageError}
                      loading="lazy"
                    />
                    {isYoutubeUrl(mediaUrl) && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-25">
                        <span className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow">
                          <span className="ml-0.5 border-l-6 border-y-3 border-l-red-600 border-y-transparent" />
                        </span>
                      </div>
                    )}
                  </>
                )}

                {/* Optional mini color indicator dot on thumbnail */}
                {slide.colorVar && (
                  <span
                    className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full border border-white shadow-xs"
                    style={{
                      backgroundColor: resolveColorHex(
                        slide.colorVar.colorCode,
                        slide.colorVar.colorName
                      ),
                    }}
                    title={slide.colorVar.colorName}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Main Preview Slider with Full Touch-Swipe Support */}
      <div className="flex-1 order-1 lg:order-2 w-full min-w-0">
        <div
          className={`group relative w-full aspect-[4/5] bg-white overflow-hidden rounded-xl sm:rounded-2xl select-none ${
            isAisha
              ? "border border-neutral-200/80 shadow-xs"
              : "border border-[#E6D1CB]/60 shadow-lg"
          }`}
        >
          {/* Overlay Buttons (e.g. wishlist/share) */}
          {buttons}

          {/* Floating Slide Counter Badge */}
          {displaySlides.length > 1 && (
            <div className="absolute top-3 right-3 z-20 bg-black/65 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-1 rounded-full shadow-sm tracking-wider flex items-center gap-1.5 select-none pointer-events-none">
              <span>
                {activeIndex + 1} / {displaySlides.length}
              </span>
              {displaySlides[activeIndex]?.colorName && (
                <>
                  <span className="w-1 h-1 rounded-full bg-white/60" />
                  <span className="truncate max-w-[90px]">
                    {displaySlides[activeIndex].colorName}
                  </span>
                </>
              )}
            </div>
          )}

          {/* Navigation Chevron Buttons (Visible on desktop hover) */}
          {displaySlides.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-neutral-800 items-center justify-center shadow-md transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer border border-neutral-200/70 sm:flex hidden"
                aria-label="Previous image"
              >
                <FiChevronLeft size={20} />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-neutral-800 items-center justify-center shadow-md transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer border border-neutral-200/70 sm:flex hidden"
                aria-label="Next image"
              >
                <FiChevronRight size={20} />
              </button>
            </>
          )}

          {/* Swiper Slider with Seamless Infinite Loop & Automatic Sliding */}
          <Swiper
            modules={[Navigation, Autoplay]}
            slidesPerView={1}
            spaceBetween={0}
            loop={isLoop}
            speed={450}
            grabCursor={true}
            resistance={true}
            resistanceRatio={0.85}
            touchRatio={1}
            threshold={5}
            touchStartPreventDefault={false}
            preventClicks={false}
            preventClicksPropagation={false}
            autoplay={
              displaySlides.length > 1
                ? {
                    delay: 3500,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true,
                  }
                : false
            }
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
            }}
            onSlideChange={handleSlideChange}
            style={{ width: "100%", height: "100%", touchAction: "pan-y" }}
            className="w-full h-full product-gallery-swiper"
          >
            {displaySlides.map((slide, index) => {
              const mediaUrl = slide.url;
              return (
                <SwiperSlide
                  key={slide.id || `slide-${index}`}
                  className="w-full h-full flex items-center justify-center bg-white"
                >
                  {isVideoUrl(mediaUrl) ? (
                    <video
                      src={mediaUrl}
                      className="w-full h-full object-contain"
                      controls
                    />
                  ) : isYoutubeUrl(mediaUrl) ? (
                    <iframe
                      src={getYoutubeEmbedUrl(mediaUrl) || ""}
                      title={productTitle}
                      className="w-full h-full object-contain"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  ) : (
                    <img
                      src={mediaUrl || PRODUCT_PLACEHOLDER}
                      alt={
                        slide.colorName
                          ? `${productTitle} - ${slide.colorName}`
                          : `${productTitle} - ${index + 1}`
                      }
                      onError={handleImageError}
                      loading={index === 0 ? "eager" : "lazy"}
                      draggable={false}
                      className="w-full h-full object-contain pointer-events-none select-none"
                    />
                  )}
                </SwiperSlide>
              );
            })}
          </Swiper>

          {/* Discrete Bottom Dots Indicator */}
          {displaySlides.length > 1 && (
            <div className="absolute bottom-3 left-0 right-0 z-20 flex justify-center items-center pointer-events-none">
              <div className="bg-black/40 backdrop-blur-md px-2.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm pointer-events-auto">
                {displaySlides.map((s, idx) => (
                  <button
                    key={`dot-${idx}-${s.id || idx}`}
                    type="button"
                    onClick={() => handleThumbnailClick(idx)}
                    className={`transition-all duration-300 rounded-full cursor-pointer ${
                      idx === activeIndex
                        ? "w-5 h-1.5 bg-white"
                        : "w-1.5 h-1.5 bg-white/50 hover:bg-white/80"
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductImageGallery;


