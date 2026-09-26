import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import useTranslation from "next-translate/useTranslation";

import Layout from "@layout/Layout";
import ProductServices from "@services/ProductServices";
import ProductCard from "@components/product/ProductCard";
import HeroBanner from "@components/banner/HeroBanner";
import AttributeServices from "@services/AttributeServices";
import HomeWhatsAppBand from "@components/home/HomeWhatsAppBand";
import HomeCategoryCircles from "@components/home/HomeCategoryCircles";
import HomeShopLatestCarousel from "@components/home/HomeShopLatestCarousel";

import HomeMarqueeStrip from "@components/home/HomeMarqueeStrip";
import HomeTrustBadges from "@components/home/HomeTrustBadges";
import CategoryServices from "@services/CategoryServices";
import { mergeHomepage } from "@utils/homepageDefaults";
import { normalizeProductImageUrl } from "@utils/brandAssets";




/* ── Main Page ── */
const Home = ({
  popularProducts: popularProp,
  bestSellingProducts: bestSellingProp,
  attributes,
  categories: categoriesProp,
  allProducts: allProductsProp,
  homepage: homepageProp,
}) => {
  const { t } = useTranslation("common");
  const homepage = mergeHomepage(homepageProp);
  const videoShopping = homepage.videoShopping || {};

  const [productsState, setProductsState] = React.useState({
    popularProducts: popularProp || [],
    bestSellingProducts: bestSellingProp || [],
    allProducts: allProductsProp || [],
  });
  const [categoriesState, setCategoriesState] = React.useState(categoriesProp || []);

  React.useEffect(() => {
    // Fetch latest showing categories so admin changes reflect immediately
    CategoryServices.getShowingCategory()
      .then((liveCats) => {
        if (Array.isArray(liveCats) && liveCats.length > 0) {
          setCategoriesState(liveCats);
        }
      })
      .catch(() => {});

    // If SSG returned empty products (e.g. backend was down during build/revalidate), fetch client-side
    if (!productsState.allProducts?.length && !productsState.popularProducts?.length) {
      Promise.allSettled([
        ProductServices.getShowingStoreProducts({}),
        ProductServices.getShowingProducts(),
        ProductServices.getShowingStoreProducts({ tag: "new-arrival" }),
      ]).then(([dataResult, allProductsResult, newArrivalsResult]) => {
        const data = dataResult.status === "fulfilled" ? dataResult.value : null;
        const allProds = allProductsResult.status === "fulfilled" ? allProductsResult.value : [];
        const newArrData = newArrivalsResult.status === "fulfilled" ? newArrivalsResult.value : null;
        const popProds =
          newArrData?.popularProducts && newArrData.popularProducts.length > 0
            ? newArrData.popularProducts
            : data?.popularProducts || [];

        setProductsState({
          popularProducts: popProds || [],
          bestSellingProducts: data?.bestSellingProducts || [],
          allProducts: allProds || [],
        });
      });
    }
  }, []);

  const popularProducts = productsState.popularProducts || [];
  const bestSellingProducts = productsState.bestSellingProducts || [];
  const allProducts = productsState.allProducts || [];

  const catalog = allProducts.length ? allProducts : popularProducts;
  const newArrivals = popularProducts.length ? popularProducts : catalog;

  // Unique products for reel section — trending picks first, then fallback
  const reelProducts = (() => {
    const trending = (bestSellingProducts || []).filter((p) => p?._id || p?.slug);
    if (trending.length > 0) return trending;

    const merged = [...popularProducts, ...allProducts, ...catalog];
    const seen = new Set();
    return merged.filter((p) => {
      const id = p?._id || p?.slug;
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  })();

  const getCatTitle = (c) => {
    if (!c) return "";
    if (typeof c.name === "string") return c.name;
    return (
      c.name?.en ||
      c.name?.default ||
      (typeof c.name === "object" ? Object.values(c.name)[0] : "") ||
      c.title ||
      ""
    );
  };

  const getCatSlug = (c) => {
    if (c?.slug) return String(c.slug).toLowerCase().trim();
    const title = getCatTitle(c);
    return String(title)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  // Per-category product counts (matched by category id or slug/name), keyed by slug
  const productsOfCategory = (c) => {
    const cSlug = getCatSlug(c);
    const cTitle = getCatTitle(c).toLowerCase().trim();
    return catalog.filter((p) => {
      const ids = Array.isArray(p?.categories)
        ? p.categories.map((x) => (typeof x === "string" ? x : x?._id))
        : [];
      const single = p?.category?._id || p?.category;
      if (c?._id && (ids.includes(c._id) || single === c._id)) return true;

      const pCatSlug = (p?.categorySlug || p?.category?.slug || "").toLowerCase().trim();
      if (cSlug && pCatSlug && pCatSlug === cSlug) return true;

      const pCatName = (p?.categoryName || p?.category?.name?.en || p?.category?.name || "").toLowerCase().trim();
      if (cTitle && pCatName && pCatName === cTitle) return true;

      return false;
    });
  };

  const categoryCounts = {};
  (categoriesState || []).forEach((c) => {
    const slug = getCatSlug(c);
    if (!slug) return;
    categoryCounts[slug] = productsOfCategory(c).length;
  });

  // Real store categories for the circles — prioritize uploaded category icon/banner, then product image
  const circleCategories = (categoriesState || [])
    .map((c) => {
      const catProducts = productsOfCategory(c);
      const firstValidProductImage =
        catProducts
          .map((p) => p?.featuredImage || p?.image?.[0] || p?.images?.[0])
          .find((img) => img && typeof img === "string" && !img.startsWith("blob:")) || null;

      const rawCatImg =
        c?.icon ||
        c?.banner ||
        c?.image ||
        (Array.isArray(c?.images) && c.images[0]) ||
        firstValidProductImage ||
        null;

      const finalImage = normalizeProductImageUrl(rawCatImg);
      const title = getCatTitle(c);
      const slug = getCatSlug(c);

      return {
        _id: c?._id,
        slug,
        title,
        image: finalImage,
        count: catProducts.length,
      };
    })
    .filter((c) => c.slug && c.title);

  return (
    <Layout>
      <div className="min-h-screen bg-white text-[#111111] overflow-x-hidden">

        {/* 1 ── Hero */}
        <HeroBanner homepage={homepage} />

        <HomeWhatsAppBand whatsappNumbers={homepage.whatsappNumbers} />

        {/* 2 ── Shop By Categories (real store categories, circle avatars like ref) */}
        <HomeCategoryCircles categories={circleCategories} counts={categoryCounts} />

        {/* 3 ── New Arrivals (exact ref layout) */}
        <section className="py-16 sm:py-28 bg-white border-b border-black/5">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-12 lg:px-16">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 lg:gap-8 mb-10 sm:mb-16">
              <div>
                <p className="text-[12px] sm:text-[13px] text-neutral-500 text-center lg:text-left">
                  {t("Be the First to Try Our New Collection")}
                </p>
                <h2
                  className="text-3xl sm:text-5xl font-semibold text-[#111111] text-center lg:text-left"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  {t("New Arrivals")}
                </h2>
                <p className="mt-2 sm:mt-4 text-xs sm:text-sm text-[#7A7A7A] max-w-2xl font-light text-center lg:text-left" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  {t("New season, new vibes, new arrivals – because you deserve the freshest picks.")}
                </p>
              </div>
              <Link
                href="/search"
                className="group hidden lg:inline-flex items-center gap-3 px-10 py-4 border border-[#111111] text-[#111111] text-[13px] sm:text-[14px] font-medium uppercase tracking-[0.18em] transition-all duration-300 hover:bg-[#111111] hover:text-white"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                <span>{t("View All")}</span>
                <ChevronRight
                  size={20}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>
            </div>

            {newArrivals?.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
                  {newArrivals.slice(0, 4).map((product) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      attributes={attributes}
                    />
                  ))}
                </div>

                {/* Mobile View All Button (shows below 4 products on mobile only) */}
                <div className="mt-10 flex justify-center lg:hidden">
                  <Link
                    href="/search"
                    className="group inline-flex items-center justify-center gap-3 w-full sm:w-auto px-10 py-4 border border-[#111111] text-[#111111] text-[13px] sm:text-[14px] font-medium uppercase tracking-[0.18em] transition-all duration-300 hover:bg-[#111111] hover:text-white"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    <span>{t("View All")}</span>
                    <ChevronRight
                      size={20}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </Link>
                </div>
              </>
            ) : (
              <div
                className="py-16 text-center text-[#7A7A7A] bg-white border border-neutral-100 text-sm"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                {t("Products catalog loading...")}
              </div>
            )}
          </div>
        </section>

        {/* 4 ── Video shopping banner (use existing LuxuryFeatures slot later if needed) */}
        {videoShopping.enabled !== false && (
          <section className="bg-white">
            <div className="max-w-screen-2xl mx-auto px-6 sm:px-12 lg:px-16 py-14">
              <div className="relative overflow-hidden rounded-xl">
                <img
                  src={videoShopping.image || "/h5.jpeg"}
                  alt="Video shopping"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/45" />
                <div className="relative flex flex-col items-center justify-center text-center text-white px-5 sm:px-6 py-12 sm:py-16 min-h-[300px] sm:min-h-[360px]">
                  <h3
                    className="text-lg sm:text-3xl md:text-4xl font-semibold leading-snug max-w-2xl"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    {videoShopping.title
                      ? t(videoShopping.title)
                      : t("Shop from Anywhere, Anytime! Enjoy Live Video Shopping from 11 AM – 7 PM")}
                  </h3>
                  <p className="mt-3 text-xs sm:text-sm text-white/85">
                    {videoShopping.subtitle
                      ? t(videoShopping.subtitle)
                      : t("Stylists On Call (English & Hindi)")}
                  </p>
                  <a
                    href={`https://wa.me/${videoShopping.whatsapp || "919650544554"}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-6 inline-flex items-center justify-center bg-[#1fa64a] hover:bg-[#178a3d] transition-colors text-white px-6 sm:px-8 py-3 text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] sm:tracking-[0.25em] rounded"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    {t("Whatsapp Video Call Now")}
                  </a>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 5 ── Shop Latest Collection (reels-style product carousel) */}
        <HomeShopLatestCarousel items={reelProducts.slice(0, 4)} />

        {/* 7 ── Scrolling marquee strip like ref */}
        <HomeMarqueeStrip phrases={homepage.marqueePhrases} />

        <HomeTrustBadges />





      </div>
    </Layout>
  );
};

export const getStaticProps = async () => {
  const [dataResult, attributesResult, categoriesResult, allProductsResult, newArrivalsResult] =
    await Promise.allSettled([
      ProductServices.getShowingStoreProducts({}),
      AttributeServices.getShowingAttributes(),
      CategoryServices.getShowingCategory(),
      ProductServices.getShowingProducts(),
      ProductServices.getShowingStoreProducts({ tag: "new-arrival" }),
    ]);

  const data = dataResult.status === "fulfilled" ? dataResult.value : null;
  const attributes = attributesResult.status === "fulfilled" ? attributesResult.value : [];
  const categories = categoriesResult.status === "fulfilled" ? categoriesResult.value : [];
  const allProducts = allProductsResult.status === "fulfilled" ? allProductsResult.value : [];
  // Strip heavyweight unused fields from catalog to minimize HTML payload and speed up page delivery
  const trimmedAllProducts = (allProducts || []).map((p) => ({
    _id: p?._id || "",
    slug: p?.slug || "",
    categories: Array.isArray(p?.categories) ? p.categories : [],
    category: p?.category || null,
    categorySlug: p?.categorySlug || p?.category?.slug || "",
    categoryName: p?.categoryName || p?.category?.name || "",
    featuredImage: p?.featuredImage || p?.image?.[0] || null,
    image: Array.isArray(p?.image) ? p.image.slice(0, 2) : p?.image || [],
    title: p?.title || "",
    prices: p?.prices || { price: p?.price || 0 },
    price: p?.price || 0,
    tag: p?.tag || [],
    tags: p?.tags || [],
    stock: p?.stock || 0,
  }));

  return {
    props: {
      attributes: attributes || [],
      popularProducts: (newArrivalsData?.popularProducts && newArrivalsData.popularProducts.length > 0)
        ? newArrivalsData.popularProducts
        : (data?.popularProducts || []),
      bestSellingProducts: data?.bestSellingProducts || [],
      categories: categories || [],
      allProducts: trimmedAllProducts,
      homepage: data?.manchandaHomepage || null,
    },
    revalidate: 60,
  };
};

export default Home;
