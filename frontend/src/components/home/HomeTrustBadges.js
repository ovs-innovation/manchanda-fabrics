import { Star, ShieldCheck, Headphones, PackageX } from "lucide-react";
import useTranslation from "next-translate/useTranslation";

const BADGES = [
  { icon: PackageX, label: "No Return & Exchange" },
  { icon: Star, label: "Premium Quality Fabrics" },
  { icon: ShieldCheck, label: "100% Secure Payment" },
  { icon: Headphones, label: "24/7 Customers Support" },
];

const HomeTrustBadges = () => {
  const { t } = useTranslation("common");

  return (
    <section className="bg-white border-y border-black/5">
      <div className="max-w-screen-2xl mx-auto px-6 sm:px-12 lg:px-16 py-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {BADGES.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex flex-col items-center text-center gap-3"
            >
              <Icon size={34} strokeWidth={1.25} className="text-[#111111]" />
              <p
                className="text-[13px] sm:text-sm font-semibold text-[#111111]"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                {t(label)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomeTrustBadges;
