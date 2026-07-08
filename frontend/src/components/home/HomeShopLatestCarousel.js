import useTranslation from "next-translate/useTranslation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

import ReelModal from "@components/home/ReelModal";

const canUseVideo = (src) => {
  if (!src) return false;
  if (typeof src !== "string") return false;
  const clean = src.split("?")[0].toLowerCase();
  return (
    (src.startsWith("http") || src.startsWith("/")) &&
    (clean.endsWith(".mp4") || clean.endsWith(".webm") || clean.endsWith(".mov"))
  );
};

const formatInr = (value) => {
  const n = Number(value || 0);
  if (!Number.isFinite(n)) return null;
  return n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const pickImage = (item) =>
  item?.featuredImage ||
  item?.image?.[0] ||
  item?.images?.[0] ||
  item?.thumbnail ||
  null;

const HomeShopLatestCarousel = ({ items = [] }) => {
  const { t } = useTranslation("common");
  const [reelsData, setReelsData] = useState({ videos: [], manifest: { products: {}, categories: {} } });
  const [selected, setSelected] = useState(null);
  const videoEls = useRef(new Map());

  useEffect(() => {
    let alive = true;
    fetch("/api/reels")
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (!alive || !json) return;
        setReelsData({
          videos: Array.isArray(json.videos) ? json.videos : [],
          manifest: json.manifest || { products: {}, categories: {} },
        });
      })
      .catch(() => null);
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const els = Array.from(videoEls.current.values()).filter(Boolean);
    if (els.length === 0) return;

    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const el = e.target;
          if (!(el instanceof HTMLVideoElement)) continue;
          if (e.isIntersecting) {
            el.play().catch(() => null);
          } else {
            el.pause();
          }
        }
      },
      { threshold: [0, 0.2] }
    );

    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [items, reelsData]);

  const getReelSrc = useMemo(() => {
    const productMap = reelsData.manifest?.products || {};
    const pool = reelsData.videos.filter((v) => !v.endsWith("manifest.json"));

    return (p, index) => {
      if (canUseVideo(p?.video)) return p.video;
      const key = p?.slug || p?._id || null;
      const mapped = key ? productMap[key] : null;
      if (canUseVideo(mapped)) return mapped;
      if (pool.length > 0) return pool[index % pool.length];
      return null;
    };
  }, [reelsData]);

  if (!items.length) return null;

  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-screen-2xl mx-auto px-6 sm:px-12 lg:px-16">
        <h2
          className="text-center text-4xl sm:text-5xl font-semibold text-[#111111]"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          {t("Shop Latest Collection")}
        </h2>
        <p className="text-center mt-4 text-sm sm:text-base text-neutral-500">
          {t("Be the first to explore our brand-new arrivals, crafted just for you.")}
        </p>

        <div className="mt-10 relative home-reels-swiper">
          <Swiper
            modules={[Navigation]}
            navigation
            spaceBetween={14}
            slidesPerView={1}
            breakpoints={{
              640: { slidesPerView: 2.3, spaceBetween: 16 },
              1024: { slidesPerView: 3.7, spaceBetween: 18 },
              1280: { slidesPerView: 4.4, spaceBetween: 20 },
            }}
          >
            {items.map((p, index) => {
              const image = pickImage(p);
              const video = getReelSrc(p, index);
              const title = p?.title?.en || p?.title || p?.name || "Product";
              const price = p?.prices?.price ?? p?.price ?? null;
              const priceText = price != null ? `Rs. ${formatInr(price)}` : null;
              const key = p?._id || p?.slug || `${title}-${index}`;

              return (
                <SwiperSlide key={key}>
                  <button
                    type="button"
                    onClick={() => setSelected({ product: p, video, image })}
                    className="block w-full text-left bg-white rounded-[14px] shadow-[0_6px_16px_rgba(0,0,0,0.08)] overflow-hidden border border-black/5 cursor-pointer"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    <div className="aspect-[9/16] bg-neutral-100 overflow-hidden relative">
                      {canUseVideo(video) ? (
                        <video
                          className="absolute inset-0 w-full h-full object-cover"
                          src={video}
                          muted
                          loop
                          playsInline
                          autoPlay
                          preload="metadata"
                          poster={image || undefined}
                          ref={(el) => {
                            if (el) videoEls.current.set(key, el);
                            else videoEls.current.delete(key);
                          }}
                        />
                      ) : (
                        image && (
                          <img
                            src={image}
                            alt={title}
                            className="absolute inset-0 w-full h-full object-cover object-top"
                            loading="lazy"
                          />
                        )
                      )}

                      {image && (
                        <div className="absolute bottom-2.5 left-2.5 w-10 h-10 rounded overflow-hidden border-2 border-white shadow-md">
                          <img
                            src={image}
                            alt={title}
                            className="w-full h-full object-cover object-top"
                            loading="lazy"
                          />
                        </div>
                      )}
                    </div>

                    <div className="px-3 py-2.5">
                      <p className="text-[12px] sm:text-[13px] font-medium text-[#111111] truncate leading-snug">
                        {title}
                      </p>
                      {priceText && (
                        <p className="mt-0.5 text-[11px] sm:text-[12px] text-neutral-500">{priceText}</p>
                      )}
                    </div>
                  </button>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      </div>

      <style jsx global>{`
        .home-reels-swiper .swiper-button-prev,
        .home-reels-swiper .swiper-button-next {
          width: 40px;
          height: 40px;
          border-radius: 9999px;
          background: #ffffff;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.18);
          color: #111111;
        }
        .home-reels-swiper .swiper-button-prev::after,
        .home-reels-swiper .swiper-button-next::after {
          font-size: 15px;
          font-weight: 700;
        }
      `}</style>

      <ReelModal
        open={!!selected}
        onClose={() => setSelected(null)}
        product={selected?.product}
        video={selected?.video}
        image={selected?.image}
      />
    </section>
  );
};

export default HomeShopLatestCarousel;
