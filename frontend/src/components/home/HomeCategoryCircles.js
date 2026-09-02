import Link from "next/link";
import useTranslation from "next-translate/useTranslation";

const FALLBACK_IMAGE = "/p1.jpeg";

/*
  categories: [{ slug, title, image }] — real store categories with a
  guaranteed image (resolved by the page from category products).
*/
const HomeCategoryCircles = ({ categories = [], counts = {} }) => {
  const { t } = useTranslation("common");

  const list = categories.filter((c) => c?.slug && c?.title);

  if (!list.length) return null;

  return (
    <section className="py-20 sm:py-24 bg-white border-b border-black/5">
      <div className="max-w-screen-2xl mx-auto px-6 sm:px-12 lg:px-16">
        <div className="mb-12 sm:mb-16">
          <p className="text-[13px] text-neutral-500">
            {t("Browse by Style & Need")}
          </p>
          <h2
            className="text-4xl sm:text-5xl font-semibold text-[#111111]"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            {t("Shop By Categories")}
          </h2>
          <p
            className="mt-4 text-sm text-[#7A7A7A] max-w-2xl font-light"
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
                <div className="relative w-full max-w-[150px] sm:max-w-[200px] lg:max-w-[220px] mx-auto rounded-full overflow-hidden bg-neutral-100 group-hover:shadow-xl transition-all">
                  {/* padding-bottom trick forces a perfect square regardless of Tailwind aspect support */}
                  <div className="pb-[100%]" />
                  <img
                    src={cat.image || FALLBACK_IMAGE}
                    alt={cat.title}
                    className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                    onError={(e) => {
                      if (e.target.src !== window.location.origin + FALLBACK_IMAGE) {
                        e.target.onerror = null;
                        e.target.src = FALLBACK_IMAGE;
                      }
                    }}
                  />
                </div>
                <p className="mt-6 text-[15px] sm:text-base font-medium text-[#111111] tracking-wide">
                  {t(cat.title)}
                </p>
                {counts[cat.slug] != null && (
                  <p className="mt-1 text-[12px] text-neutral-500">
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
