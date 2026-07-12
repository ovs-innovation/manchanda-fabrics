import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronRight, Award, Shield, Truck, RefreshCw, Users, Package } from "lucide-react";
import useTranslation from "next-translate/useTranslation";

import Layout from "@layout/Layout";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: "easeOut", delay },
  }),
};

const AboutUs = () => {
  const { t } = useTranslation("common");

  const COLLECTIONS = [
    {
      title: "Cotton & Mul Cotton",
      desc: "Soft pastels and handblock prints crafted for everyday elegance and comfort.",
      image: "/p1.jpeg",
      slug: "cotton-suits",
    },
    {
      title: "Luxury Gaji & Silk",
      desc: "Pure silk weaves with delicate zari borders and rich celebratory embroidery.",
      image: "/p2.jpeg",
      slug: "gaji-silk",
    },
    {
      title: "Pakistani Style Suits",
      desc: "Flowing silhouettes, premium prints, and heavy handwork for festive grace.",
      image: "/p14.jpeg",
      slug: "pakistani-style-suits",
    },
    {
      title: "Bandhani & Kota Doria",
      desc: "Vibrant tie-dyes and breathable handcrafted weave sets from Rajasthan.",
      image: "/p6.jpeg",
      slug: "bandhani-suits",
    },
  ];

  return (
    <Layout title="About Us" description="Our Heritage & Story - Manchanda Fabrics">
      <div className="min-h-screen bg-[#F8F5F1] text-[#111111] overflow-x-hidden">
        
        {/* Section 1: Hero Legacy */}
        <section className="py-24 sm:py-32 bg-[#F8F5F1]">
          <div className="max-w-screen-2xl mx-auto px-6 sm:px-12 lg:px-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
              
              {/* Left Column: Text Content */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeUp}
                custom={0}
                className="flex flex-col justify-center space-y-8"
              >
                <span
                  className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#C8A45D] flex items-center gap-3"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  <span className="w-8 h-[1px] bg-[#C8A45D]" />
                  {t("ABOUT MANCHANDA FABRICS")}
                </span>

                <h1
                  className="text-4xl sm:text-5xl lg:text-[54px] xl:text-[60px] font-light leading-[1.15] text-[#111111]"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  A Legacy of <br />
                  <em className="not-italic font-normal italic text-[#C8A45D]">
                    Premium Women's Ethnic Wear
                  </em> <br />
                  Since 1990
                </h1>

                <div className="w-14 h-[1.5px] bg-[#C8A45D]" />

                <div
                  className="space-y-6 text-[15px] text-[#3A3A3A] leading-[1.9] font-light font-sans"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  <p>
                    Established in 1990 in the historical lanes of Chandni Chowk, Delhi, Manchanda Fabrics was founded on a simple vision: to bring the finest hand-selected ethnic textiles to discerning women. What started as a humble family store has matured into a cherished heritage of trust, quality, and celebration.
                  </p>
                  <p>
                    We specialize in exquisite suit sets and unstitched fabrics, ranging from breezy summer cottons to luxurious celebratory silks. Every weave in our collection is handpicked directly from artisans across India, ensuring we offer only the most genuine threads and designs.
                  </p>
                  <p>
                    Today, our family remains at the heart of everything we do. Pradeep oversees quality and sourcing directly from weavers, Shallu personally manages customer relations with absolute care, and their daughters Sanjana, Saisha, and Sanaya drive our digital journey. From our family to yours, we weave love, honesty, and heritage into every fabric we ship.
                  </p>
                </div>

                <div className="pt-4">
                  <Link
                    href="/search"
                    className="group inline-flex items-center gap-3 px-10 py-4 border border-[#111111] text-[#111111] text-[13px] sm:text-[14px] font-medium uppercase tracking-[0.18em] transition-all duration-300 hover:bg-[#111111] hover:text-white bg-transparent"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    <span>{t("Explore Collections")}</span>
                    <ChevronRight
                      size={20}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </Link>
                </div>
              </motion.div>

              {/* Right Column: Hero Image */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeUp}
                custom={0.2}
                className="relative"
              >
                <div className="relative aspect-[4/5] overflow-hidden shadow-2xl">
                  <Image
                    src="/p3.jpeg"
                    alt="Manchanda Fabrics Premium Women's Suit Collection"
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover object-top transition-transform duration-700 hover:scale-105"
                    priority
                  />
                  <div className="absolute inset-0 border border-[#C8A45D]/20 pointer-events-none" />
                </div>
                <div className="absolute -top-6 -left-4 sm:-left-8 w-[2px] h-24 bg-gradient-to-b from-[#C8A45D] to-transparent hidden sm:block" />
              </motion.div>

            </div>
          </div>
        </section>

        {/* Section 2: Family Story */}
        <section className="bg-[#3B2A25] text-[#E6D1CB] py-24 sm:py-32">
          <div className="max-w-screen-2xl mx-auto px-6 sm:px-12 lg:px-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
              
              {/* Left Side Copy */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeUp}
                custom={0}
                className="lg:col-span-5 flex flex-col justify-center space-y-8"
              >
                <span
                  className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#C8A45D] flex items-center gap-3"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  <span className="w-8 h-[1px] bg-[#C8A45D]" />
                  {t("OUR ORIGIN")}
                </span>

                <h2
                  className="text-4xl sm:text-5xl font-light leading-[1.2] text-[#FAF7F5]"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  One Family. <br />
                  <em className="not-italic font-normal italic text-[#C8A45D]">
                    One Shop. One Dream.
                  </em>
                </h2>

                <div className="w-14 h-[1.5px] bg-[#C8A45D]" />

                <div
                  className="space-y-6 text-[15px] text-[#E6D1CB]/85 leading-[1.9] font-light text-justify"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  <p>
                    Our journey started in 1990 when our father opened a small shop in the iconic market of Chandni Chowk, Delhi. Equipped with a passionate appreciation for authentic Indian fabrics and a commitment to honest pricing, we served our community face-to-face.
                  </p>
                  <p>
                    Decades later, we continue to run our operations with the same hands-on dedication. Pradeep personally handpicks and inspects the quality of every single bale, while Shallu handles orders and support with local warmth. Their three daughters—Sanjana, Saisha, and Sanaya—work together to bring our collections to the online world.
                  </p>
                  <p>
                    We do not outsource. We do not have high-rise corporate offices. We are a family business spanning three generations, doing the honest work ourselves, just as we did thirty years ago.
                  </p>
                </div>
              </motion.div>

              {/* Right Side: Three Elegant Vertical Images */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeUp}
                custom={0.2}
                className="lg:col-span-7 grid grid-cols-3 gap-3 sm:gap-6"
              >
                {[
                  { src: "/p1.jpeg", alt: "Premium Cotton Suit", offset: false },
                  { src: "/p2.jpeg", alt: "Premium Gaji Silk Suit", offset: true },
                  { src: "/p5.jpeg", alt: "Premium Mul Cotton Suit", offset: false },
                ].map((img, i) => (
                  <div
                    key={i}
                    className={`group relative overflow-hidden rounded-[14px] aspect-[3/5] bg-neutral-900 shadow-lg ${
                      img.offset ? "mt-6 sm:mt-10" : ""
                    }`}
                  >
                    <Image
                      src={img.src}
                      alt={img.alt}
                      fill
                      sizes="(max-width: 768px) 33vw, 20vw"
                      className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500" />
                  </div>
                ))}
              </motion.div>

            </div>
          </div>
        </section>

        {/* Section 3: Premium Collection Cards */}
        <section className="py-24 sm:py-32 bg-[#F8F5F1]">
          <div className="max-w-screen-2xl mx-auto px-6 sm:px-12 lg:px-16">
            
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeUp}
              className="text-center max-w-3xl mx-auto mb-16"
            >
              <span
                className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#C8A45D] flex justify-center items-center gap-3 mb-4"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                <span className="w-8 h-[1px] bg-[#C8A45D]" />
                {t("PREMIUM SELECTIONS")}
                <span className="w-8 h-[1px] bg-[#C8A45D]" />
              </span>

              <h2
                className="text-4xl sm:text-5xl font-light text-[#111111] leading-tight"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                Curated <em className="not-italic font-normal italic text-[#C8A45D]">Suits & Fabrics</em>
              </h2>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              variants={fadeUp}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
            >
              {COLLECTIONS.map((c) => (
                <Link
                  key={c.slug}
                  href={`/collections/${c.slug}`}
                  className="group flex flex-col bg-white rounded-[14px] overflow-hidden border border-black/5 shadow-[0_4px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_16px_32px_rgba(0,0,0,0.08)] hover:-translate-y-1.5 transition-all duration-300"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-neutral-50">
                    <Image
                      src={c.image}
                      alt={c.title}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors duration-500" />
                  </div>
                  <div className="p-6 flex flex-col flex-1 justify-between bg-white">
                    <div>
                      <h3 className="text-base font-semibold text-[#111111] group-hover:underline underline-offset-4 decoration-1 transition-all">
                        {c.title}
                      </h3>
                      <p className="mt-2 text-xs text-[#7A7A7A] font-light leading-relaxed">
                        {c.desc}
                      </p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-black/5 flex items-center justify-between text-[#C8A45D] text-[11px] font-semibold uppercase tracking-[0.15em]">
                      <span>View Collection</span>
                      <ChevronRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              ))}
            </motion.div>

          </div>
        </section>

        {/* Section 4: Why Shop With Us (Trust Badges) */}
        <section className="bg-white border-y border-black/5 py-16">
          <div className="max-w-screen-2xl mx-auto px-6 sm:px-12 lg:px-16">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
              {[
                { icon: Award, title: "AUTHENTIC WEAVES", desc: "100% premium quality, hand-checked fibers." },
                { icon: Shield, title: "QUALITY ASSURED", desc: "Sourced directly under rigorous quality audits." },
                { icon: Truck, title: "SAFE SHIPPING", desc: "Insured and reliable delivery across PAN India." },
                { icon: RefreshCw, title: "NO EXCHANGE & RETURN", desc: "Strict policies to keep prices transparent." }
              ].map((badge, idx) => {
                const Icon = badge.icon;
                return (
                  <div key={idx} className="flex flex-col items-center text-center gap-3">
                    <div className="w-12 h-12 rounded-full border border-black/5 flex items-center justify-center text-[#C8A45D]">
                      <Icon size={22} strokeWidth={1.5} />
                    </div>
                    <h4
                      className="text-xs font-semibold tracking-widest text-[#111111] uppercase"
                      style={{ fontFamily: "'Poppins', sans-serif" }}
                    >
                      {t(badge.title)}
                    </h4>
                    <p
                      className="text-xs text-neutral-400 font-light max-w-[200px]"
                      style={{ fontFamily: "'Poppins', sans-serif" }}
                    >
                      {t(badge.desc)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Section 5: Brand Statistics & CTA */}
        <section className="bg-[#F8F5F1] py-24">
          <div className="max-w-screen-2xl mx-auto px-6 sm:px-12 lg:px-16">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeUp}
              className="bg-white border border-black/5 rounded-[14px] p-8 md:p-14 flex flex-col lg:flex-row items-center justify-between gap-12 shadow-[0_6px_24px_rgba(0,0,0,0.02)]"
            >
              
              {/* Stats Area */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16 w-full lg:w-auto text-left lg:border-r lg:border-black/5 pr-0 lg:pr-16">
                
                {/* Stat 1 */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#F8F5F1] flex items-center justify-center text-[#C8A45D]">
                    <Users size={20} strokeWidth={1.5} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[#111111] leading-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>10,000+</div>
                    <div className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold" style={{ fontFamily: "'Poppins', sans-serif" }}>Happy Patrons</div>
                  </div>
                </div>

                {/* Stat 2 */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#F8F5F1] flex items-center justify-center text-[#C8A45D]">
                    <Package size={20} strokeWidth={1.5} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[#111111] leading-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>15,000+</div>
                    <div className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold" style={{ fontFamily: "'Poppins', sans-serif" }}>Orders Shipped</div>
                  </div>
                </div>

                {/* Stat 3 */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#F8F5F1] flex items-center justify-center text-[#C8A45D]">
                    <Award size={20} strokeWidth={1.5} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[#111111] leading-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>150+</div>
                    <div className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold" style={{ fontFamily: "'Poppins', sans-serif" }}>Artisan Partners</div>
                  </div>
                </div>

              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto sm:justify-end">
                <Link
                  href="/search?category=fabrics"
                  className="group inline-flex items-center justify-center gap-3 px-8 py-4 border border-[#111111] text-[#111111] text-xs font-semibold uppercase tracking-[0.18em] transition-all duration-300 hover:bg-[#111111] hover:text-white bg-transparent"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  <span>{t("Shop Fabrics")}</span>
                  <ChevronRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/search?category=suits"
                  className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#111111] text-white border border-[#111111] text-xs font-semibold uppercase tracking-[0.18em] transition-all duration-300 hover:bg-transparent hover:text-[#111111]"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  <span>{t("Shop Suits")}</span>
                  <ChevronRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>

            </motion.div>
          </div>
        </section>

      </div>
    </Layout>
  );
};

export default AboutUs;
