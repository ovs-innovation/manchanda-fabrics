import { useMemo, useState } from "react";
import Link from "next/link";
import useTranslation from "next-translate/useTranslation";

import ProductCard from "@components/product/ProductCard";

/*
  Aisha-style "Fashion is everything" tabbed section.
  Tabs come from real backend categories; each tab shows the category
  name, its product count, a "discover now" link and up to 4 products.
*/
const FashionTabsSection = ({ categories = [], products = [], attributes = [] }) => {
  const { t } = useTranslation("common");

  const tabs = useMemo(() => {
    const list = (categories || [])
      .map((c) => {
        const id = c?._id;
        const matching = (products || []).filter((p) => {
          const ids = Array.isArray(p?.categories)
            ? p.categories.map((x) => (typeof x === "string" ? x : x?._id))
            : [];
          const single = p?.category?._id || p?.category;
          return ids.includes(id) || single === id;
        });
        return {
          key: c?.slug || id,
          label: c?.name?.en || c?.name || c?.title || "Collection",
          slug: c?.slug,
          count: matching.length,
          products: matching,
        };
      })
      // categories with products first, like the reference
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    return list;
  }, [categories, products]);

  const [activeKey, setActiveKey] = useState(null);
  const active = tabs.find((tab) => tab.key === activeKey) || tabs[0];

  if (!tabs.length) return null;

  return (
    <section className="py-24 sm:py-28 bg-white border-b border-black/5">
      <div className="max-w-screen-2xl mx-auto px-6 sm:px-12 lg:px-16">
        <h2
          className="text-center text-4xl sm:text-5xl font-semibold text-[#111111]"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          {t("Fashion is everything")}
        </h2>

        {/* Tab pills */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveKey(tab.key)}
              className={`px-6 py-2.5 rounded-full border text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] transition-all ${
                active?.key === tab.key
                  ? "bg-[#111111] text-white border-[#111111]"
                  : "bg-white text-[#222222] border-neutral-200 hover:border-[#111111]"
              }`}
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Active tab header */}
        {active && (
          <>
            <div className="mt-14 text-center">
              <h3
                className="text-3xl sm:text-4xl font-semibold text-[#111111]"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                {active.label}
              </h3>
              <p className="mt-2 text-sm text-neutral-500">
                {active.count} {t("products")}
              </p>
              <Link
                href={active.slug ? `/collections/${active.slug}` : "/search"}
                className="mt-4 inline-block text-[12px] font-bold uppercase tracking-[0.25em] text-[#111111] border-b border-[#111111]/40 pb-1 hover:border-[#111111] transition-colors"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                {t("discover now")}
              </Link>
            </div>

            {active.products.length > 0 ? (
              <div className="mt-12 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
                {active.products.slice(0, 4).map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    attributes={attributes}
                  />
                ))}
              </div>
            ) : (
              <p className="mt-12 text-center text-sm text-neutral-400">
                {t("New styles coming soon in this collection.")}
              </p>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default FashionTabsSection;
