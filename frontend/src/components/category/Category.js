import { useContext, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import useTranslation from "next-translate/useTranslation";
import { IoClose, IoChevronDown, IoChevronForward } from "react-icons/io5";
import {
  FiHome,
  FiGrid,
  FiLayers,
  FiHeart,
  FiUsers,
  FiPhoneCall,
  FiFileText,
  FiUser,
  FiLogOut,
} from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";

//internal import
import Loading from "@components/preloader/Loading";
import { SidebarContext } from "@context/SidebarContext";
import { UserContext } from "@context/UserContext";
import CategoryServices from "@services/CategoryServices";
import useUtilsFunction from "@hooks/useUtilsFunction";
import { buildMobileCategoryMenu, getCategorySlug } from "@utils/categoryMenu";
import { isRetiredMediaUrl } from "@utils/brandAssets";

const Category = () => {
  const { t } = useTranslation("common");
  const router = useRouter();
  const { categoryDrawerOpen, closeCategoryDrawer } =
    useContext(SidebarContext);
  const { state: userState, dispatch } = useContext(UserContext);
  const userInfo = userState?.userInfo;
  const { showingTranslateValue } = useUtilsFunction();

  const handleLogout = () => {
    Cookies.remove("userInfo");
    dispatch({ type: "USER_LOGOUT" });
    closeCategoryDrawer();
    router.push("/");
  };

  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});

  const toggleCategoryExpansion = (categoryId) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const { data: categories, error, isLoading } = useQuery({
    queryKey: ["category"],
    queryFn: async () => await CategoryServices.getShowingCategory(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const menuCategories = buildMobileCategoryMenu(categories, showingTranslateValue);

  const navigateToCategory = (category) => {
    const slug = getCategorySlug(category, showingTranslateValue);
    router.push(`/search?category=${slug}&_id=${category._id}`);
    closeCategoryDrawer();
  };

  const otherLinks = [
    { title: "My Orders", href: "/user/my-orders", icon: FiGrid },
    { title: "Favorite", href: "/wishlist", icon: FiHeart },
    { title: "About Us", href: "/about-us", icon: FiUsers },
    { title: "Contact Us", href: "/contact-us", icon: FiPhoneCall },
    { title: "Terms & Conditions", href: "/terms-and-conditions", icon: FiFileText },
  ];

  return (
    <div className="flex flex-col w-full h-full bg-[#FAF7F5] text-[#3B2A25] scrollbar-hide border-r border-[#E6D1CB]/60">
      {categoryDrawerOpen && (
        <div className="w-full flex justify-between items-center h-16 px-6 py-4 bg-[#FAF7F5] border-b border-[#E6D1CB]/60">
          <h2 className="font-semibold text-lg m-0 flex items-center">
            <Link href="/" className="flex items-center" onClick={closeCategoryDrawer}>
              <Image
                width={56}
                height={56}
                src="/manchandalogo.png"
                alt="logo"
                className="object-contain"
              />
            </Link>
          </h2>
          <button
            onClick={closeCategoryDrawer}
            className="flex text-xl items-center justify-center w-8 h-8 rounded-full bg-store-100 text-[#3B2A25]/70 hover:text-[#9C6A5A] p-2 focus:outline-none transition-all duration-200"
            aria-label="close"
          >
            <IoClose />
          </button>
        </div>
      )}

      <div className="w-full flex-1 overflow-y-auto">
        <nav className="px-5 py-4">
          <ul className="space-y-1">
            {/* 1. Home */}
            <li>
              <Link
                href="/"
                onClick={closeCategoryDrawer}
                className="flex items-center rounded-lg px-3 py-3 text-xs font-bold uppercase tracking-wider text-[#3B2A25]/90 hover:bg-white hover:text-[#9C6A5A] transition-all duration-150"
              >
                <FiHome className="flex-shrink-0 h-4 w-4 mr-3 text-[#9C6A5A]" />
                <span>{t("Home")}</span>
              </Link>
            </li>

            {/* 2. Category Dropdown */}
            <li>
              <button
                type="button"
                onClick={() => setCategoryDropdownOpen((prev) => !prev)}
                className={`w-full flex items-center justify-between rounded-lg px-3 py-3 text-xs font-bold uppercase tracking-wider transition-all duration-150 ${
                  categoryDropdownOpen
                    ? "bg-white text-[#9C6A5A] shadow-sm"
                    : "text-[#3B2A25]/90 hover:bg-white hover:text-[#9C6A5A]"
                }`}
              >
                <div className="flex items-center">
                  <FiLayers className="flex-shrink-0 h-4 w-4 mr-3 text-[#9C6A5A]" />
                  <span>{t("Category")}</span>
                </div>
                <IoChevronDown
                  className={`text-sm transition-transform duration-200 ${
                    categoryDropdownOpen ? "rotate-180 text-[#9C6A5A]" : "text-[#3B2A25]/50"
                  }`}
                />
              </button>

              {/* Sub-list of Categories */}
              {categoryDropdownOpen && (
                <div className="ml-5 pl-4 pr-2 py-2 my-1 border-l-2 border-[#9C6A5A]/30 space-y-1 animate-fadeIn">
                  {isLoading ? (
                    <div className="py-2 text-xs text-[#3B2A25]/60 flex items-center gap-2">
                      <Loading loading={true} />
                      <span>{t("Loading categories...")}</span>
                    </div>
                  ) : error ? (
                    <p className="text-xs text-red-500 py-1">
                      {error?.response?.data?.message || error?.message}
                    </p>
                  ) : (
                    <>
                      {/* View All Option */}
                      <Link
                        href="/search"
                        onClick={closeCategoryDrawer}
                        className="flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-bold uppercase tracking-wider text-[#9C6A5A] hover:bg-white hover:text-[#3B2A25] transition-colors group"
                      >
                        <div className="flex items-center gap-2.5">
                          <FiGrid className="w-4 h-4 flex-shrink-0 text-[#9C6A5A] group-hover:scale-110 transition-transform" />
                          <span>{t("View All")}</span>
                        </div>
                        <IoChevronForward className="text-xs text-[#9C6A5A]/60 group-hover:translate-x-0.5 transition-transform" />
                      </Link>

                      {menuCategories.length === 0 ? (
                        <p className="text-xs text-[#3B2A25]/60 py-2">{t("No categories found.")}</p>
                      ) : (
                        menuCategories.map((parentCategory) => {
                          const hasChildren = parentCategory.children?.length > 0;
                          const isExpanded = expandedCategories[parentCategory._id];

                          return (
                            <div key={parentCategory._id} className="rounded-md">
                              <div
                                className="flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-semibold uppercase tracking-wider text-[#3B2A25]/80 hover:bg-white hover:text-[#9C6A5A] transition-colors cursor-pointer"
                                onClick={() => {
                                  if (hasChildren) {
                                    toggleCategoryExpansion(parentCategory._id);
                                  } else {
                                    navigateToCategory(parentCategory);
                                  }
                                }}
                              >
                                <div className="flex items-center gap-2.5">
                                  {parentCategory?.icon && !isRetiredMediaUrl(parentCategory.icon) && (
                                    <Image
                                      src={parentCategory.icon}
                                      alt={showingTranslateValue(parentCategory?.name)}
                                      width={16}
                                      height={16}
                                      className="object-contain flex-shrink-0"
                                    />
                                  )}
                                  <span>{showingTranslateValue(parentCategory?.name)}</span>
                                </div>
                                {hasChildren && (
                                  <IoChevronDown
                                    className={`text-xs text-[#3B2A25]/50 transition-transform duration-200 ${
                                      isExpanded ? "rotate-180" : ""
                                    }`}
                                  />
                                )}
                              </div>

                              {hasChildren && isExpanded && (
                                <div className="ml-4 pl-3 py-1 space-y-1 border-l border-[#E6D1CB]">
                                  <button
                                    type="button"
                                    onClick={() => navigateToCategory(parentCategory)}
                                    className="w-full text-left px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-[#9C6A5A] hover:underline"
                                  >
                                    {t("All")} {showingTranslateValue(parentCategory?.name)}
                                  </button>
                                  {parentCategory.children.map((subcategory) => (
                                    <button
                                      key={subcategory._id}
                                      type="button"
                                      onClick={() => navigateToCategory(subcategory)}
                                      className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] font-medium text-[#3B2A25]/70 hover:text-[#9C6A5A] transition-colors text-left"
                                    >
                                      {subcategory?.icon && !isRetiredMediaUrl(subcategory.icon) && (
                                        <Image
                                          src={subcategory.icon}
                                          alt={showingTranslateValue(subcategory?.name)}
                                          width={14}
                                          height={14}
                                          className="object-contain flex-shrink-0"
                                        />
                                      )}
                                      <span>{showingTranslateValue(subcategory?.name)}</span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </>
                  )}
                </div>
              )}
            </li>

            {/* 3. Other Links (My Orders, Favorite, About Us, Contact Us, etc.) */}
            {otherLinks.map((item) => (
              <li key={item.title}>
                <Link
                  href={item.href}
                  onClick={closeCategoryDrawer}
                  className="flex items-center rounded-lg px-3 py-3 text-xs font-bold uppercase tracking-wider text-[#3B2A25]/90 hover:bg-white hover:text-[#9C6A5A] transition-all duration-150"
                >
                  <item.icon className="flex-shrink-0 h-4 w-4 mr-3 text-[#9C6A5A]" />
                  <span>{t(item.title)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Account / Sign in status */}
        <div className="p-4 mt-2 border-t border-[#E6D1CB]/60 bg-white/70">
          {userInfo?.token ? (
            <div className="space-y-2.5">
              <div className="flex items-center gap-3 px-1 py-1">
                {userInfo.image ? (
                  <img
                    src={userInfo.image}
                    alt={userInfo.name}
                    width={36}
                    height={36}
                    className="w-9 h-9 rounded-full object-cover border border-[#E6D1CB]"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-[#FAF7F5] border border-[#E6D1CB] flex items-center justify-center text-[#9C6A5A] font-bold text-sm">
                    {(userInfo.name || "U")[0]?.toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-[#3B2A25] truncate">
                    {userInfo.name || "Valued Customer"}
                  </p>
                  <p className="text-[11px] text-[#3B2A25]/60 truncate">
                    {userInfo.email || userInfo.phone || ""}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Link
                  href="/user/dashboard"
                  onClick={closeCategoryDrawer}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[#FAF7F5] border border-[#E6D1CB]/80 text-[11px] font-bold uppercase tracking-wider text-[#3B2A25] hover:border-[#9C6A5A] transition-all"
                >
                  <FiUser className="w-3.5 h-3.5 text-[#9C6A5A]" />
                  <span>Dashboard</span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-red-50 border border-red-200 text-[11px] font-bold uppercase tracking-wider text-red-600 hover:bg-red-100 transition-all cursor-pointer"
                >
                  <FiLogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          ) : (
            <Link
              href="/auth/login"
              onClick={closeCategoryDrawer}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#9C6A5A] text-white text-xs font-bold uppercase tracking-wider shadow-sm hover:bg-[#855749] transition-all active:scale-[0.99]"
            >
              <FiUser className="w-4 h-4" />
              <span>Sign In / Register</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Category;
