export const STORE_BRAND_NAME = "Manchanda Fabrics";

export const STORE_DEFAULT_ADDRESS_EN =
  "12-A, Krishna Cloth Market, Chandni Chowk - 110006";

export const STORE_DEFAULT_ADDRESS_HI =
  "12-ए, कृष्णा क्लॉथ मार्केट, चाँदनी चौक - 110006";

export const STORE_DEFAULT_ADDRESS = STORE_DEFAULT_ADDRESS_EN;

export const translateStoreAddress = (addr, lang = "en") => {
  if (!addr) return "";
  let text = "";
  if (typeof addr === "string") {
    text = addr;
  } else if (typeof addr === "object") {
    text = addr[lang] || addr.hi || addr.en || "";
  } else {
    text = String(addr);
  }
  if (!text || typeof text !== "string") return "";
  if (lang !== "hi") return text.trim();

  let translated = text.trim();
  if (
    translated === STORE_DEFAULT_ADDRESS_EN ||
    translated === "12-A, Krishna Cloth Market, Chandni Chowk - 110006" ||
    translated === "Address - 12-A, Krishna Cloth Market, Chandni Chowk - 110006" ||
    translated.includes("Krishna Cloth Market, Chandni Chowk")
  ) {
    if (translated.startsWith("Address - ") || translated.startsWith("Address -")) {
      return "पता - " + STORE_DEFAULT_ADDRESS_HI;
    }
    return STORE_DEFAULT_ADDRESS_HI;
  }

  const map = {
    "Krishna Cloth Market": "कृष्णा क्लॉथ मार्केट",
    "Chandni Chowk": "चाँदनी चौक",
    "Delhi": "दिल्ली",
    "Address -": "पता -",
    "Address:": "पता:",
    "Address": "पता",
  };

  for (const [en, hi] of Object.entries(map)) {
    translated = translated.split(en).join(hi);
  }

  return translated;
};

const pickLang = (value, lang = "en") => {
  if (!value) return "";
  if (typeof value === "string") {
    return lang === "hi" ? translateStoreAddress(value, "hi") : value.trim();
  }
  if (typeof value === "object") {
    const picked = value[lang] || value.en || value.hi || "";
    return typeof picked === "string" ? (lang === "hi" ? translateStoreAddress(picked, "hi") : picked.trim()) : "";
  }
  return String(value).trim();
};

export const getContactUsAddressParts = (
  storeCustomizationSetting,
  { lang = "en", showingTranslateValue } = {}
) => {
  const contact = storeCustomizationSetting?.contact_us || {};
  if (showingTranslateValue) {
    return [
      showingTranslateValue(contact.address_box_address_one),
      showingTranslateValue(contact.address_box_address_two),
      showingTranslateValue(contact.address_box_address_three),
    ].filter(Boolean);
  }
  return [
    pickLang(contact.address_box_address_one, lang),
    pickLang(contact.address_box_address_two, lang),
    pickLang(contact.address_box_address_three, lang),
  ].filter(Boolean);
};

export const sanitizeAddress = (addr) => {
  if (!addr) return "";
  let str = "";
  if (typeof addr === "string") {
    str = addr;
  } else if (typeof addr === "object") {
    str = addr.hi || addr.en || "";
  } else {
    str = String(addr);
  }
  if (typeof str !== "string") return "";
  return str
    .replace(/,\s*,/g, ",")
    .replace(/,+/g, ",")
    .replace(/\s+/g, " ")
    .replace(/,\s*$/, "")
    .replace(/^\s*,/, "")
    .trim();
};

export const getStoreAddress = ({
  storeCustomizationSetting,
  globalSetting,
  lang = "en",
  showingTranslateValue,
} = {}) => {
  const fromContact = getContactUsAddressParts(storeCustomizationSetting, {
    lang,
    showingTranslateValue,
  }).join(", ");
  const defaultAddr = lang === "hi" ? STORE_DEFAULT_ADDRESS_HI : STORE_DEFAULT_ADDRESS_EN;
  const globalAddr = globalSetting?.address;
  const globalAddrStr = typeof globalAddr === "string"
    ? globalAddr
    : (globalAddr?.[lang] || globalAddr?.hi || globalAddr?.en || "");

  const rawAddress = fromContact || (globalAddrStr ? (lang === "hi" ? translateStoreAddress(globalAddrStr, "hi") : globalAddrStr) : defaultAddr);
  const sanitized = sanitizeAddress(rawAddress);
  return lang === "hi" ? translateStoreAddress(sanitized, "hi") : sanitized;
};

export const getStoreCompanyName = () => STORE_BRAND_NAME;

