import React from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
import { NextSeo } from "next-seo";
import { ToastContainer } from "react-toastify";

import Navbar from "@layout/navbar/Navbar";
import Footer from "@layout/footer/Footer";
import TopPromoBar from "@layout/navbar/TopPromoBar";
import useGetSetting from "@hooks/useGetSetting";
import useCartSync from "@hooks/useCartSync";
import { pickBrandLogo, getSocialShareImageUrl } from "@utils/brandAssets";

import { useRouter } from "next/router";

const MobileNavbar = dynamic(() => import("@layout/navbar/MobileNavbar"), {
  ssr: false,
});

const CartDrawer = dynamic(() => import("@components/drawer/CartDrawer"), {
  ssr: false,
});

const FloatingWhatsApp = dynamic(
  () => import("@components/common/FloatingWhatsApp"),
  { ssr: false }
);

const Layout = ({
  title,
  description,
  children,
  hideMobileHeader,
  image,
  ogType = "website",
  ogUrl,
  imageWidth,
  imageHeight,
}) => {
  const { storeCustomizationSetting, globalSetting } = useGetSetting();
  const router = useRouter();
  const isHome = router.pathname === "/";

  useCartSync();

  const siteTitle =
    storeCustomizationSetting?.seo?.meta_title ||
    globalSetting?.shop_name ||
    "Manchanda Fabrics";
  const favicon = pickBrandLogo(
    storeCustomizationSetting?.seo?.favicon,
    globalSetting?.logo,
    storeCustomizationSetting?.navbar?.logo
  );
  const defaultDescription =
    storeCustomizationSetting?.seo?.meta_description ||
    description ||
    "Manchanda Fabrics offers premium women's ethnic fashion. Curated Banarasi, silk, and cotton sarees, suits, and fabrics crafted for traditions and celebrations.";

  const siteUrl = "https://manchandafabric.in";
  const currentUrl =
    ogUrl ||
    (router?.asPath ? `${siteUrl}${router.asPath.split("?")[0]}` : siteUrl);

  const isProduct = ogType === "product";
  const shareWidth = imageWidth || (isProduct ? 800 : 1200);
  const shareHeight = imageHeight || (isProduct ? 1067 : 630);
  const shareImage = getSocialShareImageUrl(image, isProduct);

  const pageTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  const pageDescription = description || defaultDescription;

  if (globalSetting?.maintenance_mode) {
    return (
      <>
        <Head>
          <title>{siteTitle} | Maintenance</title>
          <link rel="icon" href={favicon} />
        </Head>
        <div className="min-h-screen flex items-center justify-center bg-[#FAF7F5] px-6 text-center">
          <div className="max-w-lg">
            <h1 className="text-3xl font-serif text-[#2B211E] mb-4">
              We&apos;ll be back soon
            </h1>
            <p className="text-[#2B211E]/70">
              {globalSetting?.maintenance_message ||
                "Manchanda Fabrics is undergoing scheduled maintenance. Please check back shortly."}
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* ── NextSeo overrides DefaultSeo for page-specific Open Graph / WhatsApp ── */}
      <NextSeo
        title={pageTitle}
        description={pageDescription}
        canonical={currentUrl}
        openGraph={{
          type: ogType,
          locale: "en_IN",
          url: currentUrl,
          title: title || siteTitle,
          description: pageDescription,
          site_name: siteTitle,
          images: [
            {
              url: shareImage,
              secureUrl: shareImage,
              width: shareWidth,
              height: shareHeight,
              alt: title || siteTitle,
              type: "image/jpeg",
            },
          ],
        }}
        twitter={{
          handle: "@manchandafabrics",
          site: "@manchandafabrics",
          cardType: "summary_large_image",
        }}
      />

      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} key="description" />
        <link rel="icon" href={favicon} />
        <link rel="shortcut icon" href={favicon} />
        <link rel="apple-touch-icon" href={favicon} />

        {/* ── Open Graph / WhatsApp / Facebook Preview Tags ── */}
        <meta property="og:type" content={ogType} key="og:type" />
        <meta property="og:site_name" content={siteTitle} key="og:site_name" />
        <meta property="og:url" content={currentUrl} key="og:url" />
        <meta property="og:title" content={title || siteTitle} key="og:title" />
        <meta property="og:description" content={pageDescription} key="og:description" />
        <meta property="og:image" content={shareImage} key="og:image" />
        <meta property="og:image:secure_url" content={shareImage} key="og:image:secure_url" />
        <meta property="og:image:type" content="image/jpeg" key="og:image:type" />
        <meta property="og:image:width" content={String(shareWidth)} key="og:image:width" />
        <meta property="og:image:height" content={String(shareHeight)} key="og:image:height" />
        <meta property="og:image:alt" content={title || siteTitle} key="og:image:alt" />

        {/* ── Twitter Card Tags ── */}
        <meta name="twitter:card" content="summary_large_image" key="twitter:card" />
        <meta name="twitter:title" content={title || siteTitle} key="twitter:title" />
        <meta name="twitter:description" content={pageDescription} key="twitter:description" />
        <meta name="twitter:image" content={shareImage} key="twitter:image" />
      </Head>

      <div className="font-sans text-[#3B2A25] bg-[#FAF7F5]">
        <CartDrawer />
        {!hideMobileHeader && <MobileNavbar />}

        <div
          id="site-header"
          style={{ transform: "translateY(0)" }}
          className="hidden lg:block fixed top-0 left-0 w-full z-50 transition-transform duration-400 ease-in-out bg-white border-b border-black/8 text-[#111111]"
        >
          <div className="flex flex-col">
            <TopPromoBar />
            <div className="h-[110px]">
              <Navbar />
            </div>
          </div>
        </div>

        <main className={`pt-0 ${isHome ? "lg:pt-[146px]" : "lg:pt-[175px]"}`}>{children}</main>

        <Footer />
        <FloatingWhatsApp />
      </div>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </>
  );
};

export default Layout;
