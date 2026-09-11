import React, { useState, useRef, useEffect, useMemo } from "react";
import { FiEye, FiSearch, FiChevronDown, FiX, FiCheck } from "react-icons/fi";
import { BiColorFill } from "react-icons/bi";
import {
  FABRIC_COLORS,
  COLOR_FAMILIES,
  findClosestFabricColor,
  normalizeHex,
} from "@/utils/fabricColors";

const isValidHex = (hex) =>
  typeof hex === "string" && /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/.test(hex.trim());

export const resolveHex = (code, name) => {
  if (isValidHex(code)) return code.trim().toUpperCase();
  if (isValidHex(name)) return name.trim().toUpperCase();

  const searchTerms = [name, code]
    .filter(Boolean)
    .map((s) => String(s).trim().toLowerCase());

  for (const term of searchTerms) {
    const found = FABRIC_COLORS.find(
      (c) => c.name.toLowerCase() === term
    );
    if (found) return found.hex;
  }

  for (const term of searchTerms) {
    const partial = FABRIC_COLORS.find(
      (c) =>
        term.includes(c.name.toLowerCase()) ||
        c.name.toLowerCase().includes(term)
    );
    if (partial) return partial.hex;
  }

  return "";
};

// Popular ethnic colors shown by default when opening search
const POPULAR_COLORS = [
  "Rani Pink",
  "Baby Pink",
  "Blush Pink",
  "Bridal Red",
  "Sindoor Red",
  "Maroon",
  "Bottle Green",
  "Pista Green",
  "Emerald Green",
  "Peacock Blue",
  "Royal Blue",
  "Navy Blue",
  "Mustard Yellow",
  "Haldi Yellow",
  "Rust Orange",
  "Peach",
  "Lavender",
  "Pure White",
  "Off White",
  "Charcoal Grey",
];

const ColorPickerInput = ({
  colorName = "",
  colorCode = "",
  onChange,
  placeholder = "Search or type color name...",
  required = false,
  disabled = false,
  className = "",
  compact = false,
}) => {
  const [isOpen, setIsOpen] = useState(false); // Full palette popover
  const [isSearchOpen, setIsSearchOpen] = useState(false); // Live autocomplete dropdown
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [activeFamily, setActiveFamily] = useState("Pink");
  const [searchQuery, setSearchQuery] = useState("");
  
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const colorInputRef = useRef(null);
  const listRef = useRef(null);

  // Fallback or derive guaranteed valid hex
  const effectiveHex = resolveHex(colorCode, colorName);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Filter and rank colors based on what the user types in the input
  const searchSuggestions = useMemo(() => {
    const q = (colorName || "").trim().toLowerCase();
    if (!q) {
      // Return popular curated shades when input is empty
      return FABRIC_COLORS.filter((c) => POPULAR_COLORS.includes(c.name));
    }

    // Rank matching colors: exact match first, starts with query, word starts with query, then includes
    const exact = [];
    const startsWith = [];
    const wordStarts = [];
    const contains = [];

    for (const item of FABRIC_COLORS) {
      const nameLower = item.name.toLowerCase();
      const familyLower = item.family.toLowerCase();

      if (nameLower === q) {
        exact.push(item);
      } else if (nameLower.startsWith(q)) {
        startsWith.push(item);
      } else if (nameLower.split(/\s+/).some((w) => w.startsWith(q))) {
        wordStarts.push(item);
      } else if (
        nameLower.includes(q) ||
        familyLower.includes(q) ||
        item.hex.toLowerCase().includes(q)
      ) {
        contains.push(item);
      }
    }

    return [...exact, ...startsWith, ...wordStarts, ...contains].slice(0, 15);
  }, [colorName]);

  // Handle color selection from either autocomplete or palette
  const handleSelectPreset = (preset) => {
    if (onChange) {
      onChange({
        colorName: preset.name,
        colorCode: preset.hex,
      });
    }
    setIsSearchOpen(false);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  // Handle native color picker change
  const handleNativePickerChange = (e) => {
    const hex = e.target.value.toUpperCase();
    const closest = findClosestFabricColor(hex);
    if (onChange) {
      onChange({
        colorName: colorName || closest?.name || "Custom Color",
        colorCode: hex,
      });
    }
  };

  // Handle typing directly in the input box
  const handleNameChange = (e) => {
    const val = e.target.value;
    const detectedHex = resolveHex("", val);
    if (onChange) {
      onChange({
        colorName: val,
        colorCode: detectedHex || colorCode,
      });
    }
    setIsSearchOpen(true);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  // Handle keyboard navigation in autocomplete list
  const handleKeyDown = (e) => {
    if (!isSearchOpen && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setIsSearchOpen(true);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => {
        const next = prev < searchSuggestions.length - 1 ? prev + 1 : 0;
        // Scroll item into view
        const itemEl = listRef.current?.children[next];
        if (itemEl) itemEl.scrollIntoView({ block: "nearest" });
        return next;
      });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => {
        const next = prev > 0 ? prev - 1 : searchSuggestions.length - 1;
        const itemEl = listRef.current?.children[next];
        if (itemEl) itemEl.scrollIntoView({ block: "nearest" });
        return next;
      });
    } else if (e.key === "Enter") {
      if (isSearchOpen && highlightedIndex >= 0 && searchSuggestions[highlightedIndex]) {
        e.preventDefault();
        handleSelectPreset(searchSuggestions[highlightedIndex]);
      } else if (isSearchOpen && searchSuggestions.length > 0) {
        // If exact match exists, pick it
        const exactMatch = searchSuggestions.find(
          (c) => c.name.toLowerCase() === (colorName || "").trim().toLowerCase()
        );
        if (exactMatch) {
          e.preventDefault();
          handleSelectPreset(exactMatch);
        } else {
          setIsSearchOpen(false);
        }
      } else {
        setIsSearchOpen(false);
      }
    } else if (e.key === "Escape") {
      setIsSearchOpen(false);
      setIsOpen(false);
    }
  };

  // Handle manual hex code change
  const handleHexChange = (e) => {
    const raw = e.target.value;
    const formatted = normalizeHex(raw);
    const closest = findClosestFabricColor(formatted);
    if (onChange) {
      onChange({
        colorName: colorName || closest?.name || "",
        colorCode: formatted,
      });
    }
  };

  // Eyedropper API to sample color directly from product photo on screen
  const handleEyeDropper = async () => {
    if (window.EyeDropper) {
      try {
        const eyeDropper = new window.EyeDropper();
        const result = await eyeDropper.open();
        if (result?.sRGBHex) {
          const hex = result.sRGBHex.toUpperCase();
          const closest = findClosestFabricColor(hex);
          if (onChange) {
            onChange({
              colorName: closest ? closest.name : colorName || "Sampled Color",
              colorCode: hex,
            });
          }
        }
      } catch (err) {
        console.log("Eyedropper canceled or failed:", err);
      }
    } else {
      if (colorInputRef.current) {
        colorInputRef.current.click();
      }
    }
  };

  // Filtered colors for the full palette popover
  const filteredPaletteColors = FABRIC_COLORS.filter((item) => {
    const matchesFamily =
      activeFamily === "All" || item.family === activeFamily;
    const matchesSearch =
      !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.hex.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.family.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFamily && matchesSearch;
  });

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Main Input Row */}
      <div className="flex items-center gap-2">
        {/* Color Swatch / Palette trigger */}
        <button
          type="button"
          onClick={() => {
            setIsOpen(!isOpen);
            setIsSearchOpen(false);
          }}
          disabled={disabled}
          title={
            effectiveHex
              ? `${colorName || "Selected color"}: ${effectiveHex} (Click to browse shades)`
              : "Click to select a color"
          }
          className="relative w-10 h-10 rounded-xl border-2 border-gray-300 dark:border-gray-600 shadow-sm shrink-0 flex items-center justify-center transition-all hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-500 overflow-hidden group"
          style={{
            backgroundColor: effectiveHex || "#E3007E",
          }}
        >
          {!effectiveHex && (
            <BiColorFill className="text-gray-400 group-hover:text-emerald-600 transition-colors" />
          )}
          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-black/20 clip-triangle" />
        </button>

        {/* Hidden native HTML5 color input */}
        <input
          ref={colorInputRef}
          type="color"
          value={effectiveHex && effectiveHex.startsWith("#") && effectiveHex.length === 7 ? effectiveHex : "#E3007E"}
          onChange={handleNativePickerChange}
          className="sr-only"
        />

        {/* Searchable Color Name Input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <FiSearch size={15} />
          </div>
          <input
            ref={inputRef}
            type="text"
            required={required}
            disabled={disabled}
            value={colorName}
            onChange={handleNameChange}
            onFocus={() => {
              setIsSearchOpen(true);
              setIsOpen(false);
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            autoComplete="off"
            className="w-full text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 pl-9 pr-8 py-2.5 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all placeholder:text-gray-400"
          />
          {colorName && (
            <button
              type="button"
              onClick={() => {
                if (onChange) onChange({ colorName: "", colorCode: "" });
                inputRef.current?.focus();
                setIsSearchOpen(true);
              }}
              title="Clear color"
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <FiX size={15} />
            </button>
          )}
        </div>

        {/* Hex Code Input (compact) */}
        <div className="relative w-24 shrink-0">
          <input
            type="text"
            disabled={disabled}
            value={effectiveHex || colorCode}
            onChange={handleHexChange}
            placeholder="#HEX"
            maxLength={7}
            className="w-full text-xs uppercase font-mono font-semibold rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 px-2.5 py-2.5 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none text-center"
          />
        </div>

        {/* Action: Native Color Picker Wheel */}
        <button
          type="button"
          onClick={() => colorInputRef.current && colorInputRef.current.click()}
          title="Open custom color wheel"
          className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors shrink-0"
        >
          <BiColorFill size={18} />
        </button>

        {/* Action: EyeDropper tool (sample color from photo) */}
        {Boolean(window.EyeDropper) && (
          <button
            type="button"
            onClick={handleEyeDropper}
            title="Pick color directly from product image"
            className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-400 transition-colors shrink-0 flex items-center gap-1 text-xs font-semibold"
          >
            <FiEye size={15} />
            <span className="hidden sm:inline">Pick</span>
          </button>
        )}

        {/* Action: Full Palette dropdown toggle */}
        <button
          type="button"
          onClick={() => {
            setIsOpen(!isOpen);
            setIsSearchOpen(false);
          }}
          title="Browse all fabric color shades"
          className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors shrink-0"
        >
          <FiChevronDown
            size={16}
            className={`transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {/* 1. Instant Autocomplete Search Suggestions Dropdown */}
      {isSearchOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150 max-w-lg">
          {/* Header label */}
          <div className="px-3.5 py-2 bg-gray-50/80 dark:bg-gray-900/80 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between text-[11px] font-semibold text-gray-500 dark:text-gray-400">
            <span>
              {colorName?.trim()
                ? `Matching Colors (${searchSuggestions.length} found)`
                : "Popular Fabric Colors (Type to search 80+ shades)"}
            </span>
            <button
              type="button"
              onClick={() => {
                setIsSearchOpen(false);
                setIsOpen(true);
              }}
              className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
            >
              Browse Palette
            </button>
          </div>

          {/* Suggestions List */}
          <div ref={listRef} className="max-h-60 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-800/60 scrollbar-thin">
            {searchSuggestions.map((item, idx) => {
              const isHighlighted = idx === highlightedIndex;
              const isCurrent =
                effectiveHex.toLowerCase() === item.hex.toLowerCase() ||
                (colorName || "").trim().toLowerCase() === item.name.toLowerCase();

              return (
                <button
                  key={item.name + item.hex}
                  type="button"
                  onClick={() => handleSelectPreset(item)}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 text-left transition-colors ${
                    isHighlighted
                      ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-100"
                      : isCurrent
                      ? "bg-emerald-50/40 dark:bg-emerald-950/20"
                      : "hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Swatch circle */}
                    <span
                      className="w-6 h-6 rounded-full shrink-0 border border-black/15 shadow-xs flex items-center justify-center"
                      style={{ backgroundColor: item.hex }}
                    >
                      {isCurrent && (
                        <FiCheck
                          size={12}
                          className={
                            ["#FFFFFF", "#FAF9F6", "#FFFFF0", "#FFFDD0", "#F5F5DC", "#FDFD96", "#FFF44F", "#FFE5B4", "#FFE4E1", "#FFD1DC", "#F4C2C2"].includes(item.hex)
                              ? "text-gray-800"
                              : "text-white"
                          }
                        />
                      )}
                    </span>
                    <div className="min-w-0">
                      <span className="text-sm font-semibold block truncate">
                        {item.name}
                      </span>
                      <span className="text-[10px] text-gray-400 dark:text-gray-500">
                        {item.family}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                      {item.family}
                    </span>
                    <span className="text-xs font-mono font-bold text-gray-400 dark:text-gray-400">
                      {item.hex}
                    </span>
                  </div>
                </button>
              );
            })}

            {searchSuggestions.length === 0 && (
              <div className="p-4 text-center text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <p className="font-semibold text-gray-700 dark:text-gray-200">
                  No preset color matched "{colorName}"
                </p>
                <p className="text-[11px] text-gray-400">
                  You can keep this as a custom color name and select any hex code with the color picker.
                </p>
              </div>
            )}
          </div>

          {/* Footer note */}
          <div className="px-3 py-1.5 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700 text-[10px] text-gray-400 flex items-center justify-between">
            <span>↑↓ Navigate • Enter to select • Esc to close</span>
            <span>80+ Ethnic Fabric Colors</span>
          </div>
        </div>
      )}

      {/* 2. Full Fabric Color Palette Popover (Tabs + Grid) */}
      {isOpen && (
        <div className="absolute z-50 left-0 mt-2 w-[340px] sm:w-[460px] p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-2.5">
            <div>
              <h4 className="text-xs font-bold text-gray-800 dark:text-white uppercase tracking-wider">
                Fabric & Fashion Color Shades
              </h4>
              <p className="text-[11px] text-gray-400">
                Click any shade to apply exact name and hex code
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <FiX size={16} />
            </button>
          </div>

          {/* Search bar inside popover */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-2.5 text-gray-400" size={14} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search shades (e.g. Rani, Baby Pink, Mustard)..."
              className="w-full text-xs pl-8 pr-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-emerald-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2 text-gray-400 hover:text-gray-600 text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Color Family Tabs */}
          {!searchQuery && (
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
              {COLOR_FAMILIES.map((family) => {
                const isActive = activeFamily === family;
                return (
                  <button
                    key={family}
                    type="button"
                    onClick={() => setActiveFamily(family)}
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg whitespace-nowrap transition-colors ${
                      isActive
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    {family}
                  </button>
                );
              })}
            </div>
          )}

          {/* Swatches Grid */}
          <div className="max-h-64 overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-3 gap-2">
            {filteredPaletteColors.map((color) => {
              const isSelected =
                effectiveHex.toLowerCase() === color.hex.toLowerCase() ||
                colorName.trim().toLowerCase() === color.name.toLowerCase();

              return (
                <button
                  key={color.name}
                  type="button"
                  onClick={() => handleSelectPreset(color)}
                  className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all ${
                    isSelected
                      ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-1 ring-emerald-500"
                      : "border-gray-100 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-gray-50/60 dark:bg-gray-900/40 hover:bg-white dark:hover:bg-gray-800"
                  }`}
                >
                  <span
                    className="w-6 h-6 rounded-lg shrink-0 border border-black/10 shadow-xs flex items-center justify-center"
                    style={{ backgroundColor: color.hex }}
                  >
                    {isSelected && (
                      <FiCheck
                        size={12}
                        className={
                          ["#FFFFFF", "#FAF9F6", "#FFFFF0", "#FFFDD0", "#F5F5DC", "#FDFD96", "#FFF44F", "#FFE5B4", "#FFE4E1", "#FFD1DC", "#F4C2C2"].includes(color.hex)
                            ? "text-gray-800"
                            : "text-white"
                        }
                      />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">
                      {color.name}
                    </p>
                    <p className="text-[10px] font-mono text-gray-400 truncate">
                      {color.hex}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {filteredPaletteColors.length === 0 && (
            <div className="text-center py-6 text-xs text-gray-400">
              No matching color shades found. Try typing a custom color name above!
            </div>
          )}

          {/* Quick Tip Footer */}
          <div className="pt-2 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-[11px] text-gray-400">
            <span>
              💡 Tip: Click <strong className="text-emerald-600">Pick</strong> to sample directly from your photo.
            </span>
            <button
              type="button"
              onClick={() => colorInputRef.current && colorInputRef.current.click()}
              className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
            >
              Custom Wheel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorPickerInput;
