import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { setAppLocale } from "@utils/locale";
import useGetSetting from "@hooks/useGetSetting";
import { pickBrandLogo } from "@utils/brandAssets";

const LanguagePopup = () => {
  const router = useRouter();
  const { storeCustomizationSetting, globalSetting } = useGetSetting();
  const adminLogo = pickBrandLogo(
    globalSetting?.logo,
    storeCustomizationSetting?.navbar?.logo
  );
  const logo = adminLogo || "/manchandalogo.png";
  const [mounted, setMounted] = useState(false);
  const [show, setShow] = useState(false);
  const [selecting, setSelecting] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0); // For keyboard navigation (0 = English, 1 = Hindi)
  const englishRef = useRef(null);
  const hindiRef = useRef(null);

  // Check session and first visit on mount (and support force_lang=true for testing)
  useEffect(() => {
    setMounted(true);
    if (typeof window === "undefined") return;
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const forceShow = urlParams.get("force_lang") === "true";
      const sessionShown = sessionStorage.getItem("languagePopupShown");
      
      if (!sessionShown || forceShow) {
        setShow(true);
      }
    } catch (e) {
      // Fallback if sessionStorage or URLSearchParams fails
      setShow(true);
    }
  }, []);

  // Lock body scroll while popup is open
  useEffect(() => {
    if (!show) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [show]);

  // Focus trap and keyboard navigation
  useEffect(() => {
    if (!show) return;
    
    // Focus active element
    if (activeIndex === 0 && englishRef.current) {
      englishRef.current.focus();
    } else if (activeIndex === 1 && hindiRef.current) {
      hindiRef.current.focus();
    }

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
      } else if (e.key === "ArrowDown" || e.key === "Tab") {
        e.preventDefault();
        setActiveIndex((prev) => (prev === 0 ? 1 : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((prev) => (prev === 1 ? 0 : 1));
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [show, activeIndex]);

  // Language selection handler
  const handleSelect = (code) => {
    if (selecting) return;
    setSelecting(true);
    try {
      localStorage.setItem("locale", code);
      sessionStorage.setItem("languagePopupShown", "true");
      document.cookie = "NEXT_LOCALE=" + code + "; path=/; max-age=31536000";
      document.cookie = "_lang=" + code + "; path=/; max-age=31536000";
    } catch (e) {}
    setShow(false);
    setAppLocale(router, code);
  };

  if (!mounted || !show) return null;

  return (
    <div
      aria-modal="true"
      role="dialog"
      aria-label="Choose your language"
      className="fixed inset-0 z-[99999] bg-[#0c0a09]/75 backdrop-blur-md flex items-center justify-center p-4 animate-[fadeIn_0.25s_ease_both]"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-[0_32px_64px_-12px_rgba(12,10,9,0.2)] border border-neutral-100 p-8 max-w-md w-full text-center transform transition-all duration-300 scale-100 opacity-100 animate-[scaleIn_0.35s_cubic-bezier(0.34,1.56,0.64,1)_both]"
      >
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img
            src={logo}
            alt="Manchanda Fabrics Logo"
            className="h-16 sm:h-20 w-auto object-contain select-none"
            draggable="false"
          />
        </div>

        {/* Heading */}
        <h2 className="font-serif text-2xl font-semibold tracking-wide text-neutral-900 mb-2">
          Choose Your Language
        </h2>

        {/* Subtitle */}
        <p className="text-sm text-neutral-500 font-light mb-8 max-w-xs mx-auto">
          Please select your preferred language to continue.
        </p>

        {/* Buttons / Choice Cards */}
        <div className="flex flex-col gap-4">
          <button
            ref={englishRef}
            type="button"
            disabled={selecting}
            onClick={() => handleSelect("en")}
            onMouseEnter={() => setActiveIndex(0)}
            className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 group cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-[#B0322F] ${
              activeIndex === 0
                ? "border-[#B0322F] bg-neutral-50/50 shadow-sm"
                : "border-neutral-200 hover:border-[#B0322F] hover:bg-neutral-50/50"
            }`}
          >
            <span className="text-3xl filter drop-shadow-sm group-hover:scale-110 transition-transform duration-300">
              🇬🇧
            </span>
            <div>
              <h3 className={`font-semibold text-sm tracking-wide transition-colors ${
                activeIndex === 0 ? "text-[#B0322F]" : "text-neutral-800"
              }`}>
                English
              </h3>
              <p className="text-xs text-neutral-400 font-light mt-0.5">
                Browse the site in English
              </p>
            </div>
          </button>

          <button
            ref={hindiRef}
            type="button"
            disabled={selecting}
            onClick={() => handleSelect("hi")}
            onMouseEnter={() => setActiveIndex(1)}
            className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 group cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-[#B0322F] ${
              activeIndex === 1
                ? "border-[#B0322F] bg-neutral-50/50 shadow-sm"
                : "border-neutral-200 hover:border-[#B0322F] hover:bg-neutral-50/50"
            }`}
          >
            <span className="text-3xl filter drop-shadow-sm group-hover:scale-110 transition-transform duration-300">
              🇮🇳
            </span>
            <div>
              <h3 className={`font-semibold text-sm tracking-wide transition-colors ${
                activeIndex === 1 ? "text-[#B0322F]" : "text-neutral-800"
              }`}>
                हिन्दी
              </h3>
              <p className="text-xs text-neutral-400 font-light mt-0.5">
                साइट को हिन्दी में देखें
              </p>
            </div>
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default LanguagePopup;
