import { useRouter } from "next/router";
import dayjs from "dayjs";
import useGetSetting from "./useGetSetting";

export const formatPrice = (value = 0) => {
  const num = Math.max(0, parseFloat(value) || 0);
  return num.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: num % 1 === 0 ? 0 : 2,
  });
};

const useUtilsFunction = () => {
  const router = useRouter();
  const lang = router?.locale || "en";

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
    const val = data !== undefined && Object?.keys(data).includes(lang) ? data[lang] : undefined;
    return val && String(val).trim() !== "" ? val : (data?.en || "");
  };

  const showingImage = (data) => {
    return data !== undefined && data;
  };

  const showingUrl = (data) => {
    return data !== undefined ? data : "!#";
  };

  return {
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
