import { useState } from "react";
import Link from "next/link";
import { IoSparkles, IoChevronDown, IoChevronUp } from "react-icons/io5";
import { mergeCategoryBanners } from "@utils/shopCategories";
import { LOCAL_BANNERS } from "@utils/traditionalImagery";

const CategoryTile = ({ cat, featured = false }) => (
  <Link
    href={`/search?category=${cat.slug}`}
    className={`group relative block overflow-hidden bg-[#F5ECE8] border border-[#E6D1CB] hover:border-[#9C6A5A]/50 transition-all duration-300 ${
      featured
        ? "rounded-2xl sm:rounded-3xl aspect-[16/10] sm:aspect-[2/1]"
        : "rounded-xl sm:rounded-2xl aspect-[5/6]"
    }`}
  >
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
    <div
      className={`absolute inset-0 bg-gradient-to-t ${
        featured
          ? "from-[#2B211E]/85 via-[#2B211E]/25 to-transparent"
          : "from-[#2B211E]/80 via-[#2B211E]/15 to-transparent"
      }`}
    />
    {cat.isHit && (
      <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#C7A46A] text-[#2B211E] text-[9px] sm:text-[10px] font-bold uppercase tracking-wider shadow-sm">
        <IoSparkles className="text-[10px]" />
        Hit Product
      </span>
    )}
    <div className={`absolute bottom-0 left-0 right-0 ${featured ? "p-4 sm:p-6" : "p-3 sm:p-4"}`}>
      {featured && cat.tagline && (
        <p className="text-[10px] sm:text-xs text-[#E6D1CB] uppercase tracking-widest mb-1 font-sans">
          {cat.tagline}
        </p>
      )}
      <h3
        className={`font-serif text-white leading-tight group-hover:text-[#E6D1CB] transition-colors ${
          featured ? "text-xl sm:text-2xl md:text-3xl" : "text-sm sm:text-base"
        }`}
      >
        {cat.title}
      </h3>
      <span
        className={`inline-block mt-2 text-[#E6D1CB]/90 uppercase tracking-widest border-b border-[#E6D1CB]/40 group-hover:border-[#E6D1CB] transition-colors font-sans ${
          featured ? "text-[10px] sm:text-xs" : "text-[9px] sm:text-[10px]"
        }`}
      >
        Shop Now →
      </span>
    </div>
  </Link>
);

const INITIAL_GRID_COUNT = 3; // 2 hit products + 3 = 5 categories visible initially

const ShopByCategory = ({ adminBanners }) => {
  const [showAll, setShowAll] = useState(false);
  const categories = mergeCategoryBanners(adminBanners);
  const hitProducts = categories.filter((c) => c.isHit);
  const gridCategories = categories.filter((c) => !c.isHit);

  const visibleGrid = showAll ? gridCategories : gridCategories.slice(0, INITIAL_GRID_COUNT);
  const hasMore = gridCategories.length > INITIAL_GRID_COUNT;

  return (
    <section className="py-10 sm:py-14 lg:py-20 mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-16 bg-[#FAF7F5]">
      <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
        <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.2em] text-[#93614E] mb-2 font-sans">
          Explore Collections
        </p>
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-[#2B211E] font-serif">
          Shop By Category
        </h2>
        <div className="h-[1px] w-12 bg-[#C7A46A] mx-auto mt-3 sm:mt-4" />
        <p className="mt-3 text-sm text-[#2B211E]/65 font-sans max-w-lg mx-auto">
          Suits, silks & fabrics — straight from our heritage catalog
        </p>
      </div>

      {hitProducts.length > 0 && (
        <div className="mb-6 sm:mb-8">
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-[#9C6A5A] mb-3 font-sans">
            Hit Products
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
            {hitProducts.map((cat) => (
              <CategoryTile key={cat.slug} cat={cat} featured />
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-3 md:gap-4">
        {visibleGrid.map((cat) => (
          <CategoryTile key={cat.slug} cat={cat} />
        ))}
      </div>

      {hasMore && (
        <div className="text-center mt-8 sm:mt-10">
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className="inline-flex items-center gap-2 px-8 py-3 border border-[#9C6A5A] text-[#9C6A5A] hover:bg-[#9C6A5A] hover:text-white rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 font-sans"
          >
            {showAll ? (
              <>
                Show Less
                <IoChevronUp className="text-sm" />
              </>
            ) : (
              <>
                Show All Categories
                <IoChevronDown className="text-sm" />
              </>
            )}
          </button>
        </div>
      )}
    </section>
  );
};

export default ShopByCategory;
