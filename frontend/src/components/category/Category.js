import { useContext, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { IoClose, IoChevronDown, IoChevronForward } from "react-icons/io5";
import {
  FiHome,
  FiGrid,
  FiShoppingBag,
  FiTag,
  FiHeart,
  FiShuffle,
  FiUsers,
  FiPhoneCall,
  FiHelpCircle,
  FiFileText,
  FiShield,
  FiBriefcase,
  FiRefreshCw,
  FiTruck,
} from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";

//internal import
import Loading from "@components/preloader/Loading";
import { SidebarContext } from "@context/SidebarContext";
import CategoryServices from "@services/CategoryServices";
import useUtilsFunction from "@hooks/useUtilsFunction";
import { buildMobileCategoryMenu, getCategorySlug } from "@utils/categoryMenu";

const Category = () => {
  const router = useRouter();
  const { categoryDrawerOpen, closeCategoryDrawer } = 
    useContext(SidebarContext);
  const { showingTranslateValue } = useUtilsFunction();

  const [activeTab, setActiveTab] = useState("category");
  const [expandedCategories, setExpandedCategories] = useState({});

  const toggleCategoryExpansion = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
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

  const mainLinks = [
    { title: "Home", href: "/", icon: FiHome },
    // { title: "Category", href: "/search", icon: FiGrid },
    // { title: "Products", href: "/search", icon: FiShoppingBag },
    // { title: "Top Offers", href: "/offer", icon: FiTag },
    { title: "My Orders", href: "/user/my-orders", icon: FiGrid },
    { title: "Favorite", href: "/wishlist", icon: FiHeart },
    { title: "Compare", href: "/compare", icon: FiShuffle },
    { title: "About Us", href: "/about-us", icon: FiUsers },
    { title: "Careers", href: "/careers", icon: FiBriefcase },
    { title: "Contact Us", href: "/contact-us", icon: FiPhoneCall },
    // { title: "FAQs", href: "/faq", icon: FiHelpCircle },
    { title: "Refund and Returns Policy", href: "/refund-and-return-policy", icon: FiRefreshCw },
    { title: "Shipping & Delivery Policy", href: "/shipping-and-delivery-policy", icon: FiTruck },
    { title: "Terms & Conditions", href: "/terms-and-conditions", icon: FiFileText },
    { title: "Privacy Policy", href: "/privacy-policy", icon: FiShield },
  ];

  return (
    <div className="flex flex-col w-full h-full bg-[#FAF7F5] text-[#3B2A25] cursor-pointer scrollbar-hide border-r border-[#E6D1CB]/60">
      {categoryDrawerOpen && (
        <div className="w-full flex justify-between items-center h-16 px-6 py-4 bg-[#FAF7F5] border-b border-[#E6D1CB]/60">
          <h2 className="font-semibold text-lg m-0 flex items-center">
            <Link href="/" className="flex items-center">
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
      <div className="w-full max-h-full overflow-y-auto">
        {/* Tabs */}
        <div className="flex border-b border-[#E6D1CB]/60 bg-white">
          <button
            onClick={() => setActiveTab("category")}
            className={`flex-1 py-4 text-center font-bold text-xs uppercase tracking-widest transition-colors duration-300 ${
              activeTab === "category"
                ? `text-[#9C6A5A] border-b-2 border-[#9C6A5A]`
                : "text-[#3B2A25]/60 hover:text-[#3B2A25]/85"
            }`}
          >
            Category
          </button>

          <button
            onClick={() => setActiveTab("pages")}
            className={`flex-1 py-4 text-center font-bold text-xs uppercase tracking-widest transition-colors duration-300 ${
              activeTab === "pages"
                ? `text-[#9C6A5A] border-b-2 border-[#9C6A5A]`
                : "text-[#3B2A25]/60 hover:text-[#3B2A25]/85"
            }`}
          >
            Pages
          </button>
        </div>

        {activeTab === "pages" ? (
          <nav className="px-6 py-3">
            <ul className="space-y-1">
              {mainLinks.map((item) => (
                <li key={item.title}>
                  <Link
                    href={item.href}
                    onClick={closeCategoryDrawer}
                    className="flex items-center rounded-md px-2 py-2 text-xs font-semibold uppercase tracking-wider text-[#3B2A25]/85 hover:bg-store-50 hover:text-[#9C6A5A] transition-all duration-150"
                  >
                    <item.icon className="flex-shrink-0 h-4 w-4 mr-3" />
                    <span>{item.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : (
          <>
            {isLoading ? (
              <Loading loading={isLoading} />
            ) : error ? (
              <p className="flex justify-center align-middle items-center m-auto text-xl text-red-500">
                {error?.response?.data?.message || error?.message}
              </p>
            ) : menuCategories.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-[#3B2A25]/60">
                No categories found.
              </p>
            ) : (
              <div className="relative grid grid-cols-1 gap-2 p-4 pt-3">
                {menuCategories.map((parentCategory) => {
                  const hasChildren = parentCategory.children?.length > 0;
                  const isExpanded = expandedCategories[parentCategory._id];

                  return (
                    <div key={parentCategory._id} className="border-b border-[#E6D1CB]/60 last:border-b-0">
                      <div
                        className="flex items-center gap-3 px-3 py-3 text-xs font-black uppercase tracking-widest text-[#3B2A25] hover:bg-store-50 hover:text-[#9C6A5A] transition-colors cursor-pointer"
                        onClick={() => {
                          if (hasChildren) {
                            toggleCategoryExpansion(parentCategory._id);
                          } else {
                            navigateToCategory(parentCategory);
                          }
                        }}
                      >
                        {parentCategory?.icon ? (
                          <Image
                            src={parentCategory.icon}
                            alt={showingTranslateValue(parentCategory?.name)}
                            width={20}
                            height={20}
                            className="object-contain flex-shrink-0"
                          />
                        ) : (
                          <div className="w-5 h-5 flex-shrink-0" />
                        )}
                        <span>{showingTranslateValue(parentCategory?.name)}</span>
                        {hasChildren && (
                          <div className="ml-auto">
                            {isExpanded ? (
                              <IoChevronDown className="text-gray-400" />
                            ) : (
                              <IoChevronForward className="text-gray-400" />
                            )}
                          </div>
                        )}
                      </div>

                      {hasChildren && isExpanded && (
                        <div className="bg-white rounded-md overflow-hidden my-1 border border-store-100">
                          <button
                            type="button"
                            onClick={() => navigateToCategory(parentCategory)}
                            className="w-full text-left px-6 py-2.5 text-xs font-semibold text-[#9C6A5A] hover:bg-store-50 border-b border-[#E6D1CB]/20"
                          >
                            Shop All
                          </button>
                          {parentCategory.children.map((subcategory) => (
                            <button
                              key={subcategory._id}
                              type="button"
                              onClick={() => navigateToCategory(subcategory)}
                              className="w-full flex items-center gap-3 px-6 py-2.5 text-xs text-[#3B2A25]/70 hover:bg-store-50 hover:text-[#9C6A5A] transition-colors border-b border-[#E6D1CB]/20 last:border-b-0"
                            >
                              {subcategory?.icon ? (
                                <Image
                                  src={subcategory.icon}
                                  alt={showingTranslateValue(subcategory?.name)}
                                  width={16}
                                  height={16}
                                  className="object-contain flex-shrink-0"
                                />
                              ) : (
                                <div className="w-4 h-4 flex-shrink-0" />
                              )}
                              <span>{showingTranslateValue(subcategory?.name)}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Category;
