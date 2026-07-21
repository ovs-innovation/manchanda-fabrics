/* ============================================================
   Navbar.js — Premium Luxury Boutique Header (90px height)
   ============================================================ */
import { useContext, useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "react-use-cart";
import { Search, ShoppingBag, Menu } from "lucide-react";

import CartDrawer from "@components/drawer/CartDrawer";
import { SidebarContext } from "@context/SidebarContext";

import DesktopMenu from "@components/navbar/DesktopMenu";
import MobileMenu from "@components/navbar/MobileMenu";
import LanguageSwitcher from "@components/navbar/LanguageSwitcher";
import useTranslation from "next-translate/useTranslation";
import useGetSetting from "@hooks/useGetSetting";
import { pickBrandLogo } from "@utils/brandAssets";

const Navbar = () => {
  const { t } = useTranslation("common");
  const { toggleCartDrawer } = useContext(SidebarContext);
  const { totalUniqueItems } = useCart();
  const { storeCustomizationSetting, globalSetting } = useGetSetting();

  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const adminLogo = pickBrandLogo(
    globalSetting?.logo,
    storeCustomizationSetting?.navbar?.logo
  );
  const logo = adminLogo || "/manchandalogo.png";

  return (
    <>
      <CartDrawer />

      <div className="w-full bg-white h-[110px] px-8 lg:px-14 flex items-center justify-between relative">

        {/* ── LEFT: Logo ── */}
        <div className="flex items-center gap-4 pl-6">
          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 text-[#111111] hover:text-[#111111] transition-colors"
            aria-label="Open menu"
          >
            <Menu size={22} strokeWidth={1.5} />
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center select-none shrink-0" aria-label="Manchanda Fabrics">
            <img
              src={logo}
              alt="MANCHANDA FABRICS"
              className="w-auto object-contain"
              style={{ height: "clamp(62px, 4.5vw, 68px)" }}
              draggable="false"
            />
          </Link>
        </div>

        {/* ── CENTER: Mobile logo / Desktop nav ── */}
        <div className="flex items-center justify-center flex-1">
          {/* Mobile center logo */}
          <div className="lg:hidden absolute left-1/2 -translate-x-1/2">
            <Link href="/" className="flex items-center select-none" aria-label="Manchanda Fabrics">
              <img
                src={logo}
                alt="MANCHANDA FABRICS"
                className="w-auto max-w-[165px] xs:max-w-[180px] object-contain drop-shadow-sm"
                style={{ height: "clamp(60px, calc(4vw + 44px), 72px)" }}
                draggable="false"
              />
            </Link>
          </div>

          {/* Desktop nav */}
          <div className="hidden lg:block">
            <DesktopMenu />
          </div>
        </div>

        {/* ── RIGHT: Search + Login + Cart(count) (Aisha-style) ── */}
        <div className="flex items-center gap-5 lg:gap-6 shrink-0 text-[#111111] pr-4">
          <LanguageSwitcher />

          <Link
            href="/search"
            className="p-1 hover:text-[#111111]/70 transition-colors"
            aria-label="Search"
          >
            <Search size={20} strokeWidth={1.75} />
          </Link>

          <Link
            href="/auth/login"
            className="text-[12px] tracking-[0.14em] uppercase font-normal hover:text-[#111111]/70 transition-colors"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            {t("Login")}
          </Link>

          <button
            type="button"
            onClick={toggleCartDrawer}
            className="inline-flex items-center gap-2 hover:text-[#111111]/70 transition-colors"
            aria-label="Cart"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            <ShoppingBag size={20} strokeWidth={1.75} />
            <span className="text-[12px] tracking-[0.14em] uppercase font-normal">
              ({mounted ? totalUniqueItems : 0})
            </span>
          </button>
        </div>
      </div>

      {/* Slide-out Mobile Menu Drawer */}
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>
  );
};

export default Navbar;
