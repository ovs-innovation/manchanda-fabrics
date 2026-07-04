import React from "react";
import { motion } from "framer-motion";
import useTranslation from "next-translate/useTranslation";

const LuxuryFeatures = () => {
  const { t } = useTranslation("common");

  const FEATURES = [
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.4} stroke="currentColor" className="w-10 h-10">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          <rect x="3" y="3" width="18" height="18" rx="2" strokeLinecap="round" />
        </svg>
      ),
      title: t("No Return & Exchange"),
      desc: t("All sales are final. Please review size & fabric details carefully before ordering."),
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.4} stroke="currentColor" className="w-10 h-10">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M3 12h18M3 17h18" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 3l4 4-4 4" />
        </svg>
      ),
      title: t("Free Shipping"),
      desc: t("Complimentary pan-India shipping on all orders. Insured delivery to your doorstep."),
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.4} stroke="currentColor" className="w-10 h-10">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
      title: t("Secure Payment"),
      desc: t("100% encrypted & secure checkout. Pay via UPI, card, net banking or WhatsApp."),
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.4} stroke="currentColor" className="w-10 h-10">
          <path strokeLinecap="round" strokeLinejoin="round" d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 012.12 1.18 2 2 0 014.11 1h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 8.91A16 16 0 0015.91 16.7l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
        </svg>
      ),
      title: t("24/7 Support"),
      desc: t("Our dedicated team is available via WhatsApp for personalized styling assistance."),
    },
  ];

  return (
    <section className="py-12 sm:py-16 bg-white border-y border-[#C8A45D]/15">
      <div className="max-w-screen-xl mx-auto px-6 sm:px-12 lg:px-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 divide-x divide-[#C8A45D]/15">
          {FEATURES.map((f, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="flex flex-col items-center text-center px-6 py-8 sm:py-10 group"
            >
              {/* Icon */}
              <div className="text-[#C8A45D] mb-5 transition-transform duration-300 group-hover:scale-110">
                {f.icon}
              </div>
              {/* Title */}
              <h3
                className="text-sm sm:text-base font-bold uppercase tracking-[0.18em] text-[#111111] mb-3"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                {f.title}
              </h3>
              {/* Desc */}
              <p
                className="text-xs sm:text-sm md:text-[15px] text-[#555555] leading-relaxed font-light hidden sm:block max-w-[280px]"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LuxuryFeatures;
