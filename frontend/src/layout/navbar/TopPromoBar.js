import Link from "next/link";
import useTranslation from "next-translate/useTranslation";

const TopPromoBar = () => {
  const { t } = useTranslation("common");

  return (
    <div className="w-full bg-[#111111] text-white border-b border-white/10">
      <div className="max-w-screen-2xl mx-auto px-6 sm:px-12 lg:px-16 h-9 flex items-center justify-center text-[11px] tracking-[0.18em] uppercase">
        <div className="flex items-center gap-3">
          <span className="text-white/60 select-none">‹</span>
          <span className="font-semibold">{t("Free Express Shipping")}</span>
          <Link
            href="/search"
            className="ml-2 text-white/80 hover:text-white underline underline-offset-4"
          >
            {t("Shop now")}
          </Link>
          <span className="text-white/60 select-none">›</span>
        </div>
      </div>
    </div>
  );
};

export default TopPromoBar;

