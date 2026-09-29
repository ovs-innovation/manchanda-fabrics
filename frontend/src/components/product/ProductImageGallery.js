import React, { useState, useEffect, useRef, useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { FiChevronLeft, FiChevronRight, FiMaximize2, FiX } from "react-icons/fi";
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
  const thumbContainerRef = useRef(null);
  const galleryRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [modalVideoUrl, setModalVideoUrl] = useState("");
  const prevColorRef = useRef(selectedColorVar);
  const isUserInteractingRef = useRef(false);

  // Helper media checkers
  const isVideoUrl = (url = "") => {
    if (!url || typeof url !== "string") return false;
    const lowered = url.toLowerCase();
    return (
      lowered.includes(".mp4") ||
      lowered.includes(".mov") ||
      lowered.includes(".webm") ||
      lowered.includes(".m4v") ||
      lowered.includes(".ogv") ||
      lowered.includes(".mkv") ||
      lowered.includes("/video/upload") ||
      lowered.includes("/video/")
    );
  };

  const isYoutubeUrl = (url = "") => {
    if (!url || typeof url !== "string") return false;
    const lowered = url.toLowerCase();
    return lowered.includes("youtube.com/") || lowered.includes("youtu.be/");
  };

  const getYoutubeVideoId = (url = "") => {
    if (!isYoutubeUrl(url)) return null;
    const match = url.match(
      /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([^&\n?#]+)/i
    );
    return match?.[1] || null;
  };

  const getYoutubeThumbnail = (url = "") => {
    const videoId = getYoutubeVideoId(url);
    if (!videoId) return null;
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  };

  const getYoutubeEmbedUrl = (url = "") => {
    const videoId = getYoutubeVideoId(url);
    if (!videoId) return null;
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&playsinline=1&rel=0`;
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

  const isLoop = displaySlides.length > 2;

  // Sync active slide index ONLY when selectedColorVar genuinely changes from outside (e.g. user clicked a color circle)
  useEffect(() => {
    const prevColor = prevColorRef.current;
    prevColorRef.current = selectedColorVar;

    if (!selectedColorVar || !swiperRef.current || displaySlides.length <= 1) return;

    // Only proceed if selectedColorVar has actually changed from outside
    const isSameColor =
      prevColor &&
      ((selectedColorVar._id && prevColor._id && String(selectedColorVar._id) === String(prevColor._id)) ||
        (selectedColorVar.colorName &&
          prevColor.colorName &&
          selectedColorVar.colorName.toLowerCase() === prevColor.colorName.toLowerCase()));

    if (isSameColor) return;

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

    if (targetIdx !== -1) {
      if (isLoop && typeof swiperRef.current.slideToLoop === "function") {
        swiperRef.current.slideToLoop(targetIdx, 400);
      } else if (typeof swiperRef.current.slideTo === "function") {
        swiperRef.current.slideTo(targetIdx, 400);
      }
      setActiveIndex(targetIdx);
    }
  }, [selectedColorVar, displaySlides, isLoop]);

  // Scroll active thumbnail smoothly within its container ONLY (never scrolls window/page)
  useEffect(() => {
    const container = thumbContainerRef.current;
    const thumb = thumbRefs.current[activeIndex];
    if (!container || !thumb) return;

    // Check if horizontal scroll (mobile / tablet strip)
    if (container.scrollWidth > container.clientWidth) {
      const containerRect = container.getBoundingClientRect();
      const thumbRect = thumb.getBoundingClientRect();
      const offsetLeft = thumbRect.left - containerRect.left;

      if (offsetLeft < 0 || offsetLeft + thumbRect.width > containerRect.width) {
        container.scrollTo({
          left:
            container.scrollLeft +
            offsetLeft -
            (container.clientWidth / 2 - thumbRect.width / 2),
          behavior: "smooth",
        });
      }
    }
    // Check if vertical scroll (desktop vertical column)
    else if (container.scrollHeight > container.clientHeight) {
      const containerRect = container.getBoundingClientRect();
      const thumbRect = thumb.getBoundingClientRect();
      const offsetTop = thumbRect.top - containerRect.top;

      if (offsetTop < 0 || offsetTop + thumbRect.height > containerRect.height) {
        container.scrollTo({
          top:
            container.scrollTop +
            offsetTop -
            (container.clientHeight / 2 - thumbRect.height / 2),
          behavior: "smooth",
        });
      }
    }
  }, [activeIndex]);

  // Pause autoplay while video slide is active
  useEffect(() => {
    if (!swiperRef.current?.autoplay) return;
    const currentSlide = displaySlides[activeIndex];
    if (isVideoUrl(currentSlide?.url) || isYoutubeUrl(currentSlide?.url)) {
      swiperRef.current.autoplay.stop();
    } else if (displaySlides.length > 1) {
      swiperRef.current.autoplay.start();
    }
  }, [activeIndex, displaySlides]);

  // Stop autoplay when user scrolls down away from gallery
  useEffect(() => {
    const el = galleryRef.current;
    if (!el || typeof window === "undefined" || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!swiperRef.current?.autoplay) return;
        if (entry.isIntersecting) {
          const currentSlide = displaySlides[activeIndex];
          if (
            !isVideoUrl(currentSlide?.url) &&
            !isYoutubeUrl(currentSlide?.url) &&
            displaySlides.length > 1
          ) {
            try {
              swiperRef.current.autoplay.start();
            } catch (e) {}
          }
        } else {
          // Immediately pause autoplay when gallery is scrolled out of viewport
          try {
            swiperRef.current.autoplay.stop();
          } catch (e) {}
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [activeIndex, displaySlides]);

  const handleSlideChange = (swiper) => {
    const idx = isLoop ? swiper.realIndex : swiper.activeIndex;
    setActiveIndex(idx);
    const activeSlide = displaySlides[idx];
    // Only synchronize variant if the user manually swiped/clicked, NOT on automatic autoplay
    if (isUserInteractingRef.current && activeSlide?.colorVar && onColorVarChange) {
      prevColorRef.current = activeSlide.colorVar;
      onColorVarChange(activeSlide.colorVar);
    }
  };

  const handleThumbnailClick = (index) => {
    if (index >= 0 && index < displaySlides.length) {
      isUserInteractingRef.current = true;
      if (swiperRef.current) {
        if (isLoop && typeof swiperRef.current.slideToLoop === "function") {
          swiperRef.current.slideToLoop(index, 400);
        } else if (typeof swiperRef.current.slideTo === "function") {
          swiperRef.current.slideTo(index, 400);
        }
      }
      setActiveIndex(index);
      const activeSlide = displaySlides[index];
      if (activeSlide?.colorVar && onColorVarChange) {
        prevColorRef.current = activeSlide.colorVar;
        onColorVarChange(activeSlide.colorVar);
      }
      setTimeout(() => {
        isUserInteractingRef.current = false;
      }, 450);
    }
  };

  const handlePrev = (e) => {
    e?.stopPropagation?.();
    if (swiperRef.current) {
      isUserInteractingRef.current = true;
      swiperRef.current.slidePrev(400);
      setTimeout(() => {
        isUserInteractingRef.current = false;
      }, 450);
    }
  };

  const handleNext = (e) => {
    e?.stopPropagation?.();
    if (swiperRef.current) {
      isUserInteractingRef.current = true;
      swiperRef.current.slideNext(400);
      setTimeout(() => {
        isUserInteractingRef.current = false;
      }, 450);
    }
  };

  const handleImageError = (e) => {
    if (e.target.src !== PRODUCT_PLACEHOLDER) {
      e.target.src = PRODUCT_PLACEHOLDER;
    }
  };

  return (
    <div
      ref={galleryRef}
      className="flex flex-col lg:flex-row gap-4 lg:gap-6 lg:items-start bg-transparent"
    >
      {/* Thumbnail Strip: Left Vertical on Desktop, Horizontal Scroll on Mobile */}
      {displaySlides.length > 1 && (
        <div
          ref={thumbContainerRef}
          className="flex lg:flex-col flex-row gap-2.5 order-2 lg:order-1 overflow-x-auto lg:overflow-x-visible lg:overflow-y-auto max-h-[560px] pb-2 lg:pb-0 scrollbar-thin select-none"
        >
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
                  <div className="relative w-full h-full bg-neutral-900 flex items-center justify-center">
                    <video
                      src={mediaUrl}
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
                      <span className="w-6 h-6 bg-white/90 rounded-full flex items-center justify-center shadow-md">
                        <span className="ml-0.5 border-l-[6px] border-y-[3.5px] border-l-[#111111] border-y-transparent" />
                      </span>
                    </div>
                  </div>
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
                    delay: 4500,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true,
                  }
                : false
            }
            onTouchStart={() => {
              isUserInteractingRef.current = true;
            }}
            onTouchEnd={() => {
              setTimeout(() => {
                isUserInteractingRef.current = false;
              }, 450);
            }}
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
                    <div className="relative w-full h-full flex items-center justify-center bg-black/95">
                      <video
                        src={mediaUrl}
                        className="w-full h-full object-contain swiper-no-swiping"
                        controls
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="auto"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setModalVideoUrl(mediaUrl);
                          setVideoModalOpen(true);
                        }}
                        className="absolute bottom-4 right-4 z-20 px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/85 text-white text-xs font-medium flex items-center gap-1.5 backdrop-blur-md shadow-md border border-white/20 transition-all cursor-pointer hover:scale-105"
                        title="Watch in popup"
                      >
                        <FiMaximize2 size={13} />
                        <span>Expand</span>
                      </button>
                    </div>
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

      {/* Video Modal Popup */}
      {videoModalOpen && modalVideoUrl && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 sm:p-6"
          onClick={() => setVideoModalOpen(false)}
        >
          <div
            className="relative w-full max-w-4xl bg-black rounded-2xl overflow-hidden shadow-2xl flex flex-col items-center justify-center border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setVideoModalOpen(false)}
              className="absolute top-4 right-4 z-30 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center backdrop-blur-md transition-all cursor-pointer"
              aria-label="Close video"
            >
              <FiX size={22} />
            </button>
            <div className="w-full aspect-video flex items-center justify-center bg-black">
              {isYoutubeUrl(modalVideoUrl) ? (
                <iframe
                  src={getYoutubeEmbedUrl(modalVideoUrl) || ""}
                  title={productTitle}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  src={modalVideoUrl}
                  className="w-full h-full object-contain"
                  controls
                  autoPlay
                  playsInline
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductImageGallery;


