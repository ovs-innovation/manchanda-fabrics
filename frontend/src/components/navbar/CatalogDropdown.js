"use client";
import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import useTranslation from "next-translate/useTranslation";

const CATALOG_CATEGORIES = [
  {
    label: "Cotton Suits",
    slug: "cotton-suits",
    desc: "Light, breathable summer elegance",
  },
  {
    label: "Gaji Silk",
    slug: "gaji-silk",
    desc: "Smooth drape with luxurious sheen",
  },
  {
    label: "Kanjivaram Silk",
    slug: "kanjivaram-silk",
    desc: "South India's heritage weave",
  },
  {
    label: "Party Wear",
    slug: "party-wear",
    desc: "Glamour for every celebration",
  },
  {
    label: "Bangalori Silk",
    slug: "bangalori-silk-pure",
    desc: "Rich resham embroidery & borders",
  },
  {
    label: "Muslin",
    slug: "muslin",
    desc: "Airy fine-thread luxury cotton",
  },
  {
    label: "Kota Doria",
    slug: "kota-doria",
    desc: "Rajasthan's timeless light weave",
  },
  {
    label: "Applique Work",
    slug: "applique-work",
    desc: "Handcrafted artisan embellishments",
  },
];

const dropdownVariants = {
  hidden: { opacity: 0, y: -8, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: {
    opacity: 0,
    y: -6,
    scale: 0.98,
    transition: { duration: 0.15, ease: "easeIn" },
  },
};

const CatalogDropdown = ({ isTransparent }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation("common");

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        type="button"
        className="relative group flex items-center gap-1.5 py-2 text-[14px] font-sans font-normal tracking-[0.14em] uppercase text-[#111111] hover:text-[#111111]/70 transition-colors duration-250 ease-in-out"
        style={{ fontFamily: "'Poppins', sans-serif" }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((v) => !v)}
      >
        <span>{t("Catalog")}</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className={isOpen ? "text-[#111111]" : ""}
        >
          <ChevronDown size={14} strokeWidth={2.5} />
        </motion.span>

        {/* Underline grows from center */}
        <span
          className={`absolute bottom-0 left-1/2 h-[2px] bg-[#111111] -translate-x-1/2 transition-all duration-250 ease-in-out ${
            isOpen ? "w-full" : "w-0 group-hover:w-full"
          }`}
        />
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[580px] bg-white border border-neutral-100 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.12)] z-50"
            role="listbox"
            aria-label="Catalog categories"
          >
            {/* Top accent line */}
            <div className="h-[2px] w-full bg-[#111111]" />

            <div className="p-6">
              <p className="text-[12px] font-semibold tracking-[0.3em] uppercase text-neutral-400 mb-5" style={{ fontFamily: "'Poppins', sans-serif" }}>
                {t("Browse Collections")}
              </p>
              <div className="grid grid-cols-2 gap-x-8 gap-y-1">
                {CATALOG_CATEGORIES.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/collections/${cat.slug}`}
                    className="group/item flex flex-col py-2.5 border-b border-neutral-50 hover:border-[#111111]/20 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]/30"
                    role="option"
                    onClick={() => setIsOpen(false)}
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    <span className="text-sm font-semibold tracking-[0.12em] uppercase text-[#1F2937] group-hover/item:text-[#111111] transition-colors duration-200">
                      {t(cat.label)}
                    </span>
                    <span className="text-xs text-neutral-400 font-normal mt-0.5 tracking-wide">
                      {t(cat.desc)}
                    </span>
                  </Link>
                ))}
              </div>

              {/* Footer CTA */}
              <div className="mt-5 pt-4 border-t border-neutral-100 flex items-center justify-between" style={{ fontFamily: "'Poppins', sans-serif" }}>
                <span className="text-[11px] tracking-[0.2em] uppercase text-neutral-400">
                  Manchanda Fabrics
                </span>
                <Link
                  href="/search"
                  onClick={() => setIsOpen(false)}
                  className="text-[12px] font-semibold tracking-[0.15em] uppercase text-[#111111] hover:text-[#906f3e] transition-colors inline-flex items-center gap-1.5 group/all"
                >
                  {t("View All Collections")}
                  <span className="inline-block transition-transform group-hover/all:translate-x-1 duration-200">→</span>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CatalogDropdown;
