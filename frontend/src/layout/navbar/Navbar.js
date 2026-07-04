/* ============================================================
   Navbar.js — Premium Luxury Boutique Header (90px height)
   ============================================================ */
import { useContext, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCart } from "react-use-cart";
import { Search, Heart, ShoppingBag, User, Menu, ChevronDown, Globe } from "lucide-react";

import { getUserSession } from "@lib/auth";
import useWishlist from "@hooks/useWishlist";
import CartDrawer from "@components/drawer/CartDrawer";
import { SidebarContext } from "@context/SidebarContext";

import DesktopMenu from "@components/navbar/DesktopMenu";
import MobileMenu from "@components/navbar/MobileMenu";
import SearchBar from "@components/navbar/SearchBar";

const Navbar = () => {
  const { toggleCartDrawer } = useContext(SidebarContext);
  const { totalUniqueItems } = useCart();
  const { count: wishlistCount } = useWishlist();
  const userInfo = getUserSession();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);

  const handleMouseEnter = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    const id = setTimeout(() => {
      setDropdownOpen(false);
    }, 250);
    setTimeoutId(id);
  };

  useEffect(() => {
    setMounted(true);
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [timeoutId]);

  const handleLocaleChange = (newLocale) => {
    localStorage.setItem("locale", newLocale);
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
    document.cookie = `_lang=${newLocale}; path=/; max-age=31536000`;
    router.push(router.asPath, router.asPath, { locale: newLocale });
  };

  useEffect(() => {
    const savedLocale = localStorage.getItem("locale");
    if (savedLocale && savedLocale !== router.locale) {
      router.push(router.asPath, router.asPath, { locale: savedLocale });
    }
  }, []);

  return (
    <>
      <CartDrawer />

      <div className="w-full bg-white h-[110px] px-8 lg:px-14 flex items-center justify-between relative">

        {/* ── LEFT: Logo ── */}
        <div className="flex items-center gap-4">
          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 text-[#111111] hover:text-[#C8A45D] transition-colors"
            aria-label="Open menu"
          >
            <Menu size={22} strokeWidth={1.5} />
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center select-none shrink-0" aria-label="Manchanda Fabrics">
            <img
              src="/manchandalogo.png"
              alt="MANCHANDA FABRICS"
              className="h-15 lg:h-[76px] w-auto object-contain"
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
                src="/manchandalogo.png"
                alt="MANCHANDA FABRICS"
                className="h-13 w-auto object-contain"
                draggable="false"
              />
            </Link>
          </div>

          {/* Desktop nav */}
          <div className="hidden lg:block">
            <DesktopMenu />
          </div>
        </div>

        {/* ── RIGHT: Search, Wishlist, Cart, Account ── */}
        <div className="flex items-center gap-5 shrink-0 text-[#111111]">

          <SearchBar />

          {/* Language Switcher */}
          {mounted && (
            <div 
              className="relative mr-1"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E6D1CB]/60 rounded-full hover:border-[#9C6A5A] hover:text-[#C8A45D] transition-all text-xs font-semibold tracking-widest uppercase shadow-sm select-none"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                <Globe size={15} className="text-[#C8A45D]" />
                <span>{router.locale === "hi" ? "हिन्दी" : "English"}</span>
                <ChevronDown size={12} className={`transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>
              <div 
                className={`absolute right-0 mt-1 w-36 bg-white border border-[#E6D1CB]/40 shadow-xl rounded-xl py-1.5 z-50 transition-all duration-200 ease-out transform origin-top-right ${
                  dropdownOpen 
                    ? "opacity-100 translate-y-0 scale-100 pointer-events-auto" 
                    : "opacity-0 -translate-y-2 scale-95 pointer-events-none"
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    handleLocaleChange("en");
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wider hover:bg-[#FAF7F5] hover:text-[#C8A45D] transition-colors ${
                    router.locale === "en" ? "text-[#C8A45D] bg-[#FAF7F5]" : "text-[#3B2A25]"
                  }`}
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleLocaleChange("hi");
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wider hover:bg-[#FAF7F5] hover:text-[#C8A45D] transition-colors ${
                    router.locale === "hi" ? "text-[#C8A45D] bg-[#FAF7F5]" : "text-[#3B2A25]"
                  }`}
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  हिन्दी
                </button>
              </div>
            </div>
          )}

          {/* Wishlist */}
          <Link
            href="/wishlist"
            className="relative p-1 hover:text-[#C8A45D] transition-colors duration-200"
            aria-label="Wishlist"
          >
            <Heart size={21} strokeWidth={1.5} />
            {mounted && wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 text-[9px] font-bold text-white bg-[#C8A45D] rounded-full flex items-center justify-center px-1"
                style={{ fontFamily: "'Poppins', sans-serif" }}>
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart */}
          <button
            type="button"
            onClick={toggleCartDrawer}
            className="relative p-1 hover:text-[#C8A45D] transition-colors duration-200"
            aria-label="Shopping Cart"
          >
            <ShoppingBag size={21} strokeWidth={1.5} />
            {mounted && totalUniqueItems > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 text-[9px] font-bold text-white bg-[#C8A45D] rounded-full flex items-center justify-center px-1"
                style={{ fontFamily: "'Poppins', sans-serif" }}>
                {totalUniqueItems}
              </span>
            )}
          </button>

          {/* Account */}
          <div className="pl-4 border-l border-neutral-200">
            {mounted && userInfo?.image ? (
              <Link href="/user/dashboard">
                <img
                  width={32}
                  height={32}
                  src={userInfo.image}
                  alt="Account"
                  className="rounded-full w-8 h-8 object-cover border border-neutral-200 hover:border-[#C8A45D] transition-colors"
                />
              </Link>
            ) : mounted && userInfo?.name ? (
              <Link
                href="/user/dashboard"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#C8A45D] text-white hover:bg-[#a8833d] transition-colors text-[11px] font-bold"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                {userInfo.name[0].toUpperCase()}
              </Link>
            ) : (
              <Link
                href="/auth/login"
                className="p-1 hover:text-[#C8A45D] transition-colors flex items-center"
                aria-label="Login"
              >
                <User size={21} strokeWidth={1.5} />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Slide-out Mobile Menu Drawer */}
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>
  );
};

export default Navbar;
