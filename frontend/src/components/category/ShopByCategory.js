import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { IoSparkles, IoChevronDown, IoChevronUp } from "react-icons/io5";
import { mergeCategoryBanners } from "@utils/shopCategories";
import { LOCAL_BANNERS } from "@utils/traditionalImagery";
import useTranslation from "next-translate/useTranslation";

const canUseVideo = (src) => {
  if (!src) return false;
  if (typeof src !== "string") return false;
  const clean = src.split("?")[0].toLowerCase();
  return (
    (src.startsWith("http") || src.startsWith("/")) &&
    (clean.endsWith(".mp4") || clean.endsWith(".webm") || clean.endsWith(".mov"))
  );
};

const CategoryTile = ({ cat, featured = false, video, registerVideoEl }) => {
  const { t } = useTranslation("common");
  return (
    <Link
      href={`/collections/${cat.slug}`}
      className={`group relative block overflow-hidden bg-white border border-neutral-100 shadow-sm hover:shadow-xl transition-all duration-300 ${
        featured ? "aspect-[16/10] sm:aspect-[2/1]" : "aspect-[5/6]"
      }`}
    >
      {canUseVideo(video) ? (
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src={video}
          muted
          loop
          playsInline
          autoPlay
          preload="metadata"
          poster={cat.image || undefined}
          ref={(el) => registerVideoEl(cat.slug, el)}
        />
      ) : (
        <img
          src={cat.image}
          alt={cat.title}
          className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            if (e.target.src !== LOCAL_BANNERS.appliqueSuit) {
              e.target.onerror = null;
              e.target.src = LOCAL_BANNERS.appliqueSuit;
            }
          }}
        />
      )}
      <div
        className={`absolute inset-0 bg-gradient-to-t ${
          featured
            ? "from-[#2B211E]/85 via-[#2B211E]/25 to-transparent"
            : "from-[#2B211E]/80 via-[#2B211E]/15 to-transparent"
        }`}
      />
      {cat.isHit && (
        <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur text-[#111111] text-[9px] sm:text-[10px] font-bold uppercase tracking-wider shadow-sm border border-neutral-200">
          <IoSparkles className="text-[10px]" />
          {t("Hit Product")}
        </span>
      )}
      <div className={`absolute bottom-0 left-0 right-0 ${featured ? "p-4 sm:p-6" : "p-3 sm:p-4"}`}>
        {featured && cat.tagline && (
          <p className="text-[10px] sm:text-xs text-white/80 uppercase tracking-widest mb-1 font-sans">
            {cat.tagline}
          </p>
        )}
        <h3
          className={`font-sans font-semibold text-white leading-tight group-hover:text-[#E6D1CB] transition-colors ${
            featured ? "text-xl sm:text-2xl md:text-3xl" : "text-sm sm:text-base"
          }`}
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          {cat.title}
        </h3>
        <span
          className={`inline-block mt-2 text-white/90 uppercase tracking-widest border-b border-white/40 group-hover:border-[#111111] transition-colors font-sans ${
            featured ? "text-[10px] sm:text-xs" : "text-[9px] sm:text-[10px]"
          }`}
        >
          {t("Shop Now")} →
        </span>
      </div>
    </Link>
  );
};

const INITIAL_GRID_COUNT = 3; // 2 hit products + 3 = 5 categories visible initially

const ShopByCategory = ({ adminBanners }) => {
  const [showAll, setShowAll] = useState(false);
  const { t } = useTranslation("common");
  const categories = mergeCategoryBanners(adminBanners);
  const hitProducts = categories.filter((c) => c.isHit);
  const gridCategories = categories.filter((c) => !c.isHit);
  const [reelsManifest, setReelsManifest] = useState(null);
  const videoEls = useRef(new Map());

  const visibleGrid = showAll ? gridCategories : gridCategories.slice(0, INITIAL_GRID_COUNT);
  const hasMore = gridCategories.length > INITIAL_GRID_COUNT;

  useEffect(() => {
    let alive = true;
    fetch("/reels/manifest.json")
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (!alive) return;
        setReelsManifest(json || null);
      })
      .catch(() => {
        if (!alive) return;
        setReelsManifest(null);
      });
    return () => {
      alive = false;
    };
  }, []);

  const getCategoryReel = useMemo(() => {
    const categoryMap = reelsManifest?.categories || {};
    return (cat) => {
      if (canUseVideo(cat?.video)) return cat.video;
      const bySlug = cat?.slug ? categoryMap[cat.slug] : null;
      return canUseVideo(bySlug) ? bySlug : null;
    };
  }, [reelsManifest]);

  const registerVideoEl = (key, el) => {
    if (!key) return;
    if (el) videoEls.current.set(key, el);
    else videoEls.current.delete(key);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const els = Array.from(videoEls.current.values()).filter(Boolean);
    if (els.length === 0) return;

    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const el = e.target;
          if (!(el instanceof HTMLVideoElement)) continue;
          if (e.isIntersecting && e.intersectionRatio >= 0.6) {
            el.play().catch(() => null);
          } else {
            el.pause();
          }
        }
      },
      { threshold: [0, 0.25, 0.6, 0.9] }
    );

    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [visibleGrid, hitProducts, reelsManifest]);

  return (
    <section className="py-24 sm:py-28 bg-white border-b border-black/5">
      <div className="max-w-screen-2xl mx-auto px-6 sm:px-12 lg:px-16">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <p className="text-[12px] font-semibold tracking-[0.3em] uppercase text-neutral-400">
            {t("Browse by Style & Need")}
          </p>
          <h2
            className="mt-3 text-4xl sm:text-5xl font-semibold text-[#111111]"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            {t("Shop By Categories")}
          </h2>
          <p className="mt-4 text-sm text-neutral-500">
            {t("Easily find what you’re looking for – all neatly sorted by category.")}
          </p>
        </div>

        {hitProducts.length > 0 && (
          <div className="mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {hitProducts.slice(0, 2).map((cat) => (
                <CategoryTile
                  key={cat.slug}
                  cat={cat}
                  featured
                  video={getCategoryReel(cat)}
                  registerVideoEl={registerVideoEl}
                />
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {visibleGrid.map((cat) => (
            <CategoryTile
              key={cat.slug}
              cat={cat}
              video={getCategoryReel(cat)}
              registerVideoEl={registerVideoEl}
            />
          ))}
        </div>

        {hasMore && (
          <div className="text-center mt-10">
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              className="inline-flex items-center gap-2 px-8 py-3 border border-neutral-200 text-[#111111] hover:border-[#111111] hover:text-[#111111] text-xs font-bold uppercase tracking-widest transition-all duration-300"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              {showAll ? (
                <>
                  {t("Show Less")}
                  <IoChevronUp className="text-sm" />
                </>
              ) : (
                <>
                  {t("View All")}
                  <IoChevronDown className="text-sm" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ShopByCategory;
