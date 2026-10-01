import { Star, ShieldCheck, Headphones, PackageX } from "lucide-react";
import useTranslation from "next-translate/useTranslation";

const BADGES = [
  {
    icon: PackageX,
    label: "No Return & Exchange",
    desc: "Strict policies to keep prices transparent.",
  },
  {
    icon: Star,
    label: "Premium Quality Fabrics",
    desc: "100% genuine fibers handpicked by artisans.",
  },
  {
    icon: ShieldCheck,
    label: "100% Secure Payment",
    desc: "Encrypted transactions & trusted PAN-India gateways.",
  },
  {
    icon: Headphones,
    label: "Customer Support",
    desc: "Friendly assistance via WhatsApp & call.",
  },
];

const HomeTrustBadges = () => {
  const { t } = useTranslation("common");

  return (
    <section className="bg-white border-y border-[#E6D1CB]/60 py-12 sm:py-16">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-12 lg:px-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 md:gap-12">
          {BADGES.map(({ icon: Icon, label, desc }, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center text-center gap-2.5 sm:gap-3"
            >
              <div className="w-12 h-12 rounded-full border border-[#E6D1CB] bg-[#FAF7F5] flex items-center justify-center text-[#C8A45D]">
                <Icon size={22} strokeWidth={1.5} />
              </div>
              <h4
                className="text-xs font-semibold tracking-widest text-[#111111] uppercase"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                {t(label)}
              </h4>
              <p
                className="text-xs text-neutral-400 font-light max-w-[210px] leading-relaxed"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                {t(desc)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomeTrustBadges;
