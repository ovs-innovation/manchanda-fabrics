import React from "react";
import { FaInstagram } from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import useTranslation from "next-translate/useTranslation";

// Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/autoplay";

const BASE_REELS = [
  { id: 1, video: "/R1.mp4", title: "Heritage Weaves" },
  { id: 2, video: "/R2.mp4", title: "Timeless Elegance" },
  { id: 3, video: "/R3.mp4", title: "Festive Vibes" },
  { id: 4, video: "/R1.mp4", title: "Bridal Couture" },
  { id: 5, video: "/R2.mp4", title: "Silk Stories" },
  { id: 6, video: "/R3.mp4", title: "Occasion Wear" },
  { id: 7, video: "/R1.mp4", title: "Royal Splendor" },
  { id: 8, video: "/R2.mp4", title: "Handloom Grace" },
];

const InstagramFeed = () => {
  const { t } = useTranslation("common");

  return (
    <section className="py-24 sm:py-32 lg:py-40 bg-[#F9F6F1] overflow-hidden">
      {/* ── Header ── */}
      <div className="max-w-screen-2xl mx-auto px-6 sm:px-12 lg:px-16">
        <div className="text-center mb-16">
          <span
            className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#C8A45D] mb-4"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            <FaInstagram className="w-3.5 h-3.5" />
            @manchandafabrics
          </span>
          <h2
            className="text-4xl sm:text-5xl lg:text-[54px] xl:text-[60px] font-extrabold uppercase tracking-tight text-[#111111] mb-5"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            {t("Instagram Reels")}
          </h2>
          <div className="w-12 h-[1.5px] bg-[#C8A45D] mx-auto mb-6" />
          <p
            className="text-[15px] text-[#555555] font-light max-w-md mx-auto mb-8 leading-relaxed"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            {t("Follow our latest ethnic fashion inspiration.")}
          </p>
          <a
            href="https://instagram.com/manchandafabrics"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-7 py-3.5 border border-[#C8A45D] text-[#C8A45D] text-[11px] font-semibold uppercase tracking-[0.18em] hover:bg-[#C8A45D] hover:text-white transition-all duration-300 rounded-full mb-4"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            <FaInstagram className="w-4 h-4" />
            {t("Follow on Instagram")}
          </a>
        </div>

        {/* Slider Section */}
        <div className="relative group/reels mt-4">
          <Swiper
            modules={[Navigation, Autoplay]}
            spaceBetween={28}
            slidesPerView={1}
            navigation={{
              prevEl: ".prev-reels",
              nextEl: ".next-reels",
            }}
            autoplay={{
              delay: 4500,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            breakpoints={{
              640: { slidesPerView: 2, spaceBetween: 24 },
              1024: { slidesPerView: 3, spaceBetween: 28 },
              1280: { slidesPerView: 4, spaceBetween: 32 },
            }}
            className="mySwiper px-1 py-4"
          >
            {BASE_REELS.map((reel, idx) => (
              <SwiperSlide key={idx}>
                <div
                  className="group relative overflow-hidden rounded-[20px] shadow-lg bg-[#0a0a0a] w-full h-[520px] sm:h-[600px] lg:h-[700px] transition-all duration-500 hover:shadow-2xl"
                >
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="auto"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-[700ms] ease-out group-hover:scale-[1.03]"
                  >
                    <source src={reel.video} type="video/mp4" />
                  </video>

                  {/* Gradient (Softer bottom gradient overlay) */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent pointer-events-none" />

                  {/* Instagram icon */}
                  <div className="absolute top-4 right-4 text-white/70 z-10">
                    <FaInstagram className="w-5 h-5" />
                  </div>

                  {/* Bottom overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-8 md:p-6 z-10 flex flex-col items-start bg-gradient-to-t from-black/60 via-black/10 to-transparent">
                    <h3
                      className="text-xl md:text-base font-semibold md:font-medium leading-tight tracking-wide text-white mb-5 md:mb-3"
                      style={{ fontFamily: "'Poppins', sans-serif" }}
                    >
                      {reel.title}
                    </h3>
                    <a
                      href="https://instagram.com/manchandafabrics"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center text-sm md:text-[10px] font-semibold uppercase tracking-[0.15em] md:tracking-[0.2em] text-[#C8A45D] bg-white/10 hover:bg-[#C8A45D] hover:text-white transition-all duration-300 border border-[#C8A45D] px-5 py-3 md:px-4 md:py-2 rounded-lg md:rounded-md"
                      style={{ fontFamily: "'Poppins', sans-serif" }}
                    >
                      {t("View Reel")}
                    </a>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Navigation Controls */}
          <button className="prev-reels absolute top-1/2 -left-4 md:-left-6 z-10 bg-white shadow-xl border border-neutral-100 rounded-full p-3.5 hover:bg-[#FAF8F4] transition-colors transform -translate-y-1/2 disabled:opacity-40 disabled:cursor-not-allowed group-hover/reels:translate-x-1 duration-300">
            <IoChevronBack className="text-xl text-[#3B2A25]" />
          </button>
          <button className="next-reels absolute top-1/2 -right-4 md:-right-6 z-10 bg-white shadow-xl border border-neutral-100 rounded-full p-3.5 hover:bg-[#FAF8F4] transition-colors transform -translate-y-1/2 disabled:opacity-40 disabled:cursor-not-allowed group-hover/reels:-translate-x-1 duration-300">
            <IoChevronForward className="text-xl text-[#3B2A25]" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default InstagramFeed;
