import { FaWhatsapp } from "react-icons/fa";
import useGetSetting from "@hooks/useGetSetting";
import useTranslation from "next-translate/useTranslation";
import { DEFAULT_HOMEPAGE } from "@utils/homepageDefaults";

const normalizeIndianNumber = (raw) => {
  const digits = String(raw || "").replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return digits;
  return null;
};

const displayPhone = (digits) =>
  `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;

const HomeWhatsAppBand = ({ whatsappNumbers: numbersProp }) => {
  const { storeCustomizationSetting } = useGetSetting();
  const { t } = useTranslation("common");

  const fromSettings = [
    storeCustomizationSetting?.footer?.social_whatsapp,
    storeCustomizationSetting?.footer?.bottom_contact,
  ]
    .map(normalizeIndianNumber)
    .filter(Boolean);

  const fromHomepage = (numbersProp || DEFAULT_HOMEPAGE.whatsappNumbers)
    .map(normalizeIndianNumber)
    .filter(Boolean);

  const numbers = [
    ...new Set(
      fromHomepage.length ? fromHomepage : fromSettings.length ? fromSettings : DEFAULT_HOMEPAGE.whatsappNumbers
    ),
  ];

  const makeLink = (digits) =>
    `https://wa.me/${digits}?text=${encodeURIComponent(
      "Hello, I would like to place an order."
    )}`;

  return (
    <section className="bg-[#1fa64a]">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-12 lg:px-16 py-10 sm:py-16 text-center">
        <h2
          className="text-2xl sm:text-4xl md:text-5xl font-semibold text-white leading-tight"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          {t("You Can also order from WhatsApp")}
        </h2>
        <p className="mt-2.5 sm:mt-3 text-xs sm:text-base text-white/90 max-w-lg mx-auto">
          {t("Message us directly and our team will help you place your order.")}
        </p>

        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-xs sm:max-w-none mx-auto">
          {numbers.map((digits) => (
            <a
              key={digits}
              href={makeLink(digits)}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-full bg-white text-[#111111] px-5 sm:pl-5 sm:pr-8 py-3.5 text-sm sm:text-[15px] font-semibold shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              <FaWhatsapp className="text-[#25D366] text-xl shrink-0" />
              <span>{displayPhone(digits)}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomeWhatsAppBand;
