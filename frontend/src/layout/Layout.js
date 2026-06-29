import React, { useState, useEffect } from "react";
import Head from "next/head";
import { ToastContainer } from "react-toastify";

//internal import

import Navbar from "@layout/navbar/Navbar";
import Footer from "@layout/footer/Footer";
import NavBarTop from "./navbar/NavBarTop";
import FooterTop from "@layout/footer/FooterTop";
import MobileFooter from "@layout/footer/MobileFooter";
import MobileBottomNavigation from "@layout/footer/MobileBottomNavigation";
import FeatureCard from "@components/feature-card/FeatureCard";
import useGetSetting from "@hooks/useGetSetting";
import { getPalette } from "@utils/themeColors";
import useCartSync from "@hooks/useCartSync";
import FloatingWhatsApp from "@components/common/FloatingWhatsApp";
import { pickBrandLogo } from "@utils/brandAssets";

const Layout = ({ title, description, children, hideMobileHeader }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const { storeCustomizationSetting, globalSetting } = useGetSetting();
  const storeColor = storeCustomizationSetting?.theme?.color || "green";
  const palette = getPalette(storeColor);

  // Sync cart with backend
  useCartSync();

  // Get dynamic title and favicon from settings
  const siteTitle = storeCustomizationSetting?.seo?.meta_title || globalSetting?.shop_name || "Manchanda Fabrics";
  const favicon = pickBrandLogo(
    storeCustomizationSetting?.seo?.favicon,
    globalSetting?.logo,
    storeCustomizationSetting?.navbar?.logo
  );
  const defaultDescription = storeCustomizationSetting?.seo?.meta_description || description || "Manchanda Fabrics offers premium women's ethnic fashion. Curated Banarasi, silk, and cotton sarees, suits, and fabrics crafted for traditions and celebrations.";

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
        {/* Mobile header bar (fixed) */}
        <div>
          {mounted && !hideMobileHeader && <MobileFooter />}
        </div>

        {/* Mobile Bottom Navigation */}
        <div>
          {mounted && !hideMobileHeader && <MobileBottomNavigation />}
        </div>

        <div className={`${hideMobileHeader ? "pt-0" : "pt-16"} lg:pt-0 lg:mt-0 pb-16 lg:pb-0`}>
          {/* Desktop: one sticky header — top bar + navbar + categories shift on scroll */}
          {mounted ? (
            <div id="site-header" className="hidden lg:block sticky top-0 z-[70] bg-[#FAF7F5] border-b border-[#E6D1CB] shadow-sm">
              <NavBarTop />
              <Navbar />
            </div>
          ) : (
            <div id="site-header" className="hidden lg:block sticky top-0 z-[70] bg-[#FAF7F5] border-b border-[#E6D1CB] shadow-sm h-20" />
          )}
          {children}
        </div>
        <div className="w-full">
          {mounted ? (
            <div className="w-full">
              <Footer />
            </div>
          ) : (
            <div className="w-full h-40 bg-[#FAF7F5]" />
          )}
        </div>
        <div>
          {mounted && <FloatingWhatsApp />}
        </div>
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
