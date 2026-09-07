import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import useTranslation from "next-translate/useTranslation";
import { mergeHomepage } from "@utils/homepageDefaults";

const HeroBanner = ({ homepage: homepageProp }) => {
  const homepage = mergeHomepage(homepageProp);
  const { t } = useTranslation("common");
  const desktopVideoRef = React.useRef(null);
  const mobileVideoRef = React.useRef(null);

  const rawWelcome = homepage.heroWelcome || t("hero_welcome_text");
  const welcomeText =
    !rawWelcome || rawWelcome.trim().toLowerCase() === "welcome"
      ? "Welcome to"
      : rawWelcome;
  const brandText = homepage.heroBrandName || t("hero_brand_text");

  const desktopVideo = homepage.heroVideo || "/main1.mp4";
  const mobileVideo = homepage.heroMobileVideo || null;

  const handleDesktopMetadata = () => {
    if (desktopVideoRef.current && desktopVideoRef.current.duration > 3) {
      desktopVideoRef.current.currentTime = 2.5;
    }
  };

  const handleDesktopTimeUpdate = () => {
    if (desktopVideoRef.current && desktopVideoRef.current.duration > 3) {
      if (
        desktopVideoRef.current.currentTime >=
        desktopVideoRef.current.duration - 0.4
      ) {
        desktopVideoRef.current.currentTime = 2.5;
      }
    }
  };

  const handleMobileMetadata = () => {
    if (mobileVideoRef.current && mobileVideoRef.current.duration > 3) {
      mobileVideoRef.current.currentTime = 2.5;
    }
  };

  const handleMobileTimeUpdate = () => {
    if (mobileVideoRef.current && mobileVideoRef.current.duration > 3) {
      if (
        mobileVideoRef.current.currentTime >=
        mobileVideoRef.current.duration - 0.4
      ) {
        mobileVideoRef.current.currentTime = 2.5;
      }
    }
  };

  return (
    <div
      id="hero-section"
      className="relative w-full h-[70vh] min-h-[450px] max-h-[650px] md:h-screen md:min-h-[600px] md:max-h-none bg-[#111111] overflow-hidden flex items-center justify-center"
    >
      {/* ── 1. DESKTOP VIDEO (Hidden on mobile, block on md+) ── */}
      <video
        ref={desktopVideoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        onLoadedMetadata={handleDesktopMetadata}
        onTimeUpdate={handleDesktopTimeUpdate}
        className="hidden md:block absolute inset-0 w-full h-full object-cover object-center z-0 pointer-events-none"
        src={desktopVideo}
      />

      {/* ── 2. MOBILE HERO VIDEO (Full zoom object-cover — no black empty space) ── */}
      <video
        ref={mobileVideoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        onLoadedMetadata={handleMobileMetadata}
        onTimeUpdate={handleMobileTimeUpdate}
        className="block md:hidden absolute inset-0 w-full h-full object-cover object-center z-0 pointer-events-none"
        src={mobileVideo || desktopVideo}
      />

      {/* ── 3. DARK OVERLAY FOR READABILITY ── */}
      <div className="absolute inset-0 z-[2] bg-gradient-to-b from-black/70 via-black/55 to-black/75 pointer-events-none" />

      {/* ── 4. CENTERED HERO CONTENT ── */}
      <div className="relative z-10 px-4 xs:px-6 text-center text-white max-w-3xl mx-auto flex flex-col items-center justify-center">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-[10px] xs:text-[11px] md:text-xs font-light uppercase tracking-[0.35em] md:tracking-[0.4em] text-white/90"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          {welcomeText}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.12 }}
          className="mt-3 xs:mt-4 md:mt-6 text-[1.75rem] xs:text-[2.1rem] sm:text-4xl md:text-5xl lg:text-[3.25rem] font-normal leading-[1.18] tracking-[0.03em] drop-shadow-md"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          {brandText}
        </motion.h1>

        {homepage.heroTagline ? (
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: "easeOut", delay: 0.25 }}
            className="mt-2.5 xs:mt-3 md:mt-4 text-[12px] xs:text-sm md:text-[15px] font-light tracking-[0.12em] md:tracking-[0.14em] text-white/80 max-w-[280px] xs:max-w-md mx-auto"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            {homepage.heroTagline}
          </motion.p>
        ) : null}

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut", delay: 0.38 }}
          className="mt-6 xs:mt-7 md:mt-10"
        >
          <Link
            href={homepage.heroCtaLink || "/search"}
            className="inline-flex items-center justify-center min-w-[200px] xs:min-w-[220px] px-6 xs:px-8 py-2.5 xs:py-3 border border-white/90 text-white text-[10px] xs:text-[11px] md:text-xs font-normal uppercase tracking-[0.2em] md:tracking-[0.22em] hover:bg-white hover:text-[#111111] transition-all duration-300 shadow-sm"
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
