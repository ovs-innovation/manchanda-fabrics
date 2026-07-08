import { useContext, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCart } from "react-use-cart";
import { FiAlignLeft, FiHeart, FiUser, FiShoppingBag, FiGlobe } from "react-icons/fi";

import { getUserSession } from "@lib/auth";
import { SidebarContext } from "@context/SidebarContext";
import CategoryDrawer from "@components/drawer/CategoryDrawer";
import CartDrawer from "@components/drawer/CartDrawer";
import useWishlist from "@hooks/useWishlist";
import useGetSetting from "@hooks/useGetSetting";
import { pickBrandLogo } from "@utils/brandAssets";
import { setAppLocale } from "@utils/locale";

const MobileNavbar = () => {
  const router = useRouter();
  const { toggleCategoryDrawer, toggleCartDrawer } = useContext(SidebarContext);
  const { totalUniqueItems } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { globalSetting, storeCustomizationSetting } = useGetSetting();
  const currentLang = router.locale === "hi" ? "hi" : "en";
  const toggleLang = () =>
    setAppLocale(router, currentLang === "en" ? "hi" : "en");
  const userInfo = getUserSession();
  const adminLogo = pickBrandLogo(
    globalSetting?.logo,
    storeCustomizationSetting?.navbar?.logo,
    storeCustomizationSetting?.seo?.favicon
  );
  const logo =
    adminLogo && adminLogo.startsWith("http") ? adminLogo : "/manchandalogo.png";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <CategoryDrawer />
      <CartDrawer />
      <header className="lg:hidden sticky top-0 z-[70] h-[80px] bg-[#FAF7F5]/95 backdrop-blur-md border-b border-[#E6D1CB]/70 shadow-sm">
        <div className="relative h-full max-w-screen-2xl mx-auto px-3 flex items-center justify-between">
          {/* Left: menu + language */}
          <div className="flex items-center gap-0.5 z-10 w-[96px]">
            <button
              type="button"
              aria-label="Open menu"
              onClick={toggleCategoryDrawer}
              className="p-2 text-[#3B2A25] hover:text-[#9C6A5A] transition-colors"
            >
              <FiAlignLeft className="w-5 h-5" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={toggleLang}
              aria-label="Change language"
              className="flex items-center gap-1 px-1.5 py-1.5 text-[#3B2A25] hover:text-[#9C6A5A] transition-colors"
            >
              <FiGlobe className="w-5 h-5" strokeWidth={1.75} />
              <span className="text-[11px] font-bold tracking-wide">
                {currentLang === "en" ? "EN" : "हिं"}
              </span>
            </button>
          </div>

          {/* Center — Manchanda logo */}
          <Link
            href="/"
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-auto"
            aria-label="Manchanda Fabrics Home"
          >
            <img
              src={logo}
              alt="Manchanda Fabrics"
              className="w-auto max-w-[140px] object-contain object-center"
              style={{ height: "clamp(50px, calc(2.5vw + 40px), 64px)" }}
              draggable="false"
            />
          </Link>

          {/* Right: wishlist + account + bag */}
          <div className="flex items-center gap-0.5 z-10 w-[110px] justify-end">
            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className="relative p-2 text-[#3B2A25] hover:text-[#9C6A5A] transition-colors"
            >
              <FiHeart className="w-5 h-5" strokeWidth={1.75} />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-0.5 min-w-[14px] h-3.5 px-0.5 text-[8px] font-bold text-white bg-[#9C6A5A] rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>
            {userInfo?.image ? (
              <Link href="/user/dashboard" className="p-1.5" aria-label="Account">
                <img
                  src={userInfo.image}
                  alt="Account"
                  className="w-7 h-7 rounded-full object-cover border border-[#E6D1CB]"
                />
              </Link>
            ) : userInfo?.name ? (
              <Link
                href="/user/dashboard"
                className="flex h-7 w-7 items-center justify-center rounded-full border border-[#9C6A5A] text-[#9C6A5A] text-[10px] font-semibold"
                aria-label="Account"
              >
                {userInfo.name[0].toUpperCase()}
              </Link>
            ) : (
              <Link
                href="/auth/login"
                className="p-2 text-[#3B2A25] hover:text-[#9C6A5A] transition-colors"
                aria-label="Login"
              >
                <FiUser className="w-5 h-5" strokeWidth={1.75} />
              </Link>
            )}
            <button
              type="button"
              onClick={toggleCartDrawer}
              aria-label="Shopping bag"
              className="relative p-2 text-[#3B2A25] hover:text-[#9C6A5A] transition-colors"
            >
              <FiShoppingBag className="w-5 h-5" strokeWidth={1.75} />
              {totalUniqueItems > 0 && (
                <span className="absolute top-1 right-0.5 min-w-[14px] h-3.5 px-0.5 text-[8px] font-bold text-white bg-[#9C6A5A] rounded-full flex items-center justify-center">
                  {totalUniqueItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>
    </>
  );
};

export default MobileNavbar;
