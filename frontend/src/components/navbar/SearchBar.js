/* ============================================================
   SearchBar.js — Expandable inline search with smooth animation
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

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isExpanded) {
        setIsExpanded(false);
        setShowSuggestions(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isExpanded]);

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
            animate={{ width: 240, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
            onSubmit={handleSubmit}
            className="overflow-hidden mr-1.5"
          >
            <div className="relative flex items-center">
              <input
                ref={inputRef}
                type="search"
                value={searchText}
                onChange={(e) => handleChange(e.target.value)}
                onFocus={() => searchText.length > 1 && setShowSuggestions(true)}
                placeholder={t("Search fabrics, suits...")}
                className="w-full h-8.5 pl-3.5 pr-7 text-xs font-normal tracking-wide border border-neutral-300 rounded-full bg-white text-[#111111] placeholder:text-neutral-400 focus:outline-none focus:border-[#9C6A5A] focus:ring-1 focus:ring-[#9C6A5A] transition-colors duration-200"
                aria-label="Search products"
              />
              {searchText && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute right-2 text-neutral-400 hover:text-[#9C6A5A] transition-colors p-0.5"
                  aria-label="Clear search"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Search icon toggle */}
      <button
        type="button"
        onClick={() => setIsExpanded((v) => !v)}
        className="p-1 text-[#111111] hover:text-[#9C6A5A] transition-colors rounded-sm focus:outline-none"
        aria-label={isExpanded ? "Close search" : "Open search"}
      >
        <AnimatePresence mode="wait">
          {isExpanded ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center justify-center text-[#9C6A5A]"
            >
              <X size={20} strokeWidth={1.75} />
            </motion.span>
          ) : (
            <motion.span
              key="search"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center justify-center"
            >
              <Search size={20} strokeWidth={1.75} />
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Suggestions overlay */}
      {isExpanded && (
        <div className="absolute top-full right-0 w-[280px] sm:w-[320px] z-50">
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

