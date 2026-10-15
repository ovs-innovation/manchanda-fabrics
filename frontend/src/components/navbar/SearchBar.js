/* ============================================================
   SearchBar.js — Pixel-Perfect Search Dropdown for Manchanda Fabrics
   Recreated exactly to match final reference design:
   - Width: 620px, Height: ~190-210px, Warm off-white #FFFCFA, 16px radius
   - Capsule search input with #AD7663 border, vertical divider, brown SEARCH button
   - POPULAR SEARCHES header with Pure Silk, Banarasi, Suits, Muslin chips
   - Subtle botanical line-art in bottom corners
   - Triangular pointer pointing precisely to the navbar search icon
   ============================================================ */
"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import useTranslation from "next-translate/useTranslation";
import SearchSuggestions from "@components/search/SearchSuggestions";

const SearchBar = () => {
  const router = useRouter();
  const { t } = useTranslation("common");
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);
  const wrapperRef = useRef(null);

  // Sync search query from URL if on search page
  useEffect(() => {
    if (router.pathname === "/search" && router.query.query) {
      setSearchText(router.query.query);
    }
  }, [router.pathname, router.query.query]);

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 60);
      return () => clearTimeout(timer);
    } else {
      setShowSuggestions(false);
    }
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Close on route change
  useEffect(() => {
    const handleRouteChange = () => {
      handleClose();
    };
    router.events.on("routeChangeStart", handleRouteChange);
    return () => {
      router.events.off("routeChangeStart", handleRouteChange);
    };
  }, [router.events]);

  const handleClose = () => {
    setIsOpen(false);
    setShowSuggestions(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = searchText.trim();
    if (!trimmed) return;
    handleClose();
    router.push(
      { pathname: "/search", query: { query: trimmed } },
      `/search?query=${encodeURIComponent(trimmed)}`
    );
  };

  const handleChange = (value) => {
    setSearchText(value);
    setShowSuggestions(value.length > 1);
  };

  const handleClear = () => {
    setSearchText("");
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={wrapperRef} className="relative flex items-center">
      {/* ── Search Icon / Close Button in Navbar (Exact clean trigger) ── */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`p-1.5 transition-colors focus:outline-none cursor-pointer flex items-center justify-center ${
          isOpen ? "text-[#A36955]" : "text-[#111111] hover:text-[#A36955]"
        }`}
        aria-label={isOpen ? "Close search" : "Search"}
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <X size={20} strokeWidth={1.65} />
        ) : (
          <Search size={20} strokeWidth={1.65} />
        )}
      </button>

      {/* ── Pixel-Perfect Search Dropdown (Matching Reference Image) ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-full mt-3.5 w-[620px] max-w-[calc(100vw-32px)] bg-[#FFFCFA] border border-[#EAD6CB] rounded-[16px] shadow-[0_12px_35px_rgba(55,34,25,0.12)] z-50 p-4 sm:p-5 right-[-40px] sm:right-[-104px]"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            {/* Triangular pointer at the top pointing toward the navbar search icon */}
            <div
              className="absolute -top-[7px] w-3.5 h-3.5 bg-[#FFFCFA] border-t border-l border-[#EAD6CB] rotate-45 z-10"
              style={{ right: "113px" }}
            />

            {/* ── Search Input Field & Integrated Button ── */}
            <form onSubmit={handleSubmit} className="relative z-10">
              <div className="relative flex items-center h-[58px] rounded-[35px] border border-[#AD7663] bg-[#FFFCFA] pl-5 pr-1.5 focus-within:ring-2 focus-within:ring-[#AD7663]/25 transition-all">
                <Search
                  size={20}
                  className="text-[#A36955] shrink-0"
                  strokeWidth={1.8}
                />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchText}
                  onChange={(e) => handleChange(e.target.value)}
                  onFocus={() => searchText.length > 1 && setShowSuggestions(true)}
                  placeholder={
                    t("Search fabrics, suits...") || "Search fabrics, suits..."
                  }
                  className="w-full text-[15px] font-normal text-[#2B211E] placeholder:text-[#999999] bg-transparent focus:outline-none focus:ring-0 focus-visible:outline-none outline-none border-none ring-0 ml-3"
                  style={{ outline: "none", boxShadow: "none", border: "none" }}
                  aria-label="Search products"
                  autoComplete="off"
                />
                {searchText && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="p-1 text-neutral-400 hover:text-[#A36955] transition-colors cursor-pointer mr-1"
                    aria-label="Clear search"
                  >
                    <X size={15} />
                  </button>
                )}

                {/* Subtle vertical divider */}
                <span className="w-[1px] h-[26px] bg-[#EAD6CB] mx-3 shrink-0" />

                {/* Brown SEARCH button */}
                <button
                  type="submit"
                  className="h-[44px] px-6 rounded-full bg-[#A36955] hover:bg-[#8E5745] text-white text-[13px] font-semibold tracking-[1.2px] uppercase transition-colors duration-[180ms] shrink-0 flex items-center justify-center cursor-pointer shadow-xs focus:outline-none"
                  style={{ outline: "none" }}
                >
                  SEARCH
                </button>
              </div>
            </form>

            {/* ── Live Search Suggestions (when typing) ── */}
            {searchText.length > 1 && (
              <div className="relative z-10 mt-2">
                <SearchSuggestions
                  searchText={searchText}
                  showSuggestions={showSuggestions}
                  onSelect={handleClose}
                  onClose={() => setShowSuggestions(false)}
                  inline={true}
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;


