import React from "react";
import Link from "next/link";
import Layout from "@layout/Layout";
import useGetSetting from "@hooks/useGetSetting";
import useUtilsFunction from "@hooks/useUtilsFunction";
import useTranslation from "next-translate/useTranslation";
import {
  FiPhone,
  FiMail,
  FiMapPin,
  FiClock,
  FiSend,
  FiUser,
} from "react-icons/fi";
import { FaWhatsapp, FaInstagram, FaFacebookF, FaUsers } from "react-icons/fa";

import {
  getStoreAddress,
  STORE_DEFAULT_ADDRESS,
  sanitizeAddress,
} from "@utils/storeBrand";
import { mergeHomepage } from "@utils/homepageDefaults";

const MAPS_URL =
  "https://maps.app.goo.gl/PQHMD4iJ1gzAhuLR6";

const getWhatsAppChatUrl = (raw, message = "Hello Manchanda Fabrics! I have a query.") => {
  if (!raw) return null;
  const value = String(raw).trim();
  if (!value) return null;
  if (value.startsWith("http")) return value;
  const digits = value.replace(/\D/g, "");
  if (!digits) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
};

const parseTimeToMinutes = (timeStr) => {
  if (!timeStr) return null;
  const match = timeStr.trim().match(/^(\d+)(?::(\d+))?\s*(AM|PM)$/i);
  if (!match) return null;
  let hours = parseInt(match[1], 10);
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const ampm = match[3].toUpperCase();

  if (ampm === "PM" && hours < 12) {
    hours += 12;
  } else if (ampm === "AM" && hours === 12) {
    hours = 0;
  }
  return hours * 60 + minutes;
};

const isWithinBusinessHours = (businessHoursStr) => {
  try {
    if (!businessHoursStr) return false;
    const parts = businessHoursStr.split(/[–-]/);
    if (parts.length !== 2) return false;

    const startMinutes = parseTimeToMinutes(parts[0]);
    const endMinutes = parseTimeToMinutes(parts[1]);

    if (startMinutes === null || endMinutes === null) return false;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    if (startMinutes <= endMinutes) {
      return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
    } else {
      return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
    }
  } catch (error) {
    console.error("Error parsing business hours:", error);
    return false;
  }
};

export default function ContactUs() {
  const { t } = useTranslation("common");
  const { globalSetting, storeCustomizationSetting } = useGetSetting();
  const { showingTranslateValue } = useUtilsFunction();
  const contact = storeCustomizationSetting?.contact_us || {};
  const footer = storeCustomizationSetting?.footer || {};
  const homepage = mergeHomepage(storeCustomizationSetting?.manchandaHomepage);
  const vs = homepage.videoShopping || {};

  const [inBusinessHours, setInBusinessHours] = React.useState(true);

  React.useEffect(() => {
    setInBusinessHours(isWithinBusinessHours(vs.businessHours || "11:30 AM – 8:00 PM"));
    const interval = setInterval(() => {
      setInBusinessHours(isWithinBusinessHours(vs.businessHours || "11:30 AM – 8:00 PM"));
    }, 60000);
    return () => clearInterval(interval);
  }, [vs.businessHours]);

  const phone =
    showingTranslateValue(contact?.call_box_phone) ||
    globalSetting?.contact ||
    "+91 98765 43210";
  const email =
    showingTranslateValue(contact?.email_box_email) ||
    globalSetting?.email ||
    "manchandafabrics@gmail.com";
  const address = sanitizeAddress(
    [
      showingTranslateValue(contact?.address_box_address_one),
      showingTranslateValue(contact?.address_box_address_two),
      showingTranslateValue(contact?.address_box_address_three),
    ]
      .filter(Boolean)
      .join(", ") ||
    getStoreAddress({ storeCustomizationSetting, globalSetting, showingTranslateValue }) ||
    STORE_DEFAULT_ADDRESS
  );

  const whatsappChatUrl =
    getWhatsAppChatUrl(footer?.social_whatsapp) ||
    getWhatsAppChatUrl(phone);

  const videoShoppingWhatsappUrl = (() => {
    const rawNum = vs.whatsapp || footer?.social_whatsapp || phone;
    if (!rawNum) return null;
    const digits = String(rawNum).replace(/\D/g, "");
    if (!digits) return null;
    return `https://wa.me/${digits}?text=${encodeURIComponent("Hello, I would like to schedule a live video shopping session.")}`;
  })();

  const whatsappGroupLink = (contact?.whatsapp_group_link || "").trim();
  const whatsappGroupTitle =
    showingTranslateValue(contact?.whatsapp_group_title) || "Join Our WhatsApp Group";
  const whatsappGroupText =
    showingTranslateValue(contact?.whatsapp_group_text) ||
    "Get new arrivals, offers and updates directly on WhatsApp.";

  const CONTACT_INFO = [
    {
      icon: <FiUser className="text-2xl" />,
      title: t("Contact Person"),
      value: t("Pradeep Kumar Manchanda"),
      sub: t("Founder & Proprietor"),
      href: null,
      breakAll: false,
    },
    {
      icon: <FiPhone className="text-2xl" />,
      title: showingTranslateValue(contact?.call_box_title) || t("Call / WhatsApp"),
      value: phone,
      sub: showingTranslateValue(contact?.call_box_text) || t("Call / WhatsApp Us"),
      href: `tel:${phone.replace(/\s/g, "")}`,
      breakAll: false,
    },
    {
      icon: <FiMail className="text-2xl" />,
      title: showingTranslateValue(contact?.email_box_title) || t("Email Us"),
      value: email,
      sub: t("We reply within 24 hours"),
      href: `mailto:${email.trim()}`,
      breakAll: true,
    },
    {
      icon: <FiMapPin className="text-2xl" />,
      title: showingTranslateValue(contact?.address_box_title) || t("Visit Us"),
      value: address,
      sub: t("Tap for Google Maps directions"),
      href: MAPS_URL,
      breakAll: false,
    },
    {
      icon: <FiClock className="text-2xl" />,
      title: t("Store Hours"),
      value: t("Mon – Sat: 11 AM – 8 PM"),
      sub: t("Sunday: Closed"),
      href: null,
      breakAll: false,
    },
  ];
  const [formState, setFormState] = React.useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = React.useState(false);

  const handleChange = (e) => {
    setFormState((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <Layout title={`${t("contact-page-title")} – Manchanda Fabrics`} description="Reach out to Manchanda Fabrics for queries about sarees, suits, fabrics, orders and more.">
      {/* Hero Banner */}
      <section
        className="relative w-full py-32 md:py-48 flex items-center justify-center overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #3B2A25 0%, #6F4A3D 50%, #9C6A5A 100%)",
        }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 25% 50%, #fff 1px, transparent 1px), radial-gradient(circle at 75% 50%, #fff 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative text-center px-6">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#E6D1CB] mb-5" style={{ fontFamily: "'Poppins', sans-serif" }}>
            {t("Get In Touch")}
          </p>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-light text-white mb-6" style={{ fontFamily: "'Poppins', sans-serif" }}>
            {t("contact-page-title")}
          </h1>
          <div className="h-[2px] w-16 bg-[#E6D1CB] mx-auto mb-7" />
          <p className="text-white/75 text-base lg:text-lg max-w-2xl mx-auto leading-relaxed font-light mb-5" style={{ fontFamily: "'Poppins', sans-serif" }}>
            {t("Have a question about our sarees, suits, or fabrics? We're here to help you find your perfect ethnic ensemble.")}
          </p>
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-sm font-medium tracking-wide" style={{ fontFamily: "'Poppins', sans-serif" }}>
            <span>{t("Contact Person")}:</span>
            <span className="font-semibold text-white">{t("Pradeep Kumar Manchanda")}</span>
          </div>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="py-28 lg:py-36 bg-[#FAF7F5]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 lg:gap-8">
          {CONTACT_INFO.map((info, i) => {
            const card = (
              <div className="flex flex-col items-center text-center px-4 py-8 lg:px-5 lg:py-10 bg-white border border-[#E6D1CB] rounded-2xl shadow-sm group hover:border-[#9C6A5A]/60 hover:shadow-lg hover:-translate-y-1 transform duration-300 h-full w-full" style={{ fontFamily: "'Poppins', sans-serif" }}>
                <div className="w-16 h-16 rounded-full bg-[#FAF7F5] border border-[#E6D1CB] flex items-center justify-center text-[#9C6A5A] mb-4 group-hover:bg-[#9C6A5A] group-hover:text-white transition-all duration-300">
                  {info.icon}
                </div>
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#9C6A5A] mb-1.5">{info.title}</h3>
                <p className={`text-sm sm:text-base font-semibold text-[#3B2A25] leading-snug max-w-full px-1 ${info.breakAll ? "break-all [overflow-wrap:anywhere]" : "break-words [word-break:normal]"}`}>{info.value}</p>
                <p className="text-xs text-[#3B2A25]/55 mt-1.5">{info.sub}</p>
              </div>
            );
            return info.href ? (
              <a key={i} href={info.href} target="_blank" rel="noopener noreferrer" className="block">
                {card}
              </a>
            ) : (
              <div key={i}>{card}</div>
            );
          })}
        </div>
      </section>

      {/* Form + Right Panel */}
      <section className="py-28 lg:py-36 bg-white border-t border-[#E6D1CB]/60">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-5 gap-12">

          {/* Contact Form */}
          <div className="lg:col-span-3 font-sans" style={{ fontFamily: "'Poppins', sans-serif" }}>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#9C6A5A] mb-3">{t("Send Message")}</p>
            <h2 className="text-3xl md:text-5xl font-serif font-light text-[#3B2A25] mb-3" style={{ fontFamily: "'Poppins', sans-serif" }}>
              {t("contact-page-form-title")}
            </h2>
            <div className="h-[2px] w-10 bg-[#9C6A5A] mb-10" />

            {submitted ? (
              <div className="flex flex-col items-center justify-center py-16 text-center bg-[#FAF7F5] rounded-2xl border border-[#E6D1CB]">
                <div className="w-16 h-16 bg-[#9C6A5A] rounded-full flex items-center justify-center mb-5">
                  <FiSend className="text-white text-2xl" />
                </div>
                <h3 className="text-xl font-serif text-[#3B2A25] mb-2">{t("thankyou")}</h3>
                <p className="text-sm text-[#3B2A25]/65 max-w-xs">
                  {t("Thank you for reaching out. Our team will get back to you within 24 hours.")}
                </p>
                <button
                  className="mt-6 text-xs font-bold uppercase tracking-widest text-[#9C6A5A] hover:text-[#6F4A3D] transition-colors"
                  onClick={() => { setSubmitted(false); setFormState({ name: "", email: "", phone: "", subject: "", message: "" }); }}
                >
                  {t("Send Another")} →
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#3B2A25]/70 mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>{t("contact-page-form-input-name")} *</label>
                    <input type="text" name="name" required value={formState.name} onChange={handleChange} placeholder={t("contact-page-form-plaholder-name")}
                      className="w-full px-6 py-5 h-[64px] text-[18px] placeholder:text-[17px] border border-[#E6D1CB] rounded-xl bg-[#FAF7F5] text-[#3B2A25] placeholder-[#3B2A25]/30 focus:outline-none focus:border-[#9C6A5A] focus:ring-2 focus:ring-[#9C6A5A]/15 transition-all" style={{ fontFamily: "'Poppins', sans-serif" }} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#3B2A25]/70 mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>{t("phoneNumber")}</label>
                    <input type="tel" name="phone" value={formState.phone} onChange={handleChange} placeholder="+91 XXXXX XXXXX"
                      className="w-full px-6 py-5 h-[64px] text-[18px] placeholder:text-[17px] border border-[#E6D1CB] rounded-xl bg-[#FAF7F5] text-[#3B2A25] placeholder-[#3B2A25]/30 focus:outline-none focus:border-[#9C6A5A] focus:ring-2 focus:ring-[#9C6A5A]/15 transition-all" style={{ fontFamily: "'Poppins', sans-serif" }} />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#3B2A25]/70 mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>{t("emailAddress")} *</label>
                  <input type="email" name="email" required value={formState.email} onChange={handleChange} placeholder={t("contact-page-form-plaholder-email")}
                    className="w-full px-6 py-5 h-[64px] text-[18px] placeholder:text-[17px] border border-[#E6D1CB] rounded-xl bg-[#FAF7F5] text-[#3B2A25] placeholder-[#3B2A25]/30 focus:outline-none focus:border-[#9C6A5A] focus:ring-2 focus:ring-[#9C6A5A]/15 transition-all" style={{ fontFamily: "'Poppins', sans-serif" }} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#3B2A25]/70 mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>{t("contact-page-form-input-subject")}</label>
                  <select name="subject" value={formState.subject} onChange={handleChange}
                    className="w-full px-6 py-5 h-[64px] text-[18px] border border-[#E6D1CB] rounded-xl bg-[#FAF7F5] text-[#3B2A25] focus:outline-none focus:border-[#9C6A5A] focus:ring-2 focus:ring-[#9C6A5A]/15 transition-all" style={{ fontFamily: "'Poppins', sans-serif" }}>
                    <option value="">{t("Select a topic…")}</option>
                    <option value="order">{t("Order Query")}</option>
                    <option value="suit">{t("Suit Enquiry")}</option>
                    <option value="fabric">{t("Fabric / Bulk Order")}</option>
                    <option value="return">{t("Return / Exchange")}</option>
                    <option value="other">{t("Other")}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#3B2A25]/70 mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>{t("contact-page-form-input-message")} *</label>
                  <textarea name="message" required rows={5} value={formState.message} onChange={handleChange} placeholder={t("contact-page-form-plaholder-message")}
                    className="w-full px-6 py-5 h-[220px] text-[18px] placeholder:text-[17px] border border-[#E6D1CB] rounded-xl bg-[#FAF7F5] text-[#3B2A25] placeholder-[#3B2A25]/30 focus:outline-none focus:border-[#9C6A5A] focus:ring-2 focus:ring-[#9C6A5A]/15 transition-all resize-none" style={{ fontFamily: "'Poppins', sans-serif" }} />
                </div>
                <button type="submit"
                  className="w-full h-[64px] flex items-center justify-center gap-3 bg-[#9C6A5A] hover:bg-[#6F4A3D] text-white text-base font-bold uppercase tracking-[0.15em] rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-98 transform"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  <FiSend className="text-lg" />
                  {t("contact-page-form-send-btn")}
                </button>
              </form>
            )}

            {/* Live Google Map Embed inside the form column to fill empty space */}
            <div className="mt-12 h-[380px] rounded-[20px] overflow-hidden border border-[#E6D1CB] shadow-md relative">
              <iframe
                src="https://maps.google.com/maps?q=28.657076,77.226211&t=&z=17&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 w-full h-full"
              />
            </div>
          </div>

          {/* Right Panel */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            {/* WhatsApp Chat */}
            <div className="rounded-2xl bg-[#25D366] p-10 lg:p-12 text-white flex flex-col gap-5" style={{ fontFamily: "'Poppins', sans-serif" }}>
              <div className="flex items-center gap-4">
                <FaWhatsapp className="text-4xl lg:text-5xl" />
                <div>
                  <h3 className="font-bold text-base md:text-lg uppercase tracking-widest">{t("Chat on WhatsApp")}</h3>
                  <p className="text-white/80 text-sm">{t("Fastest response — within minutes!")}</p>
                </div>
              </div>
              <p className="text-base leading-relaxed text-white/90">
                {t("For quick suit queries, styling advice, or order tracking — message us directly on WhatsApp.")}
              </p>
              {whatsappChatUrl ? (
                <a
                  href={whatsappChatUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-white text-[#25D366] font-bold text-sm uppercase tracking-wider px-8 py-4 rounded-xl hover:bg-[#f0fdf4] transition-all hover:scale-102 active:scale-98 duration-200 shadow-md w-fit"
                >
                  <FaWhatsapp />
                  {t("Open WhatsApp")}
                </a>
              ) : (
                <p className="text-sm text-white/80">{t("WhatsApp number coming soon.")}</p>
              )}
            </div>

            {/* Live Video Shopping Card */}
            {vs.enabled !== false && (
              <div className="rounded-2xl border border-[#E6D1CB] bg-[#FAF7F5] p-10 lg:p-12 flex flex-col gap-5" style={{ fontFamily: "'Poppins', sans-serif" }}>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-[#B0322F]/10 flex items-center justify-center text-[#B0322F] shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72V10.5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-base md:text-lg uppercase tracking-widest text-[#3B2A25]">
                      {vs.title ? t(vs.title) : t("Live Video Shopping")}
                    </h3>
                    <p className="text-[#3B2A25]/55 text-sm">
                      {t("Business Hours")}: {vs.businessHours || "11:30 AM – 8:00 PM"}
                    </p>
                  </div>
                </div>
                {inBusinessHours ? (
                  <>
                    <p className="text-base leading-relaxed text-[#3B2A25]/75">
                      {vs.subtitle ? t(vs.subtitle) : t("Shop with us through a live video call.")}
                    </p>
                    {videoShoppingWhatsappUrl ? (
                      <a
                        href={videoShoppingWhatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 bg-[#B0322F] text-white font-bold text-sm uppercase tracking-wider px-8 py-4 rounded-xl hover:bg-[#912826] transition-all hover:scale-102 active:scale-98 duration-200 shadow-md w-fit"
                      >
                        <FaWhatsapp className="text-lg" />
                        {vs.buttonText ? t(vs.buttonText) : t("Start Video Shopping")}
                      </a>
                    ) : (
                      <p className="text-sm text-[#3B2A25]/55">{t("WhatsApp number coming soon.")}</p>
                    )}
                  </>
                ) : (
                  <>
                    <p className="text-base leading-relaxed text-[#3B2A25]/75">
                      {t("Live Video Shopping is available from")} {vs.businessHours || "11:30 AM to 8:00 PM"}. {t("Please leave us a message on WhatsApp and our team will contact you during business hours.")}
                    </p>
                    {videoShoppingWhatsappUrl ? (
                      <a
                        href={videoShoppingWhatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 bg-[#B0322F] text-white font-bold text-sm uppercase tracking-wider px-8 py-4 rounded-xl hover:bg-[#912826] transition-all hover:scale-102 active:scale-98 duration-200 shadow-md w-fit"
                      >
                        <FaWhatsapp className="text-lg" />
                        {t("Send WhatsApp Message")}
                      </a>
                    ) : (
                      <p className="text-sm text-[#3B2A25]/55">{t("WhatsApp number coming soon.")}</p>
                    )}
                  </>
                )}
              </div>
            )}

            {/* WhatsApp Group — admin updated link */}
            {whatsappGroupLink && (
              <div className="rounded-2xl border-2 border-[#25D366]/30 bg-[#FAF7F5] p-10 lg:p-12 flex flex-col gap-5" style={{ fontFamily: "'Poppins', sans-serif" }}>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-[#25D366] flex items-center justify-center text-white shrink-0">
                    <FaUsers className="text-2xl" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base md:text-lg uppercase tracking-widest text-[#3B2A25]">
                      {whatsappGroupTitle}
                    </h3>
                    <p className="text-[#3B2A25]/55 text-sm">{t("Community updates & offers")}</p>
                  </div>
                </div>
                <p className="text-base leading-relaxed text-[#3B2A25]/75">{whatsappGroupText}</p>
                <a
                  href={whatsappGroupLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#25D366] text-white font-bold text-sm uppercase tracking-wider px-8 py-4 rounded-xl hover:bg-[#128C7E] transition-all hover:scale-102 active:scale-98 duration-200 shadow-md w-fit"
                >
                  <FaWhatsapp />
                  {t("Join WhatsApp Group")}
                </a>
              </div>
            )}

            {/* Social Links */}
            <div className="rounded-2xl border border-[#E6D1CB] bg-[#FAF7F5] p-10 lg:p-12" style={{ fontFamily: "'Poppins', sans-serif" }}>
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#9C6A5A] mb-6">{t("Follow Us")}</h3>
              <div className="flex flex-col gap-4">
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 bg-white border border-[#E6D1CB] rounded-xl hover:border-[#9C6A5A]/50 hover:shadow-md transition-all group">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0">
                    <FaInstagram className="text-white text-lg" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#3B2A25] group-hover:text-[#9C6A5A] transition-colors">@manchandafabrics</p>
                    <p className="text-xs text-[#3B2A25]/50 mt-0.5">{t("Daily ethnic inspirations")}</p>
                  </div>
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 bg-white border border-[#E6D1CB] rounded-xl hover:border-[#9C6A5A]/50 hover:shadow-md transition-all group">
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                    <FaFacebookF className="text-white text-lg" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#3B2A25] group-hover:text-[#9C6A5A] transition-colors">Manchanda Fabrics</p>
                    <p className="text-xs text-[#3B2A25]/50 mt-0.5">{t("New arrivals & festive collections")}</p>
                  </div>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="rounded-2xl border border-[#E6D1CB] bg-white p-10 lg:p-12" style={{ fontFamily: "'Poppins', sans-serif" }}>
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#9C6A5A] mb-6">{t("Quick Help")}</h3>
              <div className="flex flex-col gap-3">
                {[
                  { label: t("Track My Order"), href: "/user/dashboard" },
                  { label: t("Browse Sarees"), href: "/search?category=sarees" },
                  { label: t("Designer Suits"), href: "/search?category=suits" },
                  { label: t("Return Policy"), href: "/about-us" },
                ].map((link) => (
                  <Link key={link.label} href={link.href}
                    className="flex items-center justify-between text-sm font-semibold text-[#3B2A25] hover:text-[#9C6A5A] transition-colors py-3 border-b border-[#E6D1CB]/60 last:border-0">
                    <span>{link.label}</span>
                    <span className="text-[#9C6A5A] text-lg font-bold">→</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

    </Layout>
  );
}
