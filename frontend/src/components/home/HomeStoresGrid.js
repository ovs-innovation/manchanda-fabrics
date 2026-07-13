import useTranslation from "next-translate/useTranslation";
import Link from "next/link";
import { FiMapPin } from "react-icons/fi";
import { DEFAULT_HOMEPAGE } from "@utils/homepageDefaults";

const HomeStoresGrid = ({ stores: storesProp }) => {
  const { t } = useTranslation("common");
  const originalStores =
    Array.isArray(storesProp) && storesProp.length > 0
      ? storesProp
      : DEFAULT_HOMEPAGE.stores;

  // Swap the placeholder URLs with local premium suit images from /public if no custom image is uploaded
  const localImages = [
    "/p3.jpeg",
    "/p2.jpeg",
    "/p14.jpeg",
  ];

  const isPlaceholderUrl = (url) => {
    if (!url || typeof url !== "string") return true;
    return url.includes("images.unsplash.com") || url.includes("logo") || url.includes("sepia");
  };

  const stores = originalStores
    .filter((s) => s.name?.toLowerCase().includes("delhi"))
    .map((s, idx) => ({
      ...s,
      image: isPlaceholderUrl(s.image) ? localImages[idx % localImages.length] : s.image,
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

        <div className="mt-12 flex justify-center">
          {stores.map((s) => (
            <div
              key={s.name}
              className="group relative overflow-hidden bg-neutral-900 rounded-[20px] border border-[#C8A45D]/40 shadow-[0_12px_32px_rgba(0,0,0,0.12)] hover:shadow-[0_20px_48px_rgba(0,0,0,0.18)] transition-all duration-500 w-full md:w-[70%] max-w-[850px] min-h-[420px] md:min-h-[480px] aspect-[16/10] md:aspect-[16/9] mx-auto"
            >
              {s.image ? (
                <img
                  src={s.image}
                  alt={s.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-[1.03]"
                  style={{ objectPosition: "center top" }}
                  loading="lazy"
                />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/15 group-hover:from-black/75 group-hover:via-black/35 group-hover:to-black/10 transition-all duration-500" />

              <div className="absolute top-6 left-6 bg-[#C8A45D] text-white text-[10px] font-bold tracking-[0.25em] px-3.5 py-1.5 rounded-full shadow-md z-10">
                FLAGSHIP STORE
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 flex flex-col justify-end text-white z-10">
                <h3
                  className="text-3xl md:text-4xl font-light tracking-wide text-white leading-tight"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  {s.name}
                </h3>
                
                <div className="mt-3 flex items-center gap-2 text-white/90 text-sm font-light">
                  <FiMapPin className="text-[#C8A45D] shrink-0" size={16} />
                  <span>{s.address}</span>
                </div>

                <div className="mt-3.5 text-[12px] tracking-wide text-white/70 font-light leading-relaxed">
                  <p className="text-[#C8A45D] font-semibold uppercase tracking-[0.1em] mb-0.5">Open Daily</p>
                  <p className="text-white/80">11:30 AM – 8:00 PM</p>
                </div>

                <div className="mt-6 flex flex-wrap gap-4">
                  <Link 
                    href="/contact-us"
                    className="px-6 py-2.5 bg-[#C8A45D] hover:bg-[#bfa054] text-white text-[11px] font-semibold uppercase tracking-[0.2em] rounded transition-all duration-300 transform active:scale-95 text-center"
                  >
                    Visit Store
                  </Link>
                  <a 
                    href="https://www.google.com/maps/search/?api=1&query=12,+Katra+Neel+Rd,+New+Krishna+Cloth+Market,+Kucha+Ghasiram,+Chandni+Chowk,+Delhi,+110006"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-2.5 bg-transparent border border-white/40 hover:border-white hover:bg-white/5 text-white text-[11px] font-semibold uppercase tracking-[0.2em] rounded transition-all duration-300 transform active:scale-95 text-center"
                  >
                    Get Directions
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomeStoresGrid;
