import Link from "next/link";
import { useState } from "react";
import { FaInstagram } from "react-icons/fa";
import { FiMail, FiPhone, FiMapPin } from "react-icons/fi";
import useTranslation from "next-translate/useTranslation";

//internal import
import useGetSetting from "@hooks/useGetSetting";
import useUtilsFunction from "@hooks/useUtilsFunction";
import { getStoreAddress } from "@utils/storeBrand";
import NewsletterServices from "@services/NewsletterServices";
import { notifyError, notifySuccess } from "@utils/toast";

const Footer = () => {
  const { showingTranslateValue } = useUtilsFunction();
  const { storeCustomizationSetting, globalSetting } = useGetSetting();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation("common");

  const storeAddress = getStoreAddress({
    storeCustomizationSetting,
    globalSetting,
    showingTranslateValue,
  });

  const storeEmail =
    showingTranslateValue(storeCustomizationSetting?.contact_us?.email_box_email) ||
    globalSetting?.email ||
    "info@manchandafabrics.com";

  const storePhone =
    showingTranslateValue(storeCustomizationSetting?.contact_us?.call_box_phone) ||
    globalSetting?.contact ||
    "";

  const block1Links = [
    { title: "New Arrivals", href: "/new-arrivals" },
    { title: "Cotton Suits", href: "/search?category=cotton-suits" },
    { title: "Gaji Silk", href: "/search?category=gaji-silk" },
    { title: "Kanjivaram Silk", href: "/search?category=kanjivaram-silk" },
  ];

  const block2Links = [
    { title: "About Us", href: "/about-us" },
    { title: "Contact Us", href: "/contact-us" },
    { title: "Shipping & Returns", href: "/refund-return-policy" },
  ];

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return notifyError("Please enter your email.");
    setLoading(true);
    try {
      await NewsletterServices.addNewsletter({ email });
      notifySuccess("Welcome to our newsletter list!");
      setEmail("");
    } catch (err) {
      notifyError(err?.response?.data?.message || err.message || "Failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-white text-[#222222] border-t border-black/5 relative overflow-hidden font-sans">
      <div className="mx-auto max-w-screen-2xl px-6 sm:px-12 lg:px-16 relative z-10">

        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-x-8 gap-y-12 py-16">

          {/* Column 1: Brand Info (4 cols) */}
          <div className="lg:col-span-4 space-y-5 text-left">
            <Link href="/" className="inline-block" rel="noreferrer">
              <span className="tracking-[0.2em] text-2xl uppercase text-[#B08D57] font-semibold">
                MANCHANDA FABRICS
              </span>
            </Link>
            <p className="text-base text-[#666666] leading-relaxed max-w-sm font-light">
              {t("Premium ethnic fashion brand focused on salwar suits, pure silks and curated boutique fabrics. Crafting timeless heritage for celebrations and daily grace.")}
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3 pt-1">
              <a
                href="https://www.instagram.com/manchandafabrics"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full border border-neutral-200 bg-white flex items-center justify-center text-[#222222] hover:text-[#B08D57] hover:border-[#B08D57] transition-all duration-300"
              >
                <FaInstagram className="w-5 h-5" />
              </a>
              <a
                href={`mailto:${storeEmail}`}
                className="w-10 h-10 rounded-full border border-neutral-200 bg-white flex items-center justify-center text-[#222222] hover:text-[#B08D57] hover:border-[#B08D57] transition-all duration-300"
              >
                <FiMail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Column 2: Collections (2 cols) */}
          <div className="lg:col-span-2 space-y-4 text-left">
            <h4 className="text-lg font-bold uppercase tracking-[0.2em] text-[#B08D57]">
              {t("Collections")}
            </h4>
            <ul className="text-base flex flex-col space-y-4 font-light text-[#666666]">
              {block1Links.map((link, idx) => (
                <li key={idx}>
                  <Link href={link.href} className="hover:text-[#B08D57] transition-colors duration-250">
                    {t(link.title)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Customer Care (2 cols) */}
          <div className="lg:col-span-2 space-y-4 text-left">
            <h4 className="text-lg font-bold uppercase tracking-[0.2em] text-[#B08D57]">
              {t("Support & Info")}
            </h4>
            <ul className="text-base flex flex-col space-y-4 font-light text-[#666666]">
              {block2Links.map((link, idx) => (
                <li key={idx}>
                  <Link href={link.href} className="hover:text-[#B08D57] transition-colors duration-250">
                    {t(link.title)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Newsletter & Contact (4 cols) */}
          <div className="lg:col-span-4 space-y-6 text-left">
            <h4 className="text-lg font-bold uppercase tracking-[0.2em] text-[#B08D57]">
              {t("Newsletter")}
            </h4>
            <p className="text-base text-[#666666] leading-relaxed font-light">
              {t("Subscribe to get notified about our premium collections, exclusive sales, and festive arrivals.")}
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2 w-full">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("Your email address")}
                className="flex-1 px-4 py-3.5 border border-neutral-200 text-base text-[#222222] placeholder-neutral-400 focus:outline-none focus:border-[#B08D57] rounded-none bg-[#FAF8F4]"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3.5 bg-[#592523] text-white hover:bg-[#401817] text-[13px] sm:text-[14px] font-bold uppercase tracking-wider transition-all duration-300 rounded-none disabled:opacity-60"
              >
                {loading ? "..." : t("Subscribe")}
              </button>
            </form>
          </div>

        </div>

        {/* Contact & Boutique Details Strip */}
        <div className="border-t border-black/5 py-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-base text-[#666666] font-light text-left">
          {storePhone && (
            <div className="flex items-center gap-2">
              <FiPhone className="text-[#B08D57] shrink-0 w-5 h-5" />
              <span>{t("Call Us Today!")} <a href={`tel:${storePhone}`} className="hover:text-[#B08D57] font-semibold">{storePhone}</a></span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <FiMail className="text-[#B08D57] shrink-0 w-5 h-5" />
            <span>{t("email")}: <a href={`mailto:${storeEmail}`} className="hover:text-[#B08D57] font-semibold">{storeEmail}</a></span>
          </div>
          <div className="flex items-start gap-2 md:col-span-1">
            <FiMapPin className="text-[#B08D57] shrink-0 mt-0.5 w-5 h-5" />
            <span>{t("Boutique")}: {storeAddress}</span>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="flex flex-col sm:flex-row justify-between items-center py-6 border-t border-black/5 gap-4">
          <p className="text-xs md:text-sm uppercase tracking-[0.15em] text-[#666666]">
            © {new Date().getFullYear()} MANCHANDA FABRICS. {t("ALL RIGHTS RESERVED.")}
          </p>
          <p className="text-xs md:text-sm uppercase tracking-[0.2em] text-[#B08D57] tracking-widest italic">
            {t("Timeless Elegance in Every Drape")}
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
