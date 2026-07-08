"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { Globe, ChevronDown } from "lucide-react";
import { setAppLocale } from "@utils/locale";

const LANGUAGES = [
  { code: "en", short: "EN", label: "English" },
  { code: "hi", short: "हिं", label: "हिन्दी" },
];

const LanguageSwitcher = ({ variant = "desktop", onSelect }) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = router.locale || "en";
  const active = LANGUAGES.find((l) => l.code === current) || LANGUAGES[0];

  useEffect(() => {
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const pick = (code) => {
    setOpen(false);
    onSelect?.();
    setAppLocale(router, code);
  };

  if (variant === "mobile") {
    return (
      <div className="flex justify-center items-center gap-3">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            type="button"
            onClick={() => pick(lang.code)}
            className={`text-[12px] font-bold tracking-widest uppercase px-4 py-2 border transition-colors ${
              current === lang.code
                ? "border-[#111111] text-[#111111]"
                : "border-neutral-200 text-neutral-500 hover:border-neutral-400"
            }`}
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            {lang.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 text-[12px] tracking-[0.12em] uppercase font-normal text-[#111111] hover:text-[#111111]/70 transition-colors"
        style={{ fontFamily: "'Poppins', sans-serif" }}
        aria-label="Choose language"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <Globe size={17} strokeWidth={1.75} />
        <span>{active.short}</span>
        <ChevronDown
          size={14}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 top-full mt-2 min-w-[140px] bg-white border border-neutral-100 shadow-lg z-[60] py-1"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              role="option"
              aria-selected={current === lang.code}
              onClick={() => pick(lang.code)}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                current === lang.code
                  ? "bg-neutral-50 text-[#111111] font-semibold"
                  : "text-neutral-600 hover:bg-neutral-50 hover:text-[#111111]"
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
