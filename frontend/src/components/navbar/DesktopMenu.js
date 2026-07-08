/* ============================================================
   DesktopMenu.js — Premium center-aligned luxury desktop nav
   ============================================================ */
"use client";
import NavLink from "./NavLink";
import CatalogDropdown from "./CatalogDropdown";
import useTranslation from "next-translate/useTranslation";

const DesktopMenu = ({ isTransparent }) => {
  const { t } = useTranslation("common");

  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      className="hidden lg:flex items-center gap-10"
    >
      <NavLink href="/" isTransparent={isTransparent}>{t("HOME")}</NavLink>

      <CatalogDropdown isTransparent={isTransparent} />

      <NavLink href="/new-arrivals" isTransparent={isTransparent}>{t("New Arrivals")}</NavLink>

      <NavLink href="/search" isTransparent={isTransparent}>{t("All Collections")}</NavLink>

      <NavLink href="/contact-us" isTransparent={isTransparent}>{t("Contact Us")}</NavLink>
    </nav>
  );
};

export default DesktopMenu;
