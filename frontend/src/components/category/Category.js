import { useContext, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
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
} from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";

//internal import
import Loading from "@components/preloader/Loading";
import { SidebarContext } from "@context/SidebarContext";
import CategoryServices from "@services/CategoryServices";
import useUtilsFunction from "@hooks/useUtilsFunction";
import { buildMobileCategoryMenu, getCategorySlug } from "@utils/categoryMenu";

const Category = () => {
  const { t } = useTranslation("common");
  const router = useRouter();
  const { categoryDrawerOpen, closeCategoryDrawer } =
    useContext(SidebarContext);
  const { showingTranslateValue } = useUtilsFunction();

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
                  ) : menuCategories.length === 0 ? (
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
                              {parentCategory?.icon && (
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
                                  {subcategory?.icon && (
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
      </div>
    </div>
  );
};

export default Category;
