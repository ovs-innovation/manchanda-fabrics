import { useContext, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCart } from "react-use-cart";
import { FiAlignLeft, FiHeart, FiUser, FiShoppingBag, FiGlobe } from "react-icons/fi";
import { IoArrowBack, IoSearchOutline } from "react-icons/io5";

import LocationButton from "@components/location/LocationButton";
import SearchSuggestions from "@components/search/SearchSuggestions";
import { SidebarContext } from "@context/SidebarContext";
import { UserContext } from "@context/UserContext";
import CategoryDrawer from "@components/drawer/CategoryDrawer";
import useWishlist from "@hooks/useWishlist";
import useGetSetting from "@hooks/useGetSetting";
import { pickBrandLogo } from "@utils/brandAssets";
import { setAppLocale } from "@utils/locale";

const MobileNavbar = () => {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { toggleCategoryDrawer, toggleCartDrawer } = useContext(SidebarContext);
  const { state: userState } = useContext(UserContext);
  const { totalUniqueItems } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { globalSetting, storeCustomizationSetting } = useGetSetting();

  // Mobile search state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync searchText with URL query parameter
  useEffect(() => {
    if (router.query.query) setSearchText(router.query.query);
    else setSearchText("");
  }, [router.query.query]);

  // Close search when route changes
  useEffect(() => {
    setIsSearchOpen(false);
    setShowSuggestions(false);
  }, [router.asPath]);

  const handleSearchChange = (value) => {
    setSearchText(value);
    setShowSuggestions(value.length > 0);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const trimmedSearchText = searchText.trim();
    setShowSuggestions(false);
    searchInputRef.current?.blur();

    if (trimmedSearchText) {
      router
        .push(
          {
            pathname: "/search",
            query: { query: trimmedSearchText },
          },
          `/search?query=${encodeURIComponent(trimmedSearchText)}`,
          { shallow: false }
        )
        .then(() => {
          setSearchText("");
          setIsSearchOpen(false);
        })
        .catch(() => {
          window.location.href = `/search?query=${encodeURIComponent(trimmedSearchText)}`;
        });
    }
  };

  const currentLang = router.locale === "hi" ? "hi" : "en";
  const toggleLang = () =>
    setAppLocale(router, currentLang === "en" ? "hi" : "en");
  const userInfo = userState?.userInfo;
  const adminLogo = pickBrandLogo(
    globalSetting?.logo,
    storeCustomizationSetting?.navbar?.logo,
    storeCustomizationSetting?.seo?.favicon
  );
  const logo =
    adminLogo && adminLogo.startsWith("http") ? adminLogo : "/manchandalogo.png";

  if (!mounted) return null;

  return (
    <>
      <CategoryDrawer />
      <header className="lg:hidden sticky top-0 z-[70] h-[84px] bg-[#FAF7F5]/95 backdrop-blur-md border-b border-[#E6D1CB]/70 shadow-sm">
        <div className="relative h-full max-w-screen-2xl mx-auto px-2 xs:px-3 flex items-center justify-between">
          {isSearchOpen ? (
            <form
              onSubmit={handleSearchSubmit}
              className="relative flex items-center w-full h-[52px] bg-white border-2 border-[#E6D1CB]/60 rounded-full shadow-sm overflow-visible px-1"
            >
              <button
                type="button"
                onClick={() => {
                  setIsSearchOpen(false);
                  setShowSuggestions(false);
                }}
                className="text-[#3B2A25] p-2 hover:text-[#9C6A5A] transition-colors shrink-0"
                aria-label="Back"
              >
                <IoArrowBack size={22} />
              </button>
              <LocationButton className="h-full shrink-0" />
              <div className="flex-1 relative">
                <input
                  ref={searchInputRef}
                  autoFocus
                  type="text"
                  value={searchText}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Search sarees, suits, fabrics..."
                  className="w-full py-2 pl-3 pr-10 rounded-full bg-white focus:outline-none outline-none focus:ring-0 focus:border-transparent focus:shadow-none text-gray-700 text-sm"
                  onFocus={() => searchText.length > 0 && setShowSuggestions(true)}
                  onBlur={(e) => {
                    const relatedTarget = e.relatedTarget;
                    const suggestionsContainer = document.querySelector(
                      ".search-suggestions-container"
                    );
                    if (
                      !relatedTarget ||
                      (suggestionsContainer &&
                        !suggestionsContainer.contains(relatedTarget))
                    ) {
                      setTimeout(() => {
                        const activeElement = document.activeElement;
                        if (
                          !suggestionsContainer ||
                          !suggestionsContainer.contains(activeElement)
                        ) {
                          setShowSuggestions(false);
                        }
                      }, 200);
                    }
                  }}
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#9C6A5A] transition-colors"
                  aria-label="Search"
                >
                  <IoSearchOutline className="text-lg" />
                </button>
                <SearchSuggestions
                  searchText={searchText}
                  showSuggestions={showSuggestions}
                  onSelect={() => {
                    setSearchText("");
                    setShowSuggestions(false);
                    setIsSearchOpen(false);
                  }}
                  onClose={() => setShowSuggestions(false)}
                />
              </div>
            </form>
          ) : (
            <>
              {/* Left: menu + language */}
              <div className="flex items-center gap-0.5 z-10 w-[78px] xs:w-[84px] shrink-0">
                <button
                  type="button"
                  aria-label="Open menu"
                  onClick={toggleCategoryDrawer}
                  className="p-1.5 xs:p-2 text-[#3B2A25] hover:text-[#9C6A5A] transition-colors"
                >
                  <FiAlignLeft className="w-5 h-5" strokeWidth={1.75} />
                </button>
                <button
                  type="button"
                  onClick={toggleLang}
                  aria-label="Change language"
                  className="flex items-center gap-1 px-1 py-1 text-[#3B2A25] hover:text-[#9C6A5A] transition-colors"
                >
                  <FiGlobe className="w-4 h-4" strokeWidth={1.75} />
                  <span className="text-[11px] font-bold tracking-wide">
                    {currentLang === "en" ? "EN" : "हिं"}
                  </span>
                </button>
              </div>

              {/* Center — Manchanda logo */}
              <Link
                href="/"
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-auto flex items-center justify-center"
                aria-label="Manchanda Fabrics Home"
              >
                <img
                  src={logo}
                  alt="Manchanda Fabrics"
                  className="w-auto max-w-[130px] xs:max-w-[155px] object-contain object-center drop-shadow-sm transition-transform duration-200 active:scale-95"
                  style={{ height: "clamp(54px, calc(3.5vw + 40px), 68px)" }}
                  draggable="false"
                />
              </Link>

              {/* Right: search + wishlist + account + bag */}
              <div className="flex items-center gap-0.5 z-10 justify-end shrink-0">
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(true)}
                  aria-label="Search"
                  className="p-1.5 xs:p-2 text-[#3B2A25] hover:text-[#9C6A5A] transition-colors"
                >
                  <IoSearchOutline className="w-5 h-5" />
                </button>
                <Link
                  href="/wishlist"
                  aria-label="Wishlist"
                  className="relative p-1.5 xs:p-2 text-[#3B2A25] hover:text-[#9C6A5A] transition-colors"
                >
                  <FiHeart className="w-5 h-5" strokeWidth={1.75} />
                  {wishlistCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 min-w-[14px] h-3.5 px-0.5 text-[8px] font-bold text-white bg-[#9C6A5A] rounded-full flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
                {userInfo ? (
                  <Link href="/user/dashboard" className="p-1 xs:p-1.5 flex items-center justify-center" aria-label="Account">
                    {userInfo.image ? (
                      <img
                        src={userInfo.image}
                        alt={userInfo.name || "Account"}
                        className="w-6 h-6 xs:w-7 xs:h-7 rounded-full object-cover border border-[#E6D1CB]"
                      />
                    ) : (
                      <div className="flex h-6 w-6 xs:h-7 xs:w-7 items-center justify-center rounded-full border border-[#9C6A5A] bg-[#9C6A5A]/10 text-[#9C6A5A] text-[10px] xs:text-[11px] font-bold">
                        {userInfo.name ? userInfo.name[0].toUpperCase() : <FiUser className="w-3.5 h-3.5" />}
                      </div>
                    )}
                  </Link>
                ) : (
                  <Link
                    href="/auth/login"
                    className="p-1.5 xs:p-2 text-[#3B2A25] hover:text-[#9C6A5A] transition-colors"
                    aria-label="Login"
                  >
                    <FiUser className="w-5 h-5" strokeWidth={1.75} />
                  </Link>
                )}
                <button
                  type="button"
                  onClick={toggleCartDrawer}
                  aria-label="Shopping bag"
                  className="relative p-1.5 xs:p-2 text-[#3B2A25] hover:text-[#9C6A5A] transition-colors"
                >
                  <FiShoppingBag className="w-5 h-5" strokeWidth={1.75} />
                  {totalUniqueItems > 0 && (
                    <span className="absolute top-0.5 right-0.5 min-w-[14px] h-3.5 px-0.5 text-[8px] font-bold text-white bg-[#9C6A5A] rounded-full flex items-center justify-center">
                      {totalUniqueItems}
                    </span>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </header>
    </>
  );
};

export default MobileNavbar;
