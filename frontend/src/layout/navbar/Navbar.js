/* ============================================================
   Navbar.js — Premium Luxury Boutique Header (90px height)
   ============================================================ */
import { useContext, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCart } from "react-use-cart";
import { Search, Heart, ShoppingBag, User, Menu } from "lucide-react";

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

  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <CartDrawer />

      <div className="w-full bg-white h-[90px] px-8 lg:px-14 flex items-center justify-between relative">

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
              className="h-11 lg:h-13 w-auto object-contain"
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
                className="h-9 w-auto object-contain"
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

          {/* Wishlist */}
          <Link
            href="/wishlist"
            className="relative p-1 hover:text-[#C8A45D] transition-colors duration-200"
            aria-label="Wishlist"
          >
            <Heart size={21} strokeWidth={1.5} />
            {mounted && wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 text-[9px] font-bold text-white bg-[#C8A45D] rounded-full flex items-center justify-center px-1"
                style={{ fontFamily: "'Montserrat', sans-serif" }}>
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
                style={{ fontFamily: "'Montserrat', sans-serif" }}>
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
                style={{ fontFamily: "'Montserrat', sans-serif" }}
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
