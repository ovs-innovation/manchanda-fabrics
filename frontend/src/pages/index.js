import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import useTranslation from "next-translate/useTranslation";

import Layout from "@layout/Layout";
import ProductServices from "@services/ProductServices";
import ProductCard from "@components/product/ProductCard";
import HeroBanner from "@components/banner/HeroBanner";
import AttributeServices from "@services/AttributeServices";
import FounderStory from "@components/founder/FounderStory";
import HomeWhatsAppBand from "@components/home/HomeWhatsAppBand";
import HomeCategoryCircles from "@components/home/HomeCategoryCircles";
import HomeShopLatestCarousel from "@components/home/HomeShopLatestCarousel";
import HomeStoresGrid from "@components/home/HomeStoresGrid";
import HomeMarqueeStrip from "@components/home/HomeMarqueeStrip";
import HomeTrustBadges from "@components/home/HomeTrustBadges";
import CategoryServices from "@services/CategoryServices";
import { mergeHomepage } from "@utils/homepageDefaults";




/* ── Main Page ── */
const Home = ({
  popularProducts,
  bestSellingProducts,
  attributes,
  categories,
  allProducts,
  homepage: homepageProp,
}) => {
  const { t } = useTranslation("common");
  const homepage = mergeHomepage(homepageProp);
  const videoShopping = homepage.videoShopping || {};

  const newArrivals = popularProducts || [];
  const catalog = allProducts?.length ? allProducts : newArrivals;

  // Unique products for reel section — trending picks first, then fallback
  const reelProducts = (() => {
    const trending = (bestSellingProducts || []).filter((p) => p?._id || p?.slug);
    if (trending.length > 0) return trending;

    const merged = [...(popularProducts || []), ...(allProducts || []), ...(catalog || [])];
    const seen = new Set();
    return merged.filter((p) => {
      const id = p?._id || p?.slug;
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  })();

  // Per-category product counts (matched by category id), keyed by slug
  const productsOfCategory = (c) =>
    catalog.filter((p) => {
      const ids = Array.isArray(p?.categories)
        ? p.categories.map((x) => (typeof x === "string" ? x : x?._id))
        : [];
      const single = p?.category?._id || p?.category;
      return ids.includes(c._id) || single === c._id;
    });

  const categoryCounts = {};
  (categories || []).forEach((c) => {
    if (!c?.slug) return;
    categoryCounts[c.slug] = productsOfCategory(c).length;
  });

  // Real store categories for the circles — image comes from a product
  // of that category so it can never be broken.
  const circleCategories = (categories || [])
    .map((c) => {
      const catProducts = productsOfCategory(c);
      const firstImage =
        catProducts
          .map((p) => p?.featuredImage || p?.image?.[0] || p?.images?.[0])
          .find(Boolean) || null;
      return {
        slug: c?.slug,
        title: c?.name?.en || c?.name || "",
        image: firstImage,
        count: catProducts.length,
      };
    })
    .filter((c) => c.slug && c.title)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <Layout>
      <div className="min-h-screen bg-white text-[#111111] overflow-x-hidden">

        {/* 1 ── Hero */}
        <HeroBanner homepage={homepage} />

        <HomeWhatsAppBand whatsappNumbers={homepage.whatsappNumbers} />

        {/* 3 ── New Arrivals (exact ref layout) */}
        <section className="py-24 sm:py-28 bg-white border-b border-black/5">
          <div className="max-w-screen-2xl mx-auto px-6 sm:px-12 lg:px-16">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
              <div>
                <p className="text-[13px] text-neutral-500 text-center lg:text-left">
                  {t("Be the First to Try Our New Collection")}
                </p>
                <h2
                  className="text-4xl sm:text-5xl font-semibold text-[#111111]"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  {t("New Arrivals")}
                </h2>
                <p className="mt-4 text-sm text-[#7A7A7A] max-w-2xl font-light" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  {t("New season, new vibes, new arrivals – because you deserve the freshest picks.")}
                </p>
              </div>
              <Link
                href="/search"
                className="group inline-flex items-center gap-3 self-start lg:self-auto px-10 py-4 border border-[#111111] text-[#111111] text-[13px] sm:text-[14px] font-medium uppercase tracking-[0.18em] transition-all duration-300 hover:bg-[#111111] hover:text-white"
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                {newArrivals.slice(0, 8).map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    attributes={attributes}
                  />
                ))}
              </div>
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
                    {videoShopping.title ||
                      t("Shop from Anywhere, Anytime! Enjoy Live Video Shopping from 11 AM – 7 PM")}
                  </h3>
                  <p className="mt-3 text-xs sm:text-sm text-white/85">
                    {videoShopping.subtitle || t("Stylists On Call (English & Hindi)")}
                  </p>
                  <a
                    href={`https://wa.me/${videoShopping.whatsapp || "919891595929"}`}
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

        {/* 5 ── Shop By Categories (real store categories, circle avatars like ref) */}
        <HomeCategoryCircles categories={circleCategories} counts={categoryCounts} />

        {/* 6 ── Shop Latest Collection (reels-style product carousel like ref) */}
        <HomeShopLatestCarousel items={reelProducts.slice(0, 4)} />

        {/* 7 ── Scrolling marquee strip like ref */}
        <HomeMarqueeStrip phrases={homepage.marqueePhrases} />

        <FounderStory founder={homepage.founder} />

        <HomeTrustBadges />

        <HomeStoresGrid stores={homepage.stores} />



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
  const newArrivalsData = newArrivalsResult.status === "fulfilled" ? newArrivalsResult.value : null;

  return {
    props: {
      attributes: attributes || [],
      popularProducts: (newArrivalsData?.popularProducts && newArrivalsData.popularProducts.length > 0)
        ? newArrivalsData.popularProducts
        : (data?.popularProducts || []),
      bestSellingProducts: data?.bestSellingProducts || [],
      categories: categories || [],
      allProducts: allProducts || [],
      homepage: data?.manchandaHomepage || null,
    },
    revalidate: 1,
  };
};

export default Home;
