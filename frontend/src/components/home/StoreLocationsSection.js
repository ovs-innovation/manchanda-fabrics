import useTranslation from "next-translate/useTranslation";

const StoreLocationsSection = () => {
  const { t } = useTranslation("common");

  const stores = [
    {
      title: "Manchanda Fabrics (Main Store)",
      address:
        "Visit our boutique for premium suits, silks, and curated fabrics.",
      city: "New Delhi, India",
    },
    {
      title: "Video Shopping (11 AM – 7 PM)",
      address:
        "Shop from anywhere with a WhatsApp video call and stylist guidance.",
      city: "English & Hindi support",
    },
    {
      title: "Customer Support",
      address: "Need help picking a look? Our team is here for you.",
      city: "WhatsApp / Call / Email",
    },
  ];

  return (
    <section className="py-24 sm:py-28 bg-[#F9F6F1] border-b border-black/5">
      <div className="max-w-screen-2xl mx-auto px-6 sm:px-12 lg:px-16">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <p className="text-[12px] font-semibold tracking-[0.3em] uppercase text-neutral-400">
            {t("Visit Our Stores")}
          </p>
          <h2
            className="mt-3 text-4xl sm:text-5xl font-semibold text-[#111111]"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            {t("Step into our world of style & craftsmanship")}
          </h2>
          <p className="mt-4 text-sm text-neutral-500">
            {t(
              "Explore collections in-store or shop live on WhatsApp with our stylists."
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stores.map((s) => (
            <div
              key={s.title}
              className="bg-white border border-neutral-100 p-8 hover:shadow-xl transition-all duration-300"
            >
              <h3 className="text-lg font-semibold text-[#111111]">
                {t(s.title)}
              </h3>
              <p className="mt-3 text-sm text-neutral-600 leading-relaxed">
                {t(s.address)}
              </p>
              <p className="mt-4 text-[11px] font-semibold tracking-[0.25em] uppercase text-[#111111]">
                {t(s.city)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StoreLocationsSection;

