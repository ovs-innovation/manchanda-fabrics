import Link from "next/link";
import useTranslation from "next-translate/useTranslation";
import useUtilsFunction from "@hooks/useUtilsFunction";
import { normalizeProductImageUrl, getOptimizedImageUrl } from "@utils/brandAssets";

const FALLBACK_IMAGE = "/placeholder.png";

/*
  categories: [{ slug, title, image }] — real store categories with a
  guaranteed image (resolved by the page from category products).
*/
const HomeCategoryCircles = ({ categories = [], counts = {} }) => {
  const { t } = useTranslation("common");
  const { showingTranslateValue } = useUtilsFunction();

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
    .filter((c) => c?.slug && c?.title);

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
            {list.map((cat) => (
              <Link
                key={cat.slug}
                href={`/collections/${cat.slug}`}
                className="group flex flex-col items-center text-center"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                <div className="relative w-full max-w-[150px] sm:max-w-[200px] lg:max-w-[220px] mx-auto rounded-full overflow-hidden bg-white border border-[#E6D1CB] p-1.5 shadow-sm group-hover:border-[#9C6A5A] group-hover:shadow-md transition-all duration-300">
                  <div className="relative w-full rounded-full overflow-hidden bg-neutral-100">
                    {/* padding-bottom trick forces a perfect square */}
                    <div className="pb-[100%]" />
                    <img
                      src={getOptimizedImageUrl(cat.image, 250, 250) || FALLBACK_IMAGE}
                      alt={cat.title}
                      className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        if (e.target.src !== window.location.origin + FALLBACK_IMAGE) {
                          e.target.onerror = null;
                          e.target.src = FALLBACK_IMAGE;
                        }
                      }}
                    />
                  </div>
                </div>
                <p className="mt-5 text-[14px] sm:text-base font-medium text-[#3B2A25] group-hover:text-[#9C6A5A] transition-colors tracking-wide">
                  {showingTranslateValue(cat.title) || t(cat.title)}
                </p>
                {counts[cat.slug] != null && (
                  <p className="mt-1 text-[11px] sm:text-xs text-neutral-400 font-light">
                    {counts[cat.slug]} {t(counts[cat.slug] === 1 ? "product" : "products")}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>
  );
};

export default HomeCategoryCircles;
