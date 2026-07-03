/* ============================================================
   MobileMenu.js — Slide-out mobile menu drawer
   ============================================================ */
"use client";
import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown, ChevronUp } from "lucide-react";

const MOBILE_CATEGORIES = [
  { label: "Sarees", slug: "sarees" },
  { label: "Salwar Suits", slug: "cotton-suits" },
  { label: "Dress Materials", slug: "muslin" },
  { label: "Wedding Collection", slug: "party-wear" },
  { label: "Cotton Collection", slug: "mul-cotton" },
  { label: "Silk Collection", slug: "gaji-silk" },
  { label: "New Arrivals", slug: "new-arrivals" },
];

const menuVariants = {
  closed: { x: "-100%", transition: { duration: 0.3, ease: "easeInOut" } },
  open: { x: 0, transition: { duration: 0.3, ease: "easeInOut" } },
};

const MobileMenu = ({ isOpen, onClose }) => {
  const [catalogOpen, setCatalogOpen] = useState(false);

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
          >
            <div>
              {/* Header */}
              <div className="flex justify-between items-center pb-6 border-b border-neutral-100">
                <span className="text-[13px] tracking-[0.18em] uppercase text-[#111111] font-semibold" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  MANCHANDA FABRICS
                </span>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1 text-neutral-500 hover:text-[#E35353] transition-colors"
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Navigation List */}
              <nav className="mt-8 flex flex-col gap-6">
                <Link
                  href="/"
                  onClick={onClose}
                  className="text-[12px] font-semibold tracking-[0.16em] uppercase text-[#111111] hover:text-[#C8A45D] transition-colors"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  Home
                </Link>

                {/* Catalog Accordion */}
                <div className="flex flex-col">
                  <button
                    type="button"
                    onClick={() => setCatalogOpen((v) => !v)}
                    className="flex justify-between items-center text-[12px] font-semibold tracking-[0.16em] uppercase text-[#111111] hover:text-[#C8A45D] transition-colors text-left w-full"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                  >
                    <span>Catalog</span>
                    {catalogOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
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
                            href={cat.slug === "new-arrivals" ? "/new-arrivals" : `/search?category=${cat.slug}`}
                            onClick={onClose}
                            className="text-[11px] font-medium tracking-[0.12em] uppercase text-neutral-500 hover:text-[#C8A45D] transition-colors"
                            style={{ fontFamily: "'Montserrat', sans-serif" }}
                          >
                            {cat.label}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <Link
                  href="/new-arrivals"
                  onClick={onClose}
                  className="text-[12px] font-semibold tracking-[0.16em] uppercase text-[#111111] hover:text-[#C8A45D] transition-colors"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  New Arrivals
                </Link>

                <Link
                  href="/search"
                  onClick={onClose}
                  className="text-[12px] font-semibold tracking-[0.16em] uppercase text-[#111111] hover:text-[#C8A45D] transition-colors"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  All Collections
                </Link>

                <Link
                  href="/contact-us"
                  onClick={onClose}
                  className="text-[12px] font-semibold tracking-[0.16em] uppercase text-[#111111] hover:text-[#C8A45D] transition-colors"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  Contact Us
                </Link>
              </nav>
            </div>

            {/* Footer */}
            <div className="pt-6 border-t border-neutral-100 text-center">
              <p className="text-[10px] tracking-widest text-neutral-400 uppercase">
                Timeless Indian Heritage
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileMenu;
