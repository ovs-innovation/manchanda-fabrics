const Setting = require("../models/Setting");

const STORE_BRAND_NAME = "Manchanda Fabrics";

const STORE_DEFAULT_ADDRESS =
  "12-A, Krishna Market, Chandni Chowk, Delhi - 110006";

const pickLang = (value, lang = "en") => {
  if (!value) return "";
  if (typeof value === "string") return value.trim();
  return String(value[lang] || value.en || "").trim();
};

const getContactUsAddressFromDb = async () => {
  const customization = await Setting.findOne({
    name: "storeCustomizationSetting",
  });
  const contact = customization?.setting?.contact_us || {};
  const parts = [
    pickLang(contact.address_box_address_one),
    pickLang(contact.address_box_address_two),
    pickLang(contact.address_box_address_three),
  ].filter(Boolean);
  return parts.join(", ") || STORE_DEFAULT_ADDRESS;
};

module.exports = {
  STORE_BRAND_NAME,
  STORE_DEFAULT_ADDRESS,
  getContactUsAddressFromDb,
  getStoreCompanyName: () => STORE_BRAND_NAME,
};
