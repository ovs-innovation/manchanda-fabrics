/* ============================================================
   MobileMenu.js — Slide-out mobile menu drawer
   ============================================================ */
"use client";
import React, { useState, useContext } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronDown,
  ChevronUp,
  User,
  Package,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import Cookies from "js-cookie";
import { signOut } from "next-auth/react";

import { UserContext } from "@context/UserContext";
import { setToken } from "@services/httpServices";
import { notifySuccess } from "@utils/toast";
import useTranslation from "next-translate/useTranslation";
import LanguageSwitcher from "@components/navbar/LanguageSwitcher";

const MOBILE_CATEGORIES = [
  { label: "Gaji Silk", slug: "gaji-silk" },
  { label: "Cotton Suits", slug: "cotton-suits" },
  { label: "Party Wear", slug: "party-wear" },
  { label: "Batik", slug: "batik" },
  { label: "Bangalori Silk Pure", slug: "bangalori-silk-pure" },
  { label: "Glace Cotton", slug: "glace-cotton" },
  { label: "New Arrivals", slug: "new-arrivals" },
];

const menuVariants = {
  closed: { x: "-100%", transition: { duration: 0.3, ease: "easeInOut" } },
  open: { x: 0, transition: { duration: 0.3, ease: "easeInOut" } },
};

const MobileMenu = ({ isOpen, onClose }) => {
  const router = useRouter();
  const [catalogOpen, setCatalogOpen] = useState(false);
  const { t } = useTranslation("common");
  const { state: userState, dispatch } = useContext(UserContext);
  const userInfo = userState?.userInfo;

  const handleLogout = async () => {
    onClose();
    Cookies.remove("userInfo");
    Cookies.remove("couponInfo");
    Cookies.remove("shippingAddress");
    setToken(null);
    dispatch({ type: "USER_LOGOUT" });
    await signOut({ redirect: false });
    notifySuccess(t("Logged out successfully"));
    router.push("/");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-50 lg:hidden"
          />

          {/* Drawer Panel */}
          <motion.div
            variants={menuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed top-0 left-0 bottom-0 w-[85vw] max-w-sm bg-white z-50 shadow-2xl p-6 lg:hidden flex flex-col justify-between font-sans overflow-y-auto"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            <div>
              {/* Header */}
              <div className="flex justify-between items-center pb-6 border-b border-neutral-100">
                <span className="text-[15px] tracking-[0.18em] uppercase text-[#111111] font-semibold" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  MANCHANDA FABRICS
                </span>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1 text-neutral-500 hover:text-[#E35353] transition-colors"
                  aria-label="Close menu"
                >
                  <X size={22} />
                </button>
              </div>

              {/* User Account Card */}
              {userInfo ? (
                <div className="mt-5 p-3.5 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-center gap-3">
                  {userInfo.image ? (
                    <img
                      src={userInfo.image}
                      alt={userInfo.name || "User"}
                      className="w-10 h-10 rounded-full object-cover border border-[#111111]/15"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#111111] text-white flex items-center justify-center font-bold text-sm uppercase">
                      {userInfo.name ? userInfo.name.charAt(0).toUpperCase() : <User size={16} />}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-[#111111] truncate uppercase tracking-wider">
                      {userInfo.name || t("My Account")}
                    </p>
                    <p className="text-[11px] text-neutral-500 truncate">
                      {userInfo.email || userInfo.phone || ""}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-5">
                  <Link
                    href="/auth/login"
                    onClick={onClose}
                    className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-[#111111] text-white rounded-xl text-xs font-semibold uppercase tracking-[0.16em] hover:bg-neutral-800 transition-colors"
                  >
                    <User size={16} />
                    <span>{t("Login / Sign Up")}</span>
                  </Link>
                </div>
              )}

              {/* Navigation List */}
              <nav className="mt-6 flex flex-col gap-5">
                {/* Logged in direct links */}
                {userInfo && (
                  <div className="pb-4 mb-2 border-b border-neutral-100 flex flex-col gap-4">
                    <Link
                      href="/user/my-orders"
                      onClick={onClose}
                      className="flex items-center gap-3 text-sm font-semibold tracking-[0.14em] uppercase text-[#111111] hover:text-[#9C6A5A] transition-colors"
                    >
                      <Package size={17} className="text-neutral-500" />
                      <span>{t("My Orders")}</span>
                    </Link>
                    <Link
                      href="/user/dashboard"
                      onClick={onClose}
                      className="flex items-center gap-3 text-sm font-semibold tracking-[0.14em] uppercase text-[#111111] hover:text-[#9C6A5A] transition-colors"
                    >
                      <LayoutDashboard size={17} className="text-neutral-500" />
                      <span>{t("Dashboard")}</span>
                    </Link>
                  </div>
                )}

                <Link
                  href="/"
                  onClick={onClose}
                  className="text-sm font-semibold tracking-[0.16em] uppercase text-[#111111] hover:text-[#111111] transition-colors"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  {t("HOME")}
                </Link>

                {/* Catalog Accordion */}
                <div className="flex flex-col">
                  <button
                    type="button"
                    onClick={() => setCatalogOpen((v) => !v)}
                    className="flex justify-between items-center text-sm font-semibold tracking-[0.16em] uppercase text-[#111111] hover:text-[#111111] transition-colors text-left w-full"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    <span>{t("Catalog")}</span>
                    {catalogOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>

                  <AnimatePresence>
                    {catalogOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden pl-4 flex flex-col gap-3.5 mt-3 border-l border-neutral-100"
                      >
                        {MOBILE_CATEGORIES.map((cat) => (
                          <Link
                            key={cat.slug}
                            href={
                              cat.slug === "new-arrivals"
                                ? "/new-arrivals"
                                : `/collections/${cat.slug}`
                            }
                            onClick={onClose}
                            className="text-xs font-medium tracking-[0.12em] uppercase text-neutral-500 hover:text-[#111111] transition-colors"
                            style={{ fontFamily: "'Poppins', sans-serif" }}
                          >
                            {t(cat.label)}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <Link
                  href="/new-arrivals"
                  onClick={onClose}
                  className="text-sm font-semibold tracking-[0.16em] uppercase text-[#111111] hover:text-[#111111] transition-colors"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  {t("New Arrivals")}
                </Link>

                <Link
                  href="/search"
                  onClick={onClose}
                  className="text-sm font-semibold tracking-[0.16em] uppercase text-[#111111] hover:text-[#111111] transition-colors"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  {t("View All Collections")}
                </Link>

                <Link
                  href="/contact-us"
                  onClick={onClose}
                  className="text-sm font-semibold tracking-[0.16em] uppercase text-[#111111] hover:text-[#111111] transition-colors"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  {t("Contact Us")}
                </Link>
              </nav>
            </div>

            {/* Footer */}
            <div className="pt-6 border-t border-neutral-100 flex flex-col gap-4 text-center">
              {userInfo && (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 py-2.5 text-xs font-semibold tracking-wider uppercase text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                >
                  <LogOut size={16} />
                  <span>{t("Logout")}</span>
                </button>
              )}

              {/* Language Switcher */}
              <LanguageSwitcher variant="mobile" onSelect={onClose} />

              <p className="text-[11px] tracking-widest text-neutral-400 uppercase">
                {t("Timeless Indian Heritage")}
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileMenu;
