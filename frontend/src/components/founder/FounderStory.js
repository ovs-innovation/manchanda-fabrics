import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import useTranslation from "next-translate/useTranslation";
import { DEFAULT_HOMEPAGE } from "@utils/homepageDefaults";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: "easeOut", delay },
  }),
};

const FounderStory = ({ founder: founderProp }) => {
  const { t } = useTranslation("common");
  const founder = { ...DEFAULT_HOMEPAGE.founder, ...(founderProp || {}) };

  // Filter out default Unsplash saree placeholders
  const isPlaceholderOrSaree = (url) => {
    if (!url || typeof url !== "string") return true;
    return url.includes("images.unsplash.com") || url.includes("saree");
  };

  // Use dynamic images from setting if available (and not Unsplash saree images), otherwise fall back to local premium suit images
  const mainImageSrc = "/family/family 2.jpeg";
  const secondaryImageSrc = "/family/Family_1.jpg";

  return (
    <section className="py-24 sm:py-32 bg-[#F9F6F1]">
      <div className="max-w-screen-xl mx-auto px-6 sm:px-12 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
            custom={0}
            className="relative lg:col-span-7"
          >
            <div className="relative aspect-[3/2] overflow-hidden shadow-2xl">
              <Image
                src={mainImageSrc}
                alt="Manchanda Fabrics"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-center transition-transform duration-700 hover:scale-105"
                priority
              />
              <div className="absolute inset-0 border border-[#C8A45D]/20 pointer-events-none" />
            </div>

            {secondaryImageSrc ? (
              <div className="absolute -bottom-10 -right-6 sm:-right-10 w-[35%] aspect-[3/4] overflow-hidden shadow-xl border-4 border-white">
                <Image
                  src={secondaryImageSrc}
                  alt="Manchanda Fabrics Boutique"
                  fill
                  sizes="(max-width: 1024px) 40vw, 20vw"
                  className="object-cover object-center"
                />
              </div>
            ) : null}

            <div className="absolute -top-6 -left-4 sm:-left-8 w-[2px] h-24 bg-gradient-to-b from-[#C8A45D] to-transparent hidden sm:block" />
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
            custom={0.2}
            className="lg:col-span-5 flex flex-col justify-center space-y-8 lg:pl-4 mt-10 lg:mt-0"
          >
            <span
              className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#C8A45D] flex items-center gap-3"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              <span className="w-8 h-[1px] bg-[#C8A45D]" />
              {founder.eyebrow || t("Our Heritage")}
            </span>

            <h2
              className="text-4xl sm:text-5xl lg:text-6xl font-light leading-[1.15] text-[#111111]"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              {founder.titleLine1 || t("Our")}
              <br />
              <em className="not-italic font-normal italic text-[#C8A45D]">
                {founder.titleHighlight || t("Story")}
              </em>
            </h2>

            <div className="w-14 h-[1.5px] bg-[#C8A45D]" />

            <div
              className="space-y-5 text-[15px] text-[#3A3A3A] leading-[1.9] font-light"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              {founder.paragraph1 ? <p>{founder.paragraph1}</p> : null}
              {founder.paragraph2 ? <p>{founder.paragraph2}</p> : null}
              {founder.paragraph3 ? <p>{founder.paragraph3}</p> : null}
            </div>

            <div className="pt-2">
              <p
                className="text-2xl text-[#111111] mb-1"
                style={{ fontFamily: "'Poppins', sans-serif", fontStyle: "italic" }}
              >
                {founder.signature || "Manchanda Fabrics"}
              </p>
              <p
                className="text-[11px] uppercase tracking-[0.2em] text-[#7A7A7A]"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                {founder.estLine || t("Est. 1990 · Premium Indian Ethnic Wear")}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FounderStory;
