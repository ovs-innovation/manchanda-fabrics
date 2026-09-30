import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Users, Package, Award, ChevronRight } from "lucide-react";
import useTranslation from "next-translate/useTranslation";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

const CountUp = ({ end, duration = 1800, suffix = "+" }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const startTime = performance.now();

          const step = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic: 1 - (1 - progress)^3
            const easeOut = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(easeOut * end));

            if (progress < 1) {
              requestAnimationFrame(step);
            } else {
              setCount(end);
            }
          };

          requestAnimationFrame(step);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [end, duration]);

  return (
    <span ref={ref} className="inline-block tabular-nums">
      {count.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
};

const HomeBrandStats = () => {
  const { t } = useTranslation("common");

  return (
    <section className="bg-[#F8F5F1] py-10 sm:py-16 lg:py-20 border-b border-black/5">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-12 lg:px-16">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
          className="bg-white border border-black/5 rounded-[14px] p-6 sm:p-8 md:p-12 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 shadow-[0_6px_24px_rgba(0,0,0,0.02)]"
        >
          {/* Stats Area */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-10 lg:gap-16 w-full lg:w-auto text-left lg:border-r lg:border-black/5 pr-0 lg:pr-16">
            {/* Stat 1 */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#F8F5F1] flex items-center justify-center text-[#C8A45D] shrink-0">
                <Users size={20} strokeWidth={1.5} />
              </div>
              <div>
                <div
                  className="text-2xl font-bold text-[#111111] leading-tight"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  <CountUp end={10000} duration={1800} suffix="+" />
                </div>
                <div
                  className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  {t("Happy Patrons")}
                </div>
              </div>
            </div>

            {/* Stat 2 */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#F8F5F1] flex items-center justify-center text-[#C8A45D] shrink-0">
                <Package size={20} strokeWidth={1.5} />
              </div>
              <div>
                <div
                  className="text-2xl font-bold text-[#111111] leading-tight"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  <CountUp end={15000} duration={2000} suffix="+" />
                </div>
                <div
                  className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  {t("Orders Shipped")}
                </div>
              </div>
            </div>

            {/* Stat 3 */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#F8F5F1] flex items-center justify-center text-[#C8A45D] shrink-0">
                <Award size={20} strokeWidth={1.5} />
              </div>
              <div>
                <div
                  className="text-2xl font-bold text-[#111111] leading-tight"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  <CountUp end={150} duration={1500} suffix="+" />
                </div>
                <div
                  className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  {t("Artisan Partners")}
                </div>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3.5 sm:gap-4 w-full lg:w-auto sm:justify-end">
            <Link
              href="/search?category=fabrics"
              className="group inline-flex items-center justify-center gap-3 px-8 py-3.5 sm:py-4 border border-[#111111] text-[#111111] text-xs font-semibold uppercase tracking-[0.18em] transition-all duration-300 hover:bg-[#111111] hover:text-white bg-transparent"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              <span>{t("Shop Fabrics")}</span>
              <ChevronRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
            <Link
              href="/search?category=suits"
              className="group inline-flex items-center justify-center gap-3 px-8 py-3.5 sm:py-4 bg-[#111111] text-white border border-[#111111] text-xs font-semibold uppercase tracking-[0.18em] transition-all duration-300 hover:bg-transparent hover:text-[#111111]"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              <span>{t("Shop Suits")}</span>
              <ChevronRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export { CountUp };
export default HomeBrandStats;
