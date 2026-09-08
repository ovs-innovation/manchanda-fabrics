import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FiArrowUp } from "react-icons/fi";
import { FaInstagram, FaFacebookF, FaWhatsapp, FaEnvelope } from "react-icons/fa";
import useTranslation from "next-translate/useTranslation";

import useGetSetting from "@hooks/useGetSetting";
import useUtilsFunction from "@hooks/useUtilsFunction";
import { getStoreAddress } from "@utils/storeBrand";
import { mergeHomepage } from "@utils/homepageDefaults";

const SECTION_RED = "#B0322F";

/** Show admin-entered label as-is, else translate the default key */
const labelText = (title, t) => {
  const key = String(title || "").trim();
  if (!key) return "";
  const translated = t(key);
  return translated && translated !== key ? translated : key;
};

const formatPhone = (raw) => {
  const digits = String(raw || "").replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) {
    return `+91-${digits.slice(2, 7)}${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `+91-${digits}`;
  }
  return raw;
};

const Footer = () => {
  const { showingTranslateValue } = useUtilsFunction();
  const { storeCustomizationSetting, globalSetting } = useGetSetting();
  const { t } = useTranslation("common");

  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const homepage = mergeHomepage(storeCustomizationSetting?.manchandaHomepage);
  const footer = homepage.footer || {};

  const storeAddress =
    footer.address?.trim() ||
    getStoreAddress({ storeCustomizationSetting, globalSetting, showingTranslateValue });

  const storeEmail =
    footer.email?.trim() ||
    showingTranslateValue(storeCustomizationSetting?.contact_us?.email_box_email) ||
    globalSetting?.email ||
    "manchandafabrics@gmail.com";

  const storePhone =
    showingTranslateValue(storeCustomizationSetting?.contact_us?.call_box_phone) ||
    globalSetting?.contact ||
    "";

  const footerPhones =
    Array.isArray(footer.phones) && footer.phones.length > 0
      ? footer.phones
      : homepage.whatsappNumbers || [];

  const primaryPhoneRaw =
    (footer.phones?.length ? footer.phones[0] : footerPhones[0]) || storePhone;

  const phoneList = [formatPhone(primaryPhoneRaw)]
    .filter(Boolean)
    .filter((v, i, arr) => arr.indexOf(v) === i);

  const collectionLinks = footer.collectionLinks || [];
  const rawQuickLinks = footer.quickLinks || [];
  let quickLinks = [...rawQuickLinks].filter(
    (l) =>
      l.href !== "/user/track-order" &&
      l.href !== "/refund-return-policy" &&
      l.href !== "/privacy-policy"
  );
  if (!quickLinks.some((l) => l.href === "/user/my-orders")) {
    quickLinks.unshift({ title: "My Orders", href: "/user/my-orders" });
  }
  if (!quickLinks.some((l) => l.href === "/about-us")) {
    quickLinks.unshift({ title: "About Us", href: "/about-us" });
  }
  const specialCollection = footer.specialCollection || [];
  const storeHours = footer.hours?.trim() || "";
  const brandStory = footer.brandStory || "";
  const instagramUrl = footer.instagram || "";
  const facebookUrl = footer.facebook || "";
  const whatsappNumber = String(footer.whatsapp || "").replace(/\D/g, "");
  const copyrightName = footer.copyrightName || "VastoraTech";
  const copyrightUrl = footer.copyrightUrl || "https://vastoratech.com/";

  const socialIconClass =
    "inline-flex w-9 h-9 rounded-full border border-neutral-300 bg-white/90 items-center justify-center text-neutral-600 hover:text-[#B0322F] hover:border-[#B0322F] transition-colors";

  const socialLinks = [
    instagramUrl && { key: "ig", href: instagramUrl, label: "Instagram", Icon: FaInstagram },
    facebookUrl && { key: "fb", href: facebookUrl, label: "Facebook", Icon: FaFacebookF },
    whatsappNumber && {
      key: "wa",
      href: `https://wa.me/${whatsappNumber}`,
      label: "WhatsApp",
      Icon: FaWhatsapp,
    },
    storeEmail && {
      key: "mail",
      href: `mailto:${storeEmail}`,
      label: "Email",
      Icon: FaEnvelope,
      external: false,
    },
  ].filter(Boolean);

  const SectionTitle = ({ children }) => (
    <h4
      className="text-[12px] font-bold tracking-[0.22em] uppercase mb-5"
      style={{ color: SECTION_RED, fontFamily: "'Poppins', sans-serif" }}
    >
      {children}
    </h4>
  );

  const linkClass =
    "text-[13px] text-[#4a4a4a] hover:text-[#111111] transition-colors leading-relaxed";

  return (
    <footer
      className="relative bg-white"
      style={{
        backgroundImage: "url('/footer-chandni-chowk-sepia.webp')",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center top",
        backgroundSize: "cover",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      {/* soft wash so text stays readable over the sketch */}
      <div className="absolute inset-0 bg-white/80 pointer-events-none" />

      <div className="relative z-10 max-w-screen-2xl mx-auto px-6 sm:px-10 lg:px-14">
        {/* Brand heading */}
        <div className="pt-12 pb-2 text-center border-b border-[#00000010] pb-8">
          <h2
            className="text-2xl sm:text-3xl font-semibold tracking-[0.14em] uppercase"
            style={{ color: SECTION_RED, fontFamily: "'Poppins', sans-serif" }}
          >
            {t("Manchanda Fabrics")}
          </h2>
        </div>

        {/* Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-x-8 gap-y-10 pt-10">
          <div className="lg:col-span-3">
            <SectionTitle>{t("MANCHANDA FAB")}</SectionTitle>
            <div className="space-y-2">
              {phoneList.map((phone) => (
                <p key={phone} className={`${linkClass} flex items-center gap-2`}>
                  <span style={{ color: SECTION_RED }}>✆</span>
                  <a href={`tel:${phone.replace(/\s/g, "")}`}>{phone}</a>
                </p>
              ))}
              <p className={`${linkClass} flex items-center gap-2`}>
                <span style={{ color: SECTION_RED }}>✉</span>
                <a href={`mailto:${storeEmail}`} className="break-all">
                  {storeEmail}
                </a>
              </p>
              <p className="text-[13px] text-[#4a4a4a] leading-relaxed pt-2 flex gap-2 max-w-xs">
                <span style={{ color: SECTION_RED }}>⚲</span>
                <span>{labelText(storeAddress, t)}</span>
              </p>
              {storeHours && (
                <p className="text-[13px] text-[#4a4a4a] leading-relaxed flex gap-2 max-w-xs">
                  <span style={{ color: SECTION_RED }}>◷</span>
                  <span>{labelText(storeHours, t)}</span>
                </p>
              )}
              <p className="text-[13px] text-[#4a4a4a] leading-relaxed flex items-center gap-2 pt-1">
                <span style={{ color: SECTION_RED }} className="shrink-0 flex items-center">
                  <FaInstagram size={15} />
                </span>
                <span>
                  <span className="font-semibold text-[#111111]">{t("Follow Us")}:</span>{" "}
                  <a
                    href="https://www.instagram.com/manchandafabrics"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-[#B0322F] underline-offset-2 hover:underline transition-colors"
                  >
                    @manchandafabrics
                  </a>
                </span>
              </p>
            </div>
          </div>

          <div className="lg:col-span-2">
            <SectionTitle>{t("Quick Links")}</SectionTitle>
            <ul className="space-y-2.5">
              {quickLinks.map((l, i) => (
                <li key={`${l.href}-${i}`}>
                  <Link href={l.href || "#"} className={linkClass}>
                    {labelText(l.title, t)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <SectionTitle>{t("Collection")}</SectionTitle>
            <ul className="space-y-2.5">
              {collectionLinks.map((l, i) => (
                <li key={`${l.href}-${i}`}>
                  <Link
                    href={l.href || "#"}
                    className={`${linkClass} uppercase text-[12px] tracking-wide`}
                  >
                    {labelText(l.title, t)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <SectionTitle>{t("Special Collection")}</SectionTitle>
            <ul className="space-y-2.5">
              {specialCollection.map((l, i) => (
                <li key={`${l.href}-${i}`}>
                  <Link
                    href={l.href || "#"}
                    className={`${linkClass} uppercase text-[12px] tracking-wide`}
                  >
                    {labelText(l.title, t)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <SectionTitle>{t("Manchanda Fabrics")}</SectionTitle>
            <p className="text-[13px] text-[#4a4a4a] leading-[1.8] max-w-sm">
              {labelText(brandStory, t)}
            </p>
            <div className="mt-4 flex items-center gap-3">
              {socialLinks.map(({ key, href, label, Icon, external = true }) => (
                <a
                  key={key}
                  href={href}
                  {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
                  className={socialIconClass}
                  aria-label={label}
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 py-5 border-t border-[#00000012] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#6a6a6a]">
          <p>
            {t("Copyright")} © {new Date().getFullYear()}{" "}
            <a
              href={copyrightUrl}
              target="_blank"
              rel="noreferrer"
              className="font-semibold hover:underline"
              style={{ color: SECTION_RED }}
            >
              {copyrightName}
            </a>
            . {t("All rights reserved.")}
          </p>
          <div className="flex items-center gap-3 uppercase tracking-[0.2em] text-[10px] font-medium text-[#8a8a8a]">
            <span>{t("AMEX")}</span>
            <span>{t("MC")}</span>
            <span>{t("Visa")}</span>
            <span>{t("RuPay")}</span>
          </div>
        </div>
      </div>

      {showBackToTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 lg:bottom-8 lg:right-24 z-40 w-10 h-10 rounded-full bg-white border border-neutral-200 shadow-sm flex items-center justify-center text-[#B0322F] hover:bg-[#B0322F] hover:text-white hover:border-[#B0322F] transition-all"
          aria-label={t("Back to top")}
        >
          <FiArrowUp size={16} />
        </button>
      )}
    </footer>
  );
};

export default Footer;
