import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import useTranslation from "next-translate/useTranslation";
import { useRouter } from "next/router";
import { mergeHomepage } from "@utils/homepageDefaults";

const HeroBanner = ({ homepage: homepageProp }) => {
  const homepage = mergeHomepage(homepageProp);
  const { t } = useTranslation("common");
  const welcomeText = homepage.heroWelcome || t("hero_welcome_text");
  const brandText = homepage.heroBrandName || t("hero_brand_text");

  return (
    <div
      id="hero-section"
      className="relative w-full h-screen min-h-[600px] bg-[#111111] overflow-hidden flex items-center justify-center"
    >
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover object-center z-0"
        src={homepage.heroVideo || "/main1.mp4"}
      />

      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/50 via-black/35 to-black/55" />

      <div className="relative z-10 px-6 text-center text-white max-w-3xl mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-[11px] sm:text-xs font-light uppercase tracking-[0.4em] text-white/85"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          {welcomeText}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.12 }}
          className="mt-5 sm:mt-6 text-[2rem] sm:text-5xl lg:text-[3.25rem] font-normal leading-[1.2] tracking-[0.04em]"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          {brandText}
        </motion.h1>

        {homepage.heroTagline ? (
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: "easeOut", delay: 0.25 }}
            className="mt-3 sm:mt-4 text-sm sm:text-[15px] font-light tracking-[0.14em] text-white/75"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            {homepage.heroTagline}
          </motion.p>
        ) : null}

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut", delay: 0.38 }}
          className="mt-8 sm:mt-10"
        >
          <Link
            href={homepage.heroCtaLink || "/search"}
            className="inline-flex items-center justify-center min-w-[220px] px-8 py-3 border border-white/90 text-white text-[11px] sm:text-xs font-normal uppercase tracking-[0.22em] hover:bg-white hover:text-[#111111] transition-all duration-300"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            {homepage.heroCtaText || t("Explore Latest Collections")}
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default HeroBanner;
