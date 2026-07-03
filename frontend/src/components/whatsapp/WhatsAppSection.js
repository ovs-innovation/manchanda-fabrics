import React from "react";
import { FaWhatsapp } from "react-icons/fa";
import useGetSetting from "@hooks/useGetSetting";

const WhatsAppSection = () => {
  const { storeCustomizationSetting } = useGetSetting();

  const phone1 = storeCustomizationSetting?.footer?.social_whatsapp || "919240250346";
  const phone2 = "919876543210"; // Placeholder — replace via admin panel

  const makeLink = (num) =>
    `https://wa.me/${num.replace(/\D/g, "")}?text=${encodeURIComponent(
      "Hello Manchanda Fabrics, I would like to place an order."
    )}`;

  return (
    <section
      className="py-9 sm:py-11 border-y border-[#1a5c30]/30"
      style={{ background: "linear-gradient(135deg, #0d3b1e 0%, #1a5c30 50%, #0d3b1e 100%)" }}
    >
      <div className="max-w-screen-xl mx-auto px-6 sm:px-12 lg:px-16">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-12">

          {/* ── LEFT: Icon + Text ── */}
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-full bg-[#25D366]/15 border border-[#25D366]/30 flex items-center justify-center shrink-0">
              <FaWhatsapp className="w-6 h-6 text-[#25D366]" />
            </div>
            <div>
              <h2
                className="text-2xl sm:text-3xl font-light text-white leading-tight"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              >
                Order Directly on <em className="not-italic italic text-[#25D366]">WhatsApp</em>
              </h2>
              <p
                className="text-[13px] text-white/60 font-light mt-1"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                Personalized shopping assistance · Mon–Sat, 10 AM – 8 PM IST
              </p>
            </div>
          </div>

          {/* ── RIGHT: Buttons ── */}
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <a
              href={makeLink(phone1)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2.5 px-7 py-3 bg-[#25D366] text-white text-[11px] font-semibold uppercase tracking-[0.18em] rounded-full hover:bg-[#1ebe5d] hover:shadow-[0_0_24px_rgba(37,211,102,0.35)] transition-all duration-300"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              <FaWhatsapp className="w-4 h-4" />
              Phone 1 — Order Now
            </a>

            <a
              href={makeLink(phone2)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2.5 px-7 py-3 border border-[#25D366]/50 text-white text-[11px] font-semibold uppercase tracking-[0.18em] rounded-full hover:bg-[#25D366]/10 hover:border-[#25D366] transition-all duration-300"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              <FaWhatsapp className="w-4 h-4 text-[#25D366]" />
              Phone 2 — Order Now
            </a>
          </div>

        </div>
      </div>
    </section>
  );
};

export default WhatsAppSection;
