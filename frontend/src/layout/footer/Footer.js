import Link from "next/link";
import { useState } from "react";
import { FaInstagram } from "react-icons/fa";
import { FiMail, FiPhone, FiMapPin, FiClock } from "react-icons/fi";

//internal import
import useGetSetting from "@hooks/useGetSetting";
import useUtilsFunction from "@hooks/useUtilsFunction";
import { getStoreAddress } from "@utils/storeBrand";

const Footer = () => {
  const { showingTranslateValue } = useUtilsFunction();
  const { storeCustomizationSetting, globalSetting } = useGetSetting();

  const storeAddress = getStoreAddress({
    storeCustomizationSetting,
    globalSetting,
    showingTranslateValue,
  });

  const storeEmail =
    showingTranslateValue(storeCustomizationSetting?.contact_us?.email_box_email) ||
    globalSetting?.email ||
    "info@manchandafabrics.com";

  const storePhone =
    showingTranslateValue(storeCustomizationSetting?.contact_us?.call_box_phone) ||
    globalSetting?.contact ||
    "";

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
    <footer className="bg-[#FAF7F5] text-[#2B211E] border-t border-[#D5BBB4] relative overflow-hidden font-sans">
      <div className="mx-auto max-w-screen-2xl px-6 sm:px-10 lg:px-16 relative z-10">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-x-8 gap-y-12 py-16">
          
          {/* Column 1: Brand Info (4 cols) */}
          <div className="lg:col-span-4 space-y-5">
            <Link href="/" className="inline-block" rel="noreferrer">
              <span className="font-serif tracking-[0.25em] text-2xl uppercase text-[#93614E] font-medium">
                MANCHANDA<span className="text-[#C7A46A]">.</span>
              </span>
            </Link>
            <p className="text-sm text-[#2B211E]/80 leading-relaxed max-w-sm">
              Premium ethnic fashion brand focused on sarees, suits, fabrics and festive collections. Crafting timeless elegance for celebrations, traditions, and everyday grace.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3 pt-1">
              <a
                href="https://www.instagram.com/manchandafabrics"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full border border-[#D5BBB4] bg-white flex items-center justify-center text-[#93614E] hover:text-[#7A4D3C] hover:border-[#93614E] transition-all duration-300"
              >
                <FaInstagram className="w-4 h-4" />
              </a>
              <a
                href="mailto:info@manchandafabrics.com"
                className="w-9 h-9 rounded-full border border-[#D5BBB4] bg-white flex items-center justify-center text-[#93614E] hover:text-[#7A4D3C] hover:border-[#93614E] transition-all duration-300"
              >
                <FiMail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Collections (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#93614E]">
              {showingTranslateValue(storeCustomizationSetting?.footer?.block1_title) || "Collections"}
            </h4>
            <div className="w-6 h-[1px] bg-[#C7A46A]" />
            <ul className="text-sm flex flex-col space-y-2.5">
              {block1Links.map((link, idx) => (
                <li key={idx}>
                  <Link href={link.href} className="text-[#2B211E]/80 hover:text-[#93614E] transition-colors duration-300 flex items-center gap-1 group">
                    <span>{link.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Customer Care (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#93614E]">
              {showingTranslateValue(storeCustomizationSetting?.footer?.block2_title) || "Support & Info"}
            </h4>
            <div className="w-6 h-[1px] bg-[#C7A46A]" />
            <ul className="text-sm flex flex-col space-y-2.5">
              {block2Links.map((link, idx) => (
                <li key={idx}>
                  <Link
                    href={link.href}
                    className="text-[#2B211E]/80 hover:text-[#93614E] transition-colors duration-300 flex items-center gap-1 group"
                  >
                    <span>{link.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact & Office (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#93614E]">
              Contact Us
            </h4>
            <div className="w-6 h-[1px] bg-[#C7A46A]" />
            <div className="space-y-3 text-sm text-[#2B211E]/80">
              {storePhone ? (
                <div className="flex items-start gap-2 hover:text-[#93614E] transition-colors">
                  <FiPhone className="w-4 h-4 text-[#93614E] shrink-0 mt-0.5" />
                  <a href={`tel:${storePhone.replace(/\s/g, "")}`} className="hover:underline">
                    {storePhone}
                  </a>
                </div>
              ) : null}
              <div className="flex items-center gap-2 hover:text-[#93614E] transition-colors">
                <FiMail className="w-4 h-4 text-[#93614E] shrink-0" />
                <a
                  href={`mailto:${storeEmail.trim()}`}
                  className="hover:underline break-all"
                >
                  {storeEmail.trim()}
                </a>
              </div>
              <div className="flex items-start gap-2">
                <FiMapPin className="w-4 h-4 text-[#93614E] shrink-0 mt-0.5" />
                <p className="leading-relaxed">{storeAddress}</p>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center py-6 border-t border-[#D5BBB4] gap-4">
          <div className="flex flex-col gap-1 text-left md:w-2/3">
            <p className="text-xs uppercase tracking-[0.15em] text-[#2B211E]/60 mb-0 font-medium">
              © {new Date().getFullYear()} MANCHANDA FABRICS. ALL RIGHTS RESERVED.
            </p>
            <p className="text-[10px] tracking-[0.05em] text-[#2B211E]/40 leading-relaxed max-w-xl">
              {storeAddress}
            </p>
          </div>
          <p className="text-xs uppercase tracking-[0.2em] text-[#93614E] font-serif tracking-widest italic">
            Timeless Elegance in Every Drape
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
