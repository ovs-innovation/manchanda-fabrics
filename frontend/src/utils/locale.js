import { translateProductTitle } from "./fashionTranslations";

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
  const key = String(text).trim();
  const translated = t(key);
  if (translated && translated !== key) return translated;
  return translateProductTitle(key, locale || "hi");
};
