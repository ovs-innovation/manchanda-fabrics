import { useState } from "react";
import Link from "next/link";
import { IoChevronDown, IoChevronUp } from "react-icons/io5";
import { HOME_FESTIVALS, LOCAL_BANNERS } from "@utils/traditionalImagery";

const INITIAL_VISIBLE = 4;

const FestivalCard = ({ fest }) => (
  <Link
    href={`/search?category=${fest.slug}`}
    className="group relative block overflow-hidden rounded-xl sm:rounded-2xl aspect-[5/6] bg-[#F5ECE8] border border-[#E6D1CB] hover:border-[#9C6A5A]/40 shadow-sm hover:shadow-md transition-all duration-300"
  >
    <img
      src={fest.bg}
      alt={fest.name}
      loading="lazy"
      className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
      onError={(e) => {
        const fallback = LOCAL_BANNERS.appliqueSuit;
        if (e.target.src !== fallback) {
          e.target.onerror = null;
          e.target.src = fallback;
        }
      }}
    />
    <div className="absolute inset-0 bg-gradient-to-t from-[#2B211E]/90 via-[#2B211E]/25 to-[#2B211E]/5" />
    <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
      <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-[#E6D1CB] block mb-1 font-sans">
        {fest.tag}
      </span>
      <h3 className="text-sm sm:text-base font-serif text-white leading-tight group-hover:text-[#E6D1CB] transition-colors">
        {fest.name}
      </h3>
      <span className="inline-block mt-2 text-[9px] font-semibold uppercase tracking-widest text-[#E6D1CB]/80 group-hover:text-white font-sans">
        Shop →
      </span>
    </div>
  </Link>
);

const FestivalCollection = ({ festivals = HOME_FESTIVALS }) => {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? festivals : festivals.slice(0, INITIAL_VISIBLE);
  const hasMore = festivals.length > INITIAL_VISIBLE;

  return (
    <section className="py-10 sm:py-14 lg:py-20 mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-16 bg-[#FAF7F5]">
      <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
        <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.2em] text-[#93614E] mb-2 font-sans">
          Occasion Edit
        </p>
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-[#2B211E] font-serif">
          Festival Collection
        </h2>
        <div className="h-[1px] w-12 bg-[#C7A46A] mx-auto mt-3 sm:mt-4" />
        <p className="mt-3 text-sm text-[#2B211E]/65 font-sans">
          Curated suit sets for every celebration
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4">
        {visible.map((fest) => (
          <FestivalCard key={fest.name} fest={fest} />
        ))}
      </div>

      {hasMore && (
        <div className="text-center mt-8">
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className="inline-flex items-center gap-2 px-8 py-3 border border-[#9C6A5A] text-[#9C6A5A] hover:bg-[#9C6A5A] hover:text-white rounded-full text-xs font-bold uppercase tracking-widest transition-all font-sans"
          >
            {showAll ? (
              <>
                Show Less
                <IoChevronUp className="text-sm" />
              </>
            ) : (
              <>
                View All Occasions
                <IoChevronDown className="text-sm" />
              </>
            )}
          </button>
        </div>
      )}
    </section>
  );
};

export default FestivalCollection;
