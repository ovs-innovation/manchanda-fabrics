export const STORE_BRAND_NAME = "Manchanda Fabrics";

export const STORE_DEFAULT_ADDRESS =
  "12-A, Krishna Market, Chandni Chowk, Delhi - 110006";

const pickLang = (value, lang = "en") => {
  if (!value) return "";
  if (typeof value === "string") return value.trim();
  return String(value[lang] || value.en || "").trim();
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
  return fromContact || globalSetting?.address || STORE_DEFAULT_ADDRESS;
};

export const getStoreCompanyName = () => STORE_BRAND_NAME;
