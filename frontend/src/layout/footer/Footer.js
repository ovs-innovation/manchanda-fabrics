import Link from "next/link";
import { useState } from "react";
import useTranslation from "next-translate/useTranslation";
import { FaInstagram } from "react-icons/fa";
import { FiMail, FiPhone, FiMapPin, FiClock } from "react-icons/fi";

//internal import
import useGetSetting from "@hooks/useGetSetting";
import useUtilsFunction from "@hooks/useUtilsFunction";

const Footer = () => {
  const { showingTranslateValue } = useUtilsFunction();
  const { storeCustomizationSetting } = useGetSetting();

  const block1Links = [
    { title: "New Arrivals", href: "/new-arrivals" },
    { title: "Sarees", href: "/search?category=sarees" },
    { title: "Suits", href: "/search?category=suits" },
    { title: "Fabrics", href: "/search?category=fabrics" },
  ];

  const block2Links = [
    { title: "About Us", href: "/about-us" },
    { title: "Contact Us", href: "/contact-us" },
    { title: "FAQs", href: "/faq" },
    { title: "Shipping & Returns", href: "/refund-return-policy" },
  ];

  const block3Links = [
    { title: "Privacy Policy", href: "/privacy-policy" },
    { title: "Terms & Conditions", href: "/terms-and-conditions" },
    { title: "Shipping & Delivery", href: "/shipping-delivery-policy" },
  ];

  return (
    <footer className="bg-[#3B2A25] text-[#E6D1CB]/80 border-t border-[#6F4A3D]/40 relative overflow-hidden font-sans">
      {/* Premium Ambient Lighting Glow */}
      <div className="absolute inset-x-0 bottom-0 h-64 bg-[#9C6A5A]/5 blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-0 left-1/4 w-[300px] h-[300px] rounded-full bg-white/2 blur-[100px] pointer-events-none z-0" />

      <div className="mx-auto max-w-screen-2xl px-6 sm:px-10 lg:px-16 relative z-10">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-x-8 gap-y-12 py-20">
          
          {/* Column 1: Brand Info (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <Link href="/" className="inline-block" rel="noreferrer">
              <span className="font-serif tracking-[0.2em] text-2xl uppercase text-[#FAF7F5] font-sans">
                MANCHANDA<span className="text-[#9C6A5A]">.</span>
              </span>
            </Link>
            <p className="text-xs text-[#E6D1CB]/70 leading-relaxed max-w-sm">
              Premium ethnic fashion brand focused on sarees, suits, fabrics and festive collections. Crafting timeless elegance for celebrations, traditions, and everyday grace.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://www.instagram.com/manchandafabrics"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full border border-[#6F4A3D]/50 bg-[#6F4A3D]/20 flex items-center justify-center text-[#E6D1CB] hover:text-[#FAF7F5] hover:border-[#9C6A5A]/40 hover:shadow-[0_0_10px_rgba(156,106,90,0.15)] transition-all duration-300"
              >
                <FaInstagram className="w-4 h-4" />
              </a>
              <a
                href="mailto:info@manchandafabrics.com"
                className="w-8 h-8 rounded-full border border-[#6F4A3D]/50 bg-[#6F4A3D]/20 flex items-center justify-center text-[#E6D1CB] hover:text-[#FAF7F5] hover:border-[#9C6A5A]/40 hover:shadow-[0_0_10px_rgba(156,106,90,0.15)] transition-all duration-300"
              >
                <FiMail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Collections (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-[#FAF7F5]">
              {showingTranslateValue(storeCustomizationSetting?.footer?.block1_title) || "Collections"}
            </h4>
            <ul className="text-[10px] uppercase tracking-wider font-extrabold flex flex-col space-y-3.5">
              {block1Links.map((link, idx) => (
                <li key={idx}>
                  <Link href={link.href} className="text-[#E6D1CB]/70 hover:text-[#FAF7F5] transition-colors duration-300 flex items-center gap-1.5 group">
                    <span className="w-0 group-hover:w-2.5 h-[1.5px] bg-[#9C6A5A] transition-all duration-300"></span>
                    <span>{link.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Customer Care (3 cols) */}
          <div className="lg:col-span-3 space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-[#FAF7F5]">
              {showingTranslateValue(storeCustomizationSetting?.footer?.block2_title) || "Support & Info"}
            </h4>
            <ul className="text-[10px] uppercase tracking-wider font-extrabold flex flex-col space-y-3.5">
              {block2Links.map((link, idx) => (
                <li key={idx}>
                  {link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#E6D1CB]/70 hover:text-[#FAF7F5] transition-colors duration-300 flex items-center gap-2 group"
                    >
                      {link.icon ? (
                        <span className="transition-transform duration-300 group-hover:scale-110">{link.icon}</span>
                      ) : (
                        <span className="w-0 group-hover:w-2.5 h-[1.5px] bg-[#9C6A5A] transition-all duration-300"></span>
                      )}
                      <span>{link.title}</span>
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-[#E6D1CB]/70 hover:text-[#FAF7F5] transition-colors duration-300 flex items-center gap-2 group"
                    >
                      {link.icon ? (
                        <span className="transition-transform duration-300 group-hover:scale-110">{link.icon}</span>
                      ) : (
                        <span className="w-0 group-hover:w-2.5 h-[1.5px] bg-[#9C6A5A] transition-all duration-300"></span>
                      )}
                      <span>{link.title}</span>
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact & Office (3 cols) */}
          <div className="lg:col-span-3 space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-[#FAF7F5]">
              Contact
            </h4>
            <div className="space-y-4 text-xs text-[#E6D1CB]/70">
              <div className="flex items-center gap-3 hover:text-[#FAF7F5] transition-colors">
                <FiMail className="w-4 h-4 text-[#9C6A5A] shrink-0" />
                <a
                  href="mailto:info@manchandafabrics.com"
                  className="text-[11px] hover:underline break-all"
                >
                  info@manchandafabrics.com
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom copyright declaration */}
        <div className="flex flex-col md:flex-row justify-between items-center py-8 border-t border-[#6F4A3D]/40 gap-4">
          <div className="flex flex-col gap-2 text-left md:w-2/3">
            <p className="text-[9px] uppercase tracking-[0.2em] text-[#E6D1CB]/50 mb-0 font-extrabold">
              © {new Date().getFullYear()} MANCHANDA FABRICS. ALL RIGHTS RESERVED.
            </p>
            <p className="text-[9px] tracking-[0.1em] text-[#E6D1CB]/50 leading-relaxed font-medium max-w-xl">
              Disclaimer: All sarees, suits, fabrics, and products shown are carefully curated premium Indian ethnic designs.
            </p>
          </div>
          <p className="text-[9px] uppercase tracking-[0.2em] text-[#E6D1CB]/50 flex items-center gap-1 font-extrabold">
            TIMELESS ELEGANCE IN EVERY DRAPE
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
