import React from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
import { ToastContainer } from "react-toastify";

import Navbar from "@layout/navbar/Navbar";
import Footer from "@layout/footer/Footer";
import NavBarTop from "./navbar/NavBarTop";
import useGetSetting from "@hooks/useGetSetting";
import useCartSync from "@hooks/useCartSync";
import { pickBrandLogo } from "@utils/brandAssets";

const MobileNavbar = dynamic(() => import("@layout/navbar/MobileNavbar"), {
  ssr: false,
});

const FloatingWhatsApp = dynamic(
  () => import("@components/common/FloatingWhatsApp"),
  { ssr: false }
);

const Layout = ({ title, description, children, hideMobileHeader }) => {
  const { storeCustomizationSetting, globalSetting } = useGetSetting();

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
      <Head>
        <title>{title ? `${siteTitle} | ${title}` : siteTitle}</title>
        <meta name="description" content={description || defaultDescription} />
        <link rel="icon" href={favicon} />
        <link rel="shortcut icon" href={favicon} />
        <link rel="apple-touch-icon" href={favicon} />
      </Head>

      <div className="font-sans text-[#3B2A25] bg-[#FAF7F5]">
        {!hideMobileHeader && <MobileNavbar />}

        <div
          id="site-header"
          className="hidden lg:block sticky top-0 z-[70] bg-[#FAF7F5] border-b border-[#E6D1CB] shadow-sm"
        >
          <NavBarTop />
          <Navbar />
        </div>

        <main>{children}</main>

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
