/* ============================================================
   SearchBar.js — Expandable inline search with smooth animation
   ============================================================ */
"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import SearchSuggestions from "@components/search/SearchSuggestions";

const SearchBar = () => {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);
  const wrapperRef = useRef(null);

  // Sync search query from URL
  useEffect(() => {
    if (router.pathname === "/search" && router.query.query) {
      setSearchText(router.query.query);
    }
  }, [router.pathname, router.query.query]);

  // Auto-focus when expanded
  useEffect(() => {
    if (isExpanded) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setShowSuggestions(false);
    }
  }, [isExpanded]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsExpanded(false);
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = searchText.trim();
    if (!trimmed) return;
    setShowSuggestions(false);
    setIsExpanded(false);
    router
      .push(
        { pathname: "/search", query: { query: trimmed } },
        `/search?query=${encodeURIComponent(trimmed)}`
      )
      .then(() => setSearchText(""));
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
      {/* Expanded search input */}
      <AnimatePresence>
        {isExpanded && (
          <motion.form
            key="search-form"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 220, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            onSubmit={handleSubmit}
            className="overflow-hidden mr-2"
          >
            <div className="relative flex items-center">
              <input
                ref={inputRef}
                type="search"
                value={searchText}
                onChange={(e) => handleChange(e.target.value)}
                onFocus={() => searchText.length > 1 && setShowSuggestions(true)}
                placeholder="Search fabrics, suits..."
                className="w-full h-9 pl-3 pr-8 text-[11px] tracking-wide border border-neutral-200 rounded-none bg-white text-[#1F2937] placeholder-neutral-300 focus:outline-none focus:border-[#E35353] transition-colors duration-200"
                aria-label="Search products"
              />
              {searchText && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute right-2 text-neutral-400 hover:text-[#E35353] transition-colors"
                  aria-label="Clear search"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Search icon toggle */}
      <motion.button
        type="button"
        onClick={() => setIsExpanded((v) => !v)}
        className="p-2 text-[#1F2937] hover:text-[#E35353] transition-colors duration-300 rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E35353]/40"
        aria-label={isExpanded ? "Close search" : "Open search"}
        whileTap={{ scale: 0.9 }}
      >
        <AnimatePresence mode="wait">
          {isExpanded ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X size={18} strokeWidth={1.5} />
            </motion.span>
          ) : (
            <motion.span
              key="search"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Search size={18} strokeWidth={1.5} />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Suggestions overlay */}
      {isExpanded && (
        <div className="absolute top-full right-0 w-[220px] z-50">
          <SearchSuggestions
            searchText={searchText}
            showSuggestions={showSuggestions}
            onSelect={() => {
              setSearchText("");
              setShowSuggestions(false);
              setIsExpanded(false);
            }}
            onClose={() => setShowSuggestions(false)}
          />
        </div>
      )}
    </div>
  );
};

export default SearchBar;
