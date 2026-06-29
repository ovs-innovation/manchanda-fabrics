import { useContext, useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { useCart } from "react-use-cart";
import { IoSearchOutline } from "react-icons/io5";
import { FiShoppingCart, FiHeart, FiUser } from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";

import { getUserSession } from "@lib/auth";
import useWishlist from "@hooks/useWishlist";
import useGetSetting from "@hooks/useGetSetting";
import useUtilsFunction from "@hooks/useUtilsFunction";
import CartDrawer from "@components/drawer/CartDrawer";
import { SidebarContext } from "@context/SidebarContext";
import CategoryServices from "@services/CategoryServices";
import SearchSuggestions from "@components/search/SearchSuggestions";
import LowerCategoryNavbar from "./LowerCategoryNavbar";
import CustomerNotificationBell from "@components/notification/CustomerNotificationBell";
import { pickBrandLogo } from "@utils/brandAssets";

const NavbarLogo = () => {
  return (
    <Link href="/" className="flex items-center shrink-0 relative ml-6 w-44 h-16" aria-label="Manchanda Fabrics">
      <img
        src="/logo/logo.png"
        alt="Manchanda Fabrics"
        className="absolute top-[50%] -translate-y-1/2 left-0 h-10 w-auto object-contain select-none z-10"
        draggable="false"
      />
    </Link>
  );
};

const Navbar = () => {
  const { showingTranslateValue } = useUtilsFunction();
  const router = useRouter();
  const { data: categoriesData } = useQuery({
    queryKey: ["category"],
    queryFn: async () => await CategoryServices.getShowingCategory(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const getLevel1Categories = (categories) => {
    if (!categories || !Array.isArray(categories) || categories.length === 0) return [];

    const homeRoot = categories.find(
      (cat) =>
        cat.id === "Root" ||
        showingTranslateValue(cat?.name)?.toLowerCase() === "home"
    );

    let topLevel = homeRoot?.children?.length ? homeRoot.children : categories;
    const finalCategories = [];
    topLevel.forEach((cat) => {
      finalCategories.push(cat);
    });
    return finalCategories;
  };

  const NAVBAR_ALLOWED = ["sarees", "suits", "fabrics"];
  const allCategories = getLevel1Categories(categoriesData);
  // Only show top-level categories whose slug exactly matches sarees, suits, fabrics
  const categories = allCategories.filter((cat) => {
    const slug = (cat?.slug || "").toLowerCase();
    const name = (showingTranslateValue ? showingTranslateValue(cat?.name) : (cat?.name?.en || cat?.name || "")).toLowerCase();
    return NAVBAR_ALLOWED.some((allowed) => slug === allowed || name === allowed || slug.startsWith(allowed) && !slug.includes("-"));
  }).slice(0, 2);

  const { toggleCartDrawer } = useContext(SidebarContext);
  const { totalUniqueItems } = useCart();
  const { count: wishlistCount } = useWishlist();
  const userInfo = getUserSession();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize from route to avoid "flash" on first paint.
  const initialShowSearch =
    router.pathname !== "/" || router.pathname === "/search";
  const [showSearchInNavbar, setShowSearchInNavbar] = useState(initialShowSearch);
  const [searchText, setSearchText] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef(null);

  const isHome = router.pathname === "/";
  const showNavbarSearch =
    !isHome || showSearchInNavbar || router.pathname === "/search";

  useEffect(() => {
    if (!isHome) {
      setShowSearchInNavbar(true);
      return;
    }

    // On the homepage the navbar keeps its initial state (category menu) for the
    // entire pinned hero experience, and only swaps to the search bar once the
    // full hero section has been scrolled past.
    const onScroll = () => {
      const heroEl = document.getElementById("hero-section");
      if (heroEl) {
        const rect = heroEl.getBoundingClientRect();
        setShowSearchInNavbar(rect.bottom <= 100);
      } else {
        setShowSearchInNavbar(false);
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [isHome, router.asPath]);

  useEffect(() => {
    if (router.pathname === "/search" && router.query.query) {
      setSearchText(router.query.query);
    }
  }, [router.pathname, router.query.query]);

  const handleSearchChange = (value) => {
    setSearchText(value);
    setShowSuggestions(value.length > 0);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const trimmed = searchText.trim();
    setShowSuggestions(false);
    searchInputRef.current?.blur();
    if (trimmed) {
      router
        .push(
          { pathname: "/search", query: { query: trimmed } },
          `/search?query=${encodeURIComponent(trimmed)}`,
          { shallow: false }
        )
        .then(() => setSearchText(""))
        .catch(() => {
          window.location.href = `/search?query=${encodeURIComponent(trimmed)}`;
        });
    }
  };

  return (
    <>
      <CartDrawer />
      {/* Promo Strip */}
      <div className="bg-[#9C6A5A] text-white py-2.5 text-center text-xs font-bold uppercase tracking-[0.2em] z-50 relative">
        Free Shipping on Orders Above ₹999 | COD Available
      </div>

      <header className="hidden lg:block bg-[#FAF7F5] text-[#3B2A25] border-b border-[#E6D1CB]/40 sticky top-0 z-50 shadow-sm">
        {/* Main Row: Logo + Categories + Search & Utilities */}
        <div className="max-w-screen-2xl mx-auto px-6 h-20 flex items-center justify-between gap-4">
          
          {/* Logo (left) */}
          <div className="flex items-center shrink-0 relative">
            <Link href="/" className="relative block w-64 h-20 select-none z-50" aria-label="Manchanda Fabrics">
              <img
                src="/manchandalogo.png"
                alt="Manchanda Fabrics"
                className="absolute top-[56%] -translate-y-1/2 left-0 h-64 min-h-[256px] w-auto object-contain select-none drop-shadow-sm transition-transform duration-200 hover:scale-105"
                draggable="false"
              />
            </Link>
          </div>

          {/* Centered Categories (center) */}
          <nav className="flex items-center gap-3 lg:gap-4 xl:gap-6 mx-2 whitespace-nowrap">
            <Link href="/search?category=sarees" className="font-bold uppercase tracking-widest text-xs text-[#3B2A25]/90 hover:text-[#9C6A5A] transition-colors py-2 border-b-2 border-transparent hover:border-[#9C6A5A] whitespace-nowrap">
              Sarees
            </Link>
            <Link href="/search?category=suits" className="font-bold uppercase tracking-widest text-xs text-[#3B2A25]/90 hover:text-[#9C6A5A] transition-colors py-2 border-b-2 border-transparent hover:border-[#9C6A5A] whitespace-nowrap">
              Suits
            </Link>
            <Link href="/search?category=fabrics" className="font-bold uppercase tracking-widest text-xs text-[#3B2A25]/90 hover:text-[#9C6A5A] transition-colors py-2 border-b-2 border-transparent hover:border-[#9C6A5A] whitespace-nowrap">
              Fabrics
            </Link>
            <Link href="/new-arrivals" className="font-bold uppercase tracking-widest text-xs text-[#3B2A25]/90 hover:text-[#9C6A5A] transition-colors py-2 border-b-2 border-transparent hover:border-[#9C6A5A] whitespace-nowrap">
              New Arrivals
            </Link>
            <Link href="/trending" className="font-bold uppercase tracking-widest text-xs text-[#3B2A25]/90 hover:text-[#9C6A5A] transition-colors py-2 border-b-2 border-transparent hover:border-[#9C6A5A] whitespace-nowrap">
              Best Sellers
            </Link>
            <Link href="/search?q=wedding" className="font-bold uppercase tracking-widest text-xs text-[#3B2A25]/90 hover:text-[#9C6A5A] transition-colors py-2 border-b-2 border-transparent hover:border-[#9C6A5A] whitespace-nowrap">
              Wedding Edit
            </Link>
            <Link href="/about-us" className="font-bold uppercase tracking-widest text-xs text-[#3B2A25]/90 hover:text-[#9C6A5A] transition-colors py-2 border-b-2 border-transparent hover:border-[#9C6A5A] whitespace-nowrap">
              About Us
            </Link>
            <Link href="/contact-us" className="font-bold uppercase tracking-widest text-xs text-[#3B2A25]/90 hover:text-[#9C6A5A] transition-colors py-2 border-b-2 border-transparent hover:border-[#9C6A5A] whitespace-nowrap">
              Contact
            </Link>
            <Link href="/search?discount=10" className="font-bold uppercase tracking-widest text-xs text-white bg-red-600 hover:bg-red-700 transition-colors px-2.5 py-1 rounded whitespace-nowrap">
              Sale
            </Link>
          </nav>

          {/* Right Section: Search & Utilities */}
          <div className="flex items-center gap-4 shrink-0">
            {/* Search Pill */}
            <div className="w-36 lg:w-40 xl:w-48 relative">
              <form onSubmit={handleSearchSubmit} className="relative w-full">
                <input
                  ref={searchInputRef}
                  type="search"
                  placeholder="Search..."
                  className="w-full py-1.5 pl-8 pr-4 text-xs bg-white border border-[#E6D1CB]/80 rounded-full focus:outline-none focus:border-[#9C6A5A] text-[#3B2A25] placeholder-neutral-400 focus:ring-1 focus:ring-[#9C6A5A]/20 transition-all"
                  value={searchText}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onFocus={() => searchText.trim().length > 0 && setShowSuggestions(true)}
                  onBlur={(e) => {
                    const relatedTarget = e.relatedTarget;
                    const suggestionsContainer = document.querySelector('.search-suggestions-container');
                    if (!relatedTarget || (suggestionsContainer && !suggestionsContainer.contains(relatedTarget))) {
                      setTimeout(() => {
                        const activeElement = document.activeElement;
                        if (!suggestionsContainer || !suggestionsContainer.contains(activeElement)) {
                          setShowSuggestions(false);
                        }
                      }, 200);
                    }
                  }}
                />
                <IoSearchOutline className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 text-sm" />
              </form>
              <SearchSuggestions
                searchText={searchText}
                showSuggestions={showSuggestions}
                onSelect={() => {
                  setSearchText("");
                  setShowSuggestions(false);
                }}
                onClose={() => setShowSuggestions(false)}
              />
            </div>

            {/* Utilities (Wishlist, Cart, Profile) */}
            <div className="flex items-center gap-2.5">
              <Link href="/wishlist" className="relative p-2 text-[#3B2A25] hover:text-[#9C6A5A] transition-colors" aria-label="Wishlist">
                <FiHeart className="text-xl" />
                {mounted && wishlistCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 min-w-[14px] h-3.5 text-[8px] font-bold text-white bg-[#9C6A5A] rounded-full border border-white flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <button type="button" onClick={toggleCartDrawer} className="relative p-2 text-[#3B2A25] hover:text-[#9C6A5A] transition-colors" aria-label="Cart">
                <FiShoppingCart className="text-xl" />
                {mounted && totalUniqueItems > 0 && (
                  <span className="absolute top-1.5 right-1.5 min-w-[14px] h-3.5 text-[8px] font-bold text-white bg-[#9C6A5A] rounded-full border border-white flex items-center justify-center">
                    {totalUniqueItems}
                  </span>
                )}
              </button>

              <div className="w-px h-5 bg-[#E6D1CB]/50 mx-1" />

              {mounted && userInfo?.image ? (
                <Link href="/user/dashboard">
                  <img
                    width={32}
                    height={32}
                    src={userInfo.image}
                    alt="Account"
                    className="rounded-full w-8 h-8 border border-[#E6D1CB] object-cover"
                  />
                </Link>
              ) : mounted && userInfo?.name ? (
                <Link
                  href="/user/dashboard"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#9C6A5A] text-white hover:bg-[#6F4A3D] transition-colors font-bold text-xs"
                >
                  {userInfo.name[0].toUpperCase()}
                </Link>
              ) : (
                <Link
                  href="/auth/login"
                  className="p-2 text-[#3B2A25] hover:text-[#9C6A5A] transition-colors flex items-center"
                  aria-label="Login"
                >
                  <FiUser className="text-xl" />
                </Link>
              )}
            </div>
          </div>

        </div>
      </header>
    </>
  );
};

export default Navbar;
