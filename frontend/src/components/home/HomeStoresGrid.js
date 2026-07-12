import useTranslation from "next-translate/useTranslation";
import { DEFAULT_HOMEPAGE } from "@utils/homepageDefaults";

const HomeStoresGrid = ({ stores: storesProp }) => {
  const { t } = useTranslation("common");
  const originalStores =
    Array.isArray(storesProp) && storesProp.length > 0
      ? storesProp
      : DEFAULT_HOMEPAGE.stores;

  // Swap the placeholder URLs with local premium women's suit and store images from /public
  const localImages = [
    "/footer-chandni-chowk-sepia.webp",
    "/h4.jpeg",
    "/h3.jpeg",
  ];

  const stores = originalStores.map((s, idx) => ({
    ...s,
    image: localImages[idx % localImages.length],
  }));

  if (!stores.length) return null;

  return (
    <section className="py-20 sm:py-24 bg-white">
      <div className="max-w-screen-2xl mx-auto px-6 sm:px-12 lg:px-16">
        <h2
          className="text-center text-4xl sm:text-5xl font-semibold text-[#111111]"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          {t("Visit Our Store")}
        </h2>
        <p className="text-center mt-4 text-sm text-neutral-500 max-w-3xl mx-auto">
          {t(
            "Step into our world of style, creativity, and craftsmanship. Visit our store to explore exclusive collections and get personalized assistance."
          )}
        </p>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {stores.map((s) => (
            <div
              key={s.name}
              className="relative overflow-hidden bg-neutral-100 min-h-[320px]"
            >
              {s.image ? (
                <img
                  src={s.image}
                  alt={s.name}
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ objectPosition: "center top" }}
                  loading="lazy"
                />
              ) : null}
              <div className="absolute inset-0 bg-black/35" />

              <div className="absolute inset-0 p-8 flex flex-col justify-center text-white">
                <h3
                  className="text-2xl font-semibold"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  {s.name}
                </h3>
                <p className="mt-3 text-sm text-white/85">{s.address}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomeStoresGrid;
