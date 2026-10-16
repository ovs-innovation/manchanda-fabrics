import React, { useState } from "react";
import Link from "next/link";
import useTranslation from "next-translate/useTranslation";
import useUtilsFunction from "@hooks/useUtilsFunction";
import { getOptimizedImageUrl } from "@utils/brandAssets";

const CategoryCircleItem = ({ cat, count, showingTranslateValue, t }) => {
  const [imgFailed, setImgFailed] = useState(false);

  // Check if image is a real uploaded URL (not dead Cloudinary tu23xpla and not dummy Suit fallback)
  const isDummyOrDead =
    !cat.image ||
    typeof cat.image !== "string" ||
    cat.image.includes("tu23xpla") ||
    cat.image.includes("/Suit/");

  const imageSrc =
    !isDummyOrDead && !imgFailed
      ? getOptimizedImageUrl(cat.image, 250, 250) || cat.image
      : null;

  const titleText = showingTranslateValue(cat.title) || cat.title || "";

  // Derive elegant 1-2 letter boutique monogram for categories without image
  const initials =
    titleText
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join("") || "M";

  return (
    <Link
      href={`/collections/${cat.slug}`}
      prefetch={false}
      className="group flex flex-col items-center text-center"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      <div className="relative w-full max-w-[150px] sm:max-w-[200px] lg:max-w-[220px] mx-auto rounded-full overflow-hidden bg-white border border-[#E6D1CB] p-1.5 shadow-sm group-hover:border-[#9C6A5A] group-hover:shadow-md transition-all duration-300">
        <div className="relative w-full rounded-full overflow-hidden bg-[#FAF7F5]">
          {/* 1:1 aspect ratio square container */}
          <div className="pb-[100%]" />

          {imageSrc ? (
            <img
              src={imageSrc}
              alt={titleText}
              className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
              loading="lazy"
              decoding="async"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#FAF5F2] via-[#F4ECE6] to-[#EAE0D8] p-4 select-none">
              <span
                className="text-2xl sm:text-3xl md:text-4xl text-[#8C5848] font-serif tracking-widest uppercase transition-transform duration-500 group-hover:scale-110"
                style={{ fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif" }}
              >
                {initials}
              </span>
              <span className="w-5 h-[1px] bg-[#9C6A5A]/40 my-1.5" />
              <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.22em] text-[#9C6A5A]/80 font-medium">
                Manchanda
              </span>
            </div>
          )}
        </div>
      </div>
      <p className="mt-5 text-[14px] sm:text-base font-medium text-[#3B2A25] group-hover:text-[#9C6A5A] transition-colors tracking-wide">
        {titleText}
      </p>
      {count != null && (
        <p className="mt-1 text-[11px] sm:text-xs text-neutral-400 font-light">
          {count} {t(count === 1 ? "product" : "products")}
        </p>
      )}
    </Link>
  );
};

/*
  categories: [{ slug, title, image }] — real store categories.
  Dummy fallback suit images removed so client can upload real images freshly.
*/
const HomeCategoryCircles = ({ categories = [], counts = {} }) => {
  const { t } = useTranslation("common");
  const { showingTranslateValue } = useUtilsFunction();

  const seenSlugs = new Set();
  const list = (categories || [])
    .map((c) => {
      const title =
        typeof c?.title === "string"
          ? c.title
          : c?.title?.en || c?.title?.default || (typeof c?.title === "object" ? Object.values(c.title)[0] : "") || "";
      const slug =
        c?.slug ||
        (title
          ? String(title)
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "")
          : "");
      return { ...c, title, slug };
    })
    .filter((c) => {
      if (!c?.slug || !c?.title) return false;
      if (seenSlugs.has(c.slug)) return false;
      seenSlugs.add(c.slug);
      return true;
    });

  if (!list.length) return null;

  return (
    <section className="py-16 sm:py-24 bg-[#FAF7F5] border-b border-[#E6D1CB]/50">
      <div className="max-w-screen-2xl mx-auto px-6 sm:px-12 lg:px-16">
        <div className="mb-10 sm:mb-14">
          <div className="flex items-center gap-2.5 sm:gap-3 mb-2.5">
            <span className="w-6 sm:w-8 h-[1px] bg-[#9C6A5A]" />
            <span
              className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.28em] text-[#9C6A5A]"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              {t("CURATED COLLECTIONS")}
            </span>
          </div>
          <h2
            className="text-3xl sm:text-5xl font-light text-[#3B2A25] leading-tight"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            {t("Shop By")}{" "}
            <em className="not-italic font-normal italic text-[#9C6A5A]">{t("Categories")}</em>
          </h2>
          <p
            className="mt-2 sm:mt-3 text-xs sm:text-sm text-[#7A7A7A] max-w-2xl font-light"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            {t("Easily find what you’re looking for – all neatly sorted by category.")}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-4 gap-y-8 sm:gap-10 items-start">
          {list.map((cat, idx) => (
            <CategoryCircleItem
              key={cat.slug || idx}
              cat={cat}
              count={counts[cat.slug]}
              showingTranslateValue={showingTranslateValue}
              t={t}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomeCategoryCircles;
