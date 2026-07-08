/* ============================================================
   MobileMenu.js — Slide-out mobile menu drawer
   ============================================================ */
"use client";
import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown, ChevronUp } from "lucide-react";
import useTranslation from "next-translate/useTranslation";
import LanguageSwitcher from "@components/navbar/LanguageSwitcher";

const MOBILE_CATEGORIES = [
  { label: "Cotton Suits", slug: "cotton-suits" },
  { label: "Gaji Silk", slug: "gaji-silk" },
  { label: "Kanjivaram Silk", slug: "kanjivaram-silk" },
  { label: "Party Wear", slug: "party-wear" },
  { label: "Bangalori Silk", slug: "bangalori-silk-pure" },
  { label: "Muslin", slug: "muslin" },
  { label: "Kota Doria", slug: "kota-doria" },
  { label: "Applique Work", slug: "applique-work" },
  { label: "New Arrivals", slug: "new-arrivals" },
];

const menuVariants = {
  closed: { x: "-100%", transition: { duration: 0.3, ease: "easeInOut" } },
  open: { x: 0, transition: { duration: 0.3, ease: "easeInOut" } },
};

const MobileMenu = ({ isOpen, onClose }) => {
  const [catalogOpen, setCatalogOpen] = useState(false);
  const { t } = useTranslation("common");

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-50 lg:hidden"
          />

          {/* Drawer Panel */}
          <motion.div
            variants={menuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed top-0 left-0 bottom-0 w-[80vw] max-w-sm bg-white z-50 shadow-2xl p-6 lg:hidden flex flex-col justify-between font-sans"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            <div>
              {/* Header */}
              <div className="flex justify-between items-center pb-6 border-b border-neutral-100">
                <span className="text-[15px] tracking-[0.18em] uppercase text-[#111111] font-semibold" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  MANCHANDA FABRICS
                </span>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1 text-neutral-500 hover:text-[#E35353] transition-colors"
                  aria-label="Close menu"
                >
                  <X size={22} />
                </button>
              </div>

              {/* Navigation List */}
              <nav className="mt-8 flex flex-col gap-6">
                <Link
                  href="/"
                  onClick={onClose}
                  className="text-base font-semibold tracking-[0.16em] uppercase text-[#111111] hover:text-[#111111] transition-colors"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  {t("HOME")}
                </Link>

                {/* Catalog Accordion */}
                <div className="flex flex-col">
                  <button
                    type="button"
                    onClick={() => setCatalogOpen((v) => !v)}
                    className="flex justify-between items-center text-base font-semibold tracking-[0.16em] uppercase text-[#111111] hover:text-[#111111] transition-colors text-left w-full"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    <span>{t("Catalog")}</span>
                    {catalogOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>

                  <AnimatePresence>
                    {catalogOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden pl-4 flex flex-col gap-4 mt-4 border-l border-neutral-100"
                      >
                        {MOBILE_CATEGORIES.map((cat) => (
                          <Link
                            key={cat.slug}
                            href={
                              cat.slug === "new-arrivals"
                                ? "/new-arrivals"
                                : `/collections/${cat.slug}`
                            }
                            onClick={onClose}
                            className="text-sm font-medium tracking-[0.12em] uppercase text-neutral-500 hover:text-[#111111] transition-colors"
                            style={{ fontFamily: "'Poppins', sans-serif" }}
                          >
                            {t(cat.label)}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <Link
                  href="/new-arrivals"
                  onClick={onClose}
                  className="text-base font-semibold tracking-[0.16em] uppercase text-[#111111] hover:text-[#111111] transition-colors"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  {t("New Arrivals")}
                </Link>

                <Link
                  href="/search"
                  onClick={onClose}
                  className="text-base font-semibold tracking-[0.16em] uppercase text-[#111111] hover:text-[#111111] transition-colors"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  {t("View All Collections")}
                </Link>

                <Link
                  href="/contact-us"
                  onClick={onClose}
                  className="text-base font-semibold tracking-[0.16em] uppercase text-[#111111] hover:text-[#111111] transition-colors"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  {t("Contact Us")}
                </Link>
              </nav>
            </div>

            {/* Footer */}
            <div className="pt-6 border-t border-neutral-100 flex flex-col gap-4 text-center">
              {/* Language Switcher */}
              <LanguageSwitcher variant="mobile" onSelect={onClose} />

              <p className="text-[11px] tracking-widest text-neutral-400 uppercase">
                {t("Timeless Indian Heritage")}
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileMenu;
