/* ============================================================
   Navbar.js — Premium Luxury Boutique Header (90px height)
   ============================================================ */
import { useContext, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCart } from "react-use-cart";
import {
  Search,
  ShoppingBag,
  Menu,
  User,
  Package,
  LayoutDashboard,
  LogOut,
  ChevronDown,
  UserCheck,
} from "lucide-react";
import Cookies from "js-cookie";
import { signOut } from "next-auth/react";

import CartDrawer from "@components/drawer/CartDrawer";
import { SidebarContext } from "@context/SidebarContext";
import { UserContext } from "@context/UserContext";
import { setToken } from "@services/httpServices";
import { notifySuccess } from "@utils/toast";

import DesktopMenu from "@components/navbar/DesktopMenu";
import MobileMenu from "@components/navbar/MobileMenu";
import LanguageSwitcher from "@components/navbar/LanguageSwitcher";
import useTranslation from "next-translate/useTranslation";
import useGetSetting from "@hooks/useGetSetting";
import { pickBrandLogo } from "@utils/brandAssets";

const Navbar = () => {
  const router = useRouter();
  const { t } = useTranslation("common");
  const { toggleCartDrawer } = useContext(SidebarContext);
  const { totalUniqueItems } = useCart();
  const { storeCustomizationSetting, globalSetting } = useGetSetting();
  const { state: userState, dispatch } = useContext(UserContext);

  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const userInfo = userState?.userInfo;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    Cookies.remove("userInfo");
    Cookies.remove("couponInfo");
    Cookies.remove("shippingAddress");
    setToken(null);
    dispatch({ type: "USER_LOGOUT" });
    await signOut({ redirect: false });
    notifySuccess(t("Logged out successfully"));
    router.push("/");
  };

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

        {/* ── RIGHT: Search + User Profile / Login + Cart(count) ── */}
        <div className="flex items-center gap-5 lg:gap-6 shrink-0 text-[#111111] pr-4">
          <LanguageSwitcher />

          <Link
            href="/search"
            className="p-1 hover:text-[#111111]/70 transition-colors"
            aria-label="Search"
          >
            <Search size={20} strokeWidth={1.75} />
          </Link>

          {/* User Profile / Login Dropdown */}
          {mounted && userInfo ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 py-1 px-1.5 rounded-full hover:bg-neutral-50 transition-colors"
                aria-label="User profile menu"
                aria-expanded={dropdownOpen}
              >
                {userInfo?.image ? (
                  <img
                    src={userInfo.image}
                    alt={userInfo.name || "User"}
                    className="w-8 h-8 rounded-full object-cover border border-[#111111]/15 shadow-sm"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#111111] text-white flex items-center justify-center text-xs font-semibold uppercase tracking-wider">
                    {userInfo.name ? userInfo.name.charAt(0).toUpperCase() : <User size={15} />}
                  </div>
                )}
                <span
                  className="hidden xl:inline-block max-w-[90px] truncate text-[12px] tracking-[0.12em] font-medium uppercase text-[#111111]"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  {userInfo.name?.split(" ")[0] || t("Account")}
                </span>
                <ChevronDown
                  size={14}
                  className={`text-neutral-500 transition-transform duration-200 ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Luxury Dropdown Menu */}
              {dropdownOpen && (
                <div
                  className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-[0_12px_36px_rgba(0,0,0,0.12)] border border-neutral-100 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  {/* User info card */}
                  <div className="px-5 py-3 border-b border-neutral-100">
                    <p className="text-sm font-semibold text-[#111111] truncate">
                      {userInfo.name || t("Valued Customer")}
                    </p>
                    <p className="text-xs text-neutral-500 truncate mt-0.5">
                      {userInfo.email || userInfo.phone || ""}
                    </p>
                  </div>

                  {/* Navigation links */}
                  <div className="py-2">
                    <Link
                      href="/user/my-orders"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-5 py-2.5 text-xs uppercase tracking-wider font-medium text-neutral-700 hover:text-[#111111] hover:bg-neutral-50 transition-colors"
                    >
                      <Package size={16} className="text-neutral-500" />
                      <span>{t("My Orders")}</span>
                    </Link>

                    <Link
                      href="/user/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-5 py-2.5 text-xs uppercase tracking-wider font-medium text-neutral-700 hover:text-[#111111] hover:bg-neutral-50 transition-colors"
                    >
                      <LayoutDashboard size={16} className="text-neutral-500" />
                      <span>{t("Dashboard")}</span>
                    </Link>

                    <Link
                      href="/user/my-account"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-5 py-2.5 text-xs uppercase tracking-wider font-medium text-neutral-700 hover:text-[#111111] hover:bg-neutral-50 transition-colors"
                    >
                      <UserCheck size={16} className="text-neutral-500" />
                      <span>{t("My Account")}</span>
                    </Link>
                  </div>

                  {/* Logout */}
                  <div className="pt-2 border-t border-neutral-100">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-5 py-2.5 text-xs uppercase tracking-wider font-medium text-rose-600 hover:bg-rose-50 transition-colors text-left"
                    >
                      <LogOut size={16} />
                      <span>{t("Logout")}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="flex items-center gap-1.5 text-[12px] tracking-[0.14em] uppercase font-normal hover:text-[#111111]/70 transition-colors"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              <User size={18} strokeWidth={1.5} />
              <span>{t("Login")}</span>
            </Link>
          )}

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
