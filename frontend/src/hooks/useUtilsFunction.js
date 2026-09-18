import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import dayjs from "dayjs";
import useTranslation from "next-translate/useTranslation";
import useGetSetting from "./useGetSetting";
import { translateProductTitle } from "@utils/fashionTranslations";
import { getAiTranslation, subscribeAiTranslations } from "@utils/aiTranslator";

export const formatPrice = (value = 0) => {
  const num = Math.max(0, parseFloat(value) || 0);
  return num.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: num % 1 === 0 ? 0 : 2,
  });
};

const useUtilsFunction = () => {
  const router = useRouter();
  const { t } = useTranslation("common");
  const lang = router?.locale || "en";
  const [, setAiTick] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  // Subscribe to background AI translation updates so UI dynamically updates
  useEffect(() => {
    setIsMounted(true);
    if (lang === "hi") {
      return subscribeAiTranslations(() => {
        setAiTick((c) => c + 1);
      });
    }
  }, [lang]);

  const { globalSetting } = useGetSetting();

  const rawCurrency = globalSetting?.default_currency;
  const currency =
    rawCurrency && rawCurrency !== "$" && rawCurrency !== "USD"
      ? rawCurrency
      : "₹";

  //for date and time format
  const showTimeFormat = (data, timeFormat) => {
    return dayjs(data).format(timeFormat);
  };

  const showDateFormat = (data) => {
    return dayjs(data).format(globalSetting?.default_date_format);
  };

  const showDateTimeFormat = (data, date, time) => {
    return dayjs(data).format(`${date} ${time}`);
  };

  //for formatting number

  const getNumber = (value = 0) => {
    return Number(parseFloat(value || 0).toFixed(2));
  };

  const getNumberTwo = (value = 0) => {
    return parseFloat(value || 0).toFixed(2);
  };

  //for translation
  const showingTranslateValue = (data) => {
    if (!data) return "";
    if (typeof data === "string") {
      const trimmed = data.trim();
      if (lang === "hi") {
        const translated = t(trimmed);
        if (translated && translated !== trimmed && !/[a-zA-Z]/.test(translated)) return translated;
        const dictTrans = translateProductTitle(trimmed, "hi");
        if (dictTrans && !/[a-zA-Z]/.test(dictTrans)) return dictTrans;
        if (isMounted) {
          return getAiTranslation(dictTrans || trimmed, "hi");
        }
        return dictTrans || trimmed;
      }
      return data;
    }
    if (typeof data === "object") {
      // Check if nested category name or product title object was passed
      if (data.name && typeof data.name === "object") return showingTranslateValue(data.name);
      if (data.title && typeof data.title === "object") return showingTranslateValue(data.title);
      if (typeof data.name === "string" && !data.en && !data.hi) return showingTranslateValue(data.name);
      if (typeof data.title === "string" && !data.en && !data.hi) return showingTranslateValue(data.title);

      if (lang === "hi") {
        const hiStr = data.hi ? String(data.hi).trim() : "";
        const enStr = data.en ? String(data.en).trim() : "";

        // 1. If data.hi is already pure Hindi (has Devanagari AND NO English letters)
        if (hiStr && /[\u0900-\u097F]/.test(hiStr) && !/[a-zA-Z]/.test(hiStr)) {
          return hiStr;
        }

        // 2. If data.hi has mixed English characters (e.g. "Indian सूट"), clean via fashion dictionary
        if (hiStr && /[a-zA-Z]/.test(hiStr)) {
          const dictFromHi = translateProductTitle(hiStr, "hi");
          if (dictFromHi && !/[a-zA-Z]/.test(dictFromHi)) {
            return dictFromHi;
          }
        }

        // 3. Try fashion dictionary on enStr (e.g. "Indian Suit" -> "इंडियन सूट")
        if (enStr) {
          const dictFromEn = translateProductTitle(enStr, "hi");
          if (dictFromEn && !/[a-zA-Z]/.test(dictFromEn)) {
            return dictFromEn;
          }
        }

        // 4. Try next-translate t()
        const candidate = hiStr || enStr;
        if (candidate) {
          const translated = t(candidate);
          if (translated && translated !== candidate && !/[a-zA-Z]/.test(translated)) return translated;
        }

        // 5. Fallback to AI translation (Nemotron 3 Ultra) only after hydration mount
        const sourceForAi = enStr || hiStr;
        if (sourceForAi) {
          if (isMounted) {
            return getAiTranslation(sourceForAi, "hi");
          }
          const dictFallback = translateProductTitle(sourceForAi, "hi");
          return dictFallback || sourceForAi;
        }
      }

      const val =
        data !== undefined &&
        Object.prototype.hasOwnProperty.call(data, lang)
          ? data[lang]
          : undefined;
      const finalVal =
        val && String(val).trim() !== "" ? val : (data?.en || "");
      return finalVal;
    }
    return String(data);
  };

  const showingImage = (data) => {
    return data !== undefined && data;
  };

  const showingUrl = (data) => {
    return data !== undefined ? data : "!#";
  };

  return {
    t,
    lang,
    currency,
    formatPrice,
    getNumber,
    getNumberTwo,
    showTimeFormat,
    showDateFormat,
    showingImage,
    showingUrl,
    globalSetting,
    showDateTimeFormat,
    showingTranslateValue,
  };
};

export default useUtilsFunction;
