import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaWhatsapp } from "react-icons/fa";
import useGetSetting from "@hooks/useGetSetting";
import useTranslation from "next-translate/useTranslation";

const HeroBanner = () => {
  const { storeCustomizationSetting } = useGetSetting();
  const { t } = useTranslation("common");
  const whatsappNumber =
    storeCustomizationSetting?.footer?.social_whatsapp || "919240250346";

  const waLink = `https://wa.me/${whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(
    "Hello Manchanda Fabrics, I would like to place an order."
  )}`;

  return (
    <div
      id="hero-section"
      className="relative w-full h-screen min-h-[600px] bg-[#111111] overflow-hidden flex items-center"
    >
      {/* ── Background Video ── */}
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover object-center z-0 opacity-80"
      >
        <source src="/main.mp4" type="video/mp4" />
      </video>

      {/* ── Cinematic Gradient Overlay ── */}
      <div className="absolute inset-0 z-[1]"
        style={{ background: "linear-gradient(to right, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.42) 55%, rgba(0,0,0,0.15) 100%)" }}
      />
      <div className="absolute inset-0 z-[1] bg-gradient-to-t from-black/50 via-transparent to-transparent" />

      {/* ── Content ── */}
      <div className="relative z-10 max-w-screen-2xl mx-auto px-8 sm:px-14 lg:px-20 w-full text-white">
        <div className="max-w-2xl space-y-7">

          {/* Established label */}
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.35em] text-[#C8A45D]"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            <span className="w-8 h-[1px] bg-[#C8A45D]" />
            {t("Established 1995")}
            <span className="w-8 h-[1px] bg-[#C8A45D]" />
          </motion.span>

          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, ease: "easeOut", delay: 0.2 }}
            className="text-5xl sm:text-7xl lg:text-8xl font-light leading-[1.1] tracking-wide text-white"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            {t("Timeless Heritage")}
            <br />
            <em className="not-italic font-normal text-[#F5E6C8]">{t("Ethnic Luxury")}</em>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.45 }}
            className="text-[15px] sm:text-lg text-neutral-300 font-light max-w-lg leading-relaxed"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            {t("Handcrafted Banarasi Silk, Gaji Silk and premium cotton salwar suits designed for weddings, festivals and timeless celebrations.")}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.65 }}
            className="flex flex-col sm:flex-row gap-5 pt-2"
          >
            <Link
              href="/search"
              className="inline-flex items-center justify-center px-11 py-5 bg-[#C8A45D] text-white text-[15px] sm:text-[16px] font-bold uppercase tracking-[0.2em] hover:bg-[#a8833d] transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 rounded-sm"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              {t("Shop Collection")}
            </Link>

            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2.5 px-11 py-5 border border-white/60 text-white text-[15px] sm:text-[16px] font-bold uppercase tracking-[0.2em] hover:bg-white/10 hover:border-white transition-all duration-300 backdrop-blur-sm rounded-sm"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              <FaWhatsapp className="w-5 h-5 text-[#25D366]" />
              {t("WhatsApp Order")}
            </a>
          </motion.div>
        </div>
      </div>

      {/* ── Scroll Indicator ── */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50 z-10">
        <span
          className="text-[9px] uppercase tracking-[0.3em] text-white font-light"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          {t("Scroll")}
        </span>
        <div className="w-[1px] h-10 bg-white/40 relative overflow-hidden">
          <motion.div
            animate={{ y: ["-100%", "100%"] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 left-0 w-full h-1/2 bg-[#C8A45D]"
          />
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
