import React from "react";
import { motion } from "framer-motion";
import useTranslation from "next-translate/useTranslation";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: "easeOut", delay },
  }),
};

const FounderStory = () => {
  const { t } = useTranslation("common");
  return (
    <section className="py-24 sm:py-32 bg-[#F9F6F1]">
      <div className="max-w-screen-xl mx-auto px-6 sm:px-12 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          {/* ── LEFT: Photo Stack ── */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
            custom={0}
            className="relative"
          >
            {/* Large primary photo */}
            <div className="relative aspect-[4/5] overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=720&q=80"
                alt="Founder — Manchanda Fabrics"
                className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-105"
                loading="lazy"
              />
              {/* Gold frame accent */}
              <div className="absolute inset-0 border border-[#C8A45D]/20 pointer-events-none" />
            </div>

            {/* Overlapping boutique image — bottom right */}
            <div className="absolute -bottom-8 -right-6 sm:-right-10 w-[42%] aspect-[3/4] overflow-hidden shadow-xl border-4 border-white">
              <img
                src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400&q=80"
                alt="Manchanda Fabrics Boutique"
                className="w-full h-full object-cover object-center"
                loading="lazy"
              />
            </div>

            {/* Gold line accent */}
            <div className="absolute -top-6 -left-4 sm:-left-8 w-[2px] h-24 bg-gradient-to-b from-[#C8A45D] to-transparent hidden sm:block" />
          </motion.div>

          {/* ── RIGHT: Text ── */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
            custom={0.2}
            className="flex flex-col justify-center space-y-8 lg:pl-4 mt-10 lg:mt-0"
          >
            {/* Eyebrow */}
            <span
              className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#C8A45D] flex items-center gap-3"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              <span className="w-8 h-[1px] bg-[#C8A45D]" />
              {t("Our Heritage")}
            </span>

            {/* Heading */}
            <h2
              className="text-4xl sm:text-5xl lg:text-6xl font-light leading-[1.15] text-[#111111]"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              {t("Founder's")}
              <br />
              <em className="not-italic font-normal italic text-[#C8A45D]">{t("Message")}</em>
            </h2>

            {/* Gold divider */}
            <div className="w-14 h-[1.5px] bg-[#C8A45D]" />

            {/* Body text */}
            <div
              className="space-y-5 text-[15px] text-[#3A3A3A] leading-[1.9] font-light"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              <p>
                {t("&ldquo;When I started Manchanda Fabrics in 1995, my dream was simple — to bring the finest handloom weaves of India to every woman who values elegance and heritage. Three decades later, that vision remains our compass.&rdquo;")}
              </p>
              <p>
                {t("Every piece we curate carries the soul of its maker — the weaver who spent days perfecting the zari, the artisan whose hands shaped each motif. We believe fashion is not merely what you wear; it is the story you carry.")}
              </p>
            </div>

            {/* Signature */}
            <div className="pt-2">
              <p
                className="text-2xl text-[#111111] mb-1"
                style={{ fontFamily: "'Poppins', sans-serif", fontStyle: "italic" }}
              >
                Manchanda Fabrics
              </p>
              <p
                className="text-[11px] uppercase tracking-[0.2em] text-[#7A7A7A]"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                {t("Est. 1995 · Premium Indian Ethnic Wear")}
              </p>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default FounderStory;
