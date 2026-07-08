import Link from "next/link";
import useTranslation from "next-translate/useTranslation";
import { SHOP_CATEGORIES } from "@utils/shopCategories";

const ShopLatestCollectionTiles = ({ limit = 10 }) => {
  const { t } = useTranslation("common");
  const tiles = SHOP_CATEGORIES.slice(0, limit);

  return (
    <section className="py-24 sm:py-28 bg-[#F9F6F1] border-y border-black/5">
      <div className="max-w-screen-2xl mx-auto px-6 sm:px-12 lg:px-16">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
          <div>
            <p className="text-[12px] font-semibold tracking-[0.3em] uppercase text-neutral-400">
              {t("Shop Latest Collection")}
            </p>
            <h2
              className="mt-3 text-4xl sm:text-5xl font-semibold text-[#111111]"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              {t("Be the first to explore our brand-new arrivals")}
            </h2>
            <p className="mt-4 text-sm text-neutral-500 max-w-2xl">
              {t(
                "Handpicked drops, premium fabrics, and fresh edits curated for your next look."
              )}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {tiles.map((cat) => (
            <Link
              key={cat.slug}
              href={`/collections/${cat.slug}`}
              className="group relative overflow-hidden bg-white border border-neutral-100 shadow-sm hover:shadow-xl transition-all duration-300 min-h-[240px]"
            >
              <div className="absolute inset-0">
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              </div>

              <div className="relative z-10 p-6 flex flex-col h-full justify-end">
                <p className="text-[11px] font-semibold tracking-[0.25em] uppercase text-[#111111]">
                  {t("New Drop")}
                </p>
                <h3 className="mt-2 text-lg font-semibold text-white">
                  {t(cat.title)}
                </h3>
                <div className="mt-4 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-white/90">
                  <span className="border-b border-white/40 pb-0.5 group-hover:border-[#111111] transition-colors">
                    {t("Shop Now")}
                  </span>
                  <span className="transition-transform duration-200 group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ShopLatestCollectionTiles;

