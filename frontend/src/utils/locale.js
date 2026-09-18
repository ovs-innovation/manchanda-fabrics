import { translateProductTitle } from "./fashionTranslations";
import { getAiTranslation } from "./aiTranslator";

/** Persist and switch Next.js locale (en default, hi supported). */
export const setAppLocale = (router, newLocale) => {
  if (!router || !newLocale) return;
  if (router.locale === newLocale) return;

  if (typeof window !== "undefined") {
    localStorage.setItem("locale", newLocale);
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
    document.cookie = `_lang=${newLocale}; path=/; max-age=31536000`;
  }

  router.push(router.asPath, router.asPath, { locale: newLocale, scroll: false });
};

export const getSavedLocale = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("locale");
};

/** Translate UI labels stored in English (e.g. category/product names). */
export const translateLabel = (text, t, locale = "en") => {
  if (!text) return "";
  if (locale !== "hi") return text;
  const key = String(text).trim();

  // If already pure Hindi without English characters
  if (/[\u0900-\u097F]/.test(key) && !/[a-zA-Z]/.test(key)) {
    return key;
  }

  // Try Next-Translate t()
  if (typeof t === "function") {
    const translated = t(key);
    if (translated && translated !== key && !/[a-zA-Z]/.test(translated)) return translated;
  }

  // Try fashion dictionary
  const dictFallback = translateProductTitle(key, "hi");
  if (dictFallback && !/[a-zA-Z]/.test(dictFallback)) {
    return dictFallback;
  }

  return dictFallback || key;
};

