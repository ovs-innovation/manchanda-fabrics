/* ============================================================
   DesktopMenu.js — Premium center-aligned luxury desktop nav
   ============================================================ */
"use client";
import NavLink from "./NavLink";
import CatalogDropdown from "./CatalogDropdown";

const DesktopMenu = ({ isTransparent }) => {
  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      className="hidden lg:flex items-center gap-[42px]"
    >
      <NavLink href="/" isTransparent={isTransparent}>Home</NavLink>

      {/* Catalog with dropdown */}
      <CatalogDropdown isTransparent={isTransparent} />

      <NavLink href="/new-arrivals" isTransparent={isTransparent}>New Arrivals</NavLink>

      <NavLink href="/search" isTransparent={isTransparent}>All Collections</NavLink>

      <NavLink href="/contact-us" isTransparent={isTransparent}>Contact Us</NavLink>
    </nav>
  );
};

export default DesktopMenu;
