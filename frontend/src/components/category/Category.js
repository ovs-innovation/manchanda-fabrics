import { useContext, useState, useEffect } from "react";
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
import useGetSetting from "@hooks/useGetSetting";
import Loading from "@components/preloader/Loading";
import { SidebarContext } from "@context/SidebarContext";
import CategoryServices from "@services/CategoryServices";
import CategoryCard from "@components/category/CategoryCard";
import useUtilsFunction from "@hooks/useUtilsFunction";

const Category = () => {
  const router = useRouter();
  const { categoryDrawerOpen, closeCategoryDrawer } = 
    useContext(SidebarContext);
  const { showingTranslateValue } = useUtilsFunction();
  const { storeCustomizationSetting } = useGetSetting();
  const storeColor = storeCustomizationSetting?.theme?.color || "green";

  const [activeTab, setActiveTab] = useState("category");
  const [expandedCategories, setExpandedCategories] = useState({});
  const [isMobile, setIsMobile] = useState(false);

  const toggleCategoryExpansion = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // Check if mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const { data: flatCategories, error, isLoading } = useQuery({
    queryKey: ["category"],
    queryFn: async () => await CategoryServices.getShowingCategory(),
  });

  const buildCategoryTree = (flatList) => {
    if (!flatList || !Array.isArray(flatList)) return [];
    
    const footwearId = flatList.find(c => c.name?.en === 'Footwear' || c._id === '6a33872af6601848fc56574b')?._id;
    const bagsId = flatList.find(c => c.name?.en === 'Bags' || c._id === '6a33872af6601848fc56574c')?._id;
    const homeId = flatList.find(c => c.name?.en === 'Home' || c._id === '6a33872af6601848fc56574a')?._id;

    const normalizedList = flatList.map(cat => {
      let parentId = cat.parentId;
      if (parentId === 'manchanda-footwear') {
        parentId = footwearId;
      } else if (parentId === 'manchanda-bags') {
        parentId = bagsId;
      } else if (parentId === 'manchanda-root') {
        parentId = homeId;
      }
      return { ...cat, parentId };
    });

    const map = {};
    const roots = [];
    
    normalizedList.forEach((cat) => {
      map[cat._id] = { ...cat, children: [] };
    });
    
    normalizedList.forEach((cat) => {
      const mapped = map[cat._id];
      const parentId = cat.parentId;
      
      if (parentId && map[parentId]) {
        map[parentId].children.push(mapped);
      } else {
        roots.push(mapped);
      }
    });
    
    return roots;
  };

  const data = buildCategoryTree(flatCategories);

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
                src="/logo.png"
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
            ) : (
              <div className="relative grid grid-cols-1 gap-2 p-4 pt-3">
                {data?.map((mainCategory) => (
                  <div key={mainCategory._id}>
                    {/* Main Categories - Direct display without parent */}
                    {mainCategory?.children?.length > 0 && (
                      <div className="border-b border-[#E6D1CB]/60 last:border-b-0">
                        {mainCategory.children.map((subcategory1) => (
                          <div key={subcategory1._id}>
                            <div 
                              className="flex items-center gap-3 px-3 py-3 text-xs font-black uppercase tracking-widest text-[#3B2A25] hover:bg-store-50 hover:text-[#9C6A5A] border-b border-[#E6D1CB]/30 transition-colors cursor-pointer"
                              onClick={() => toggleCategoryExpansion(subcategory1._id)}
                            >
                              {subcategory1?.icon ? (
                                <Image
                                  src={subcategory1.icon}
                                  alt={showingTranslateValue(subcategory1?.name)}
                                  width={20}
                                  height={20}
                                  className="object-contain flex-shrink-0"
                                />
                              ) : (
                                <div className="w-5 h-5 flex-shrink-0"></div>
                              )}
                              <span>
                                {showingTranslateValue(subcategory1?.name)}
                              </span>
                              {subcategory1?.children?.length > 0 && (
                                <div className="ml-auto">
                                  {expandedCategories[subcategory1._id] ? (
                                    <IoChevronDown className="text-gray-400 transition-transform duration-200" />
                                  ) : (
                                    <IoChevronForward className="text-gray-400 transition-transform duration-200" />
                                  )}
                                </div>
                              )}
                            </div>
                            
                            {/* Subcategories Level 2 - Collapsible */}
                            {subcategory1?.children?.length > 0 && expandedCategories[subcategory1._id] && (
                              <div className="bg-white rounded-md overflow-hidden my-1 border border-store-100">
                                {subcategory1.children.map((subcategory2) => (
                                  <div
                                    key={subcategory2._id}
                                    onClick={() => {
                                      const name = (subcategory2?.name?.en || subcategory2?.name)
                                        .toLowerCase()
                                        .replace(/[^A-Z0-9]+/gi, "-");
                                      router.push(`/search?category=${name}&_id=${subcategory2._id}`);
                                      closeCategoryDrawer();
                                    }}
                                    className="flex items-center gap-3 px-6 py-2.5 text-xs text-[#3B2A25]/70 hover:bg-store-50 hover:text-[#9C6A5A] transition-colors cursor-pointer border-b border-[#E6D1CB]/20 last:border-b-0"
                                  >
                                    {subcategory2?.icon ? (
                                      <Image
                                        src={subcategory2.icon}
                                        alt={showingTranslateValue(subcategory2?.name)}
                                        width={16}
                                        height={16}
                                        className="object-contain flex-shrink-0"
                                      />
                                    ) : (
                                      <div className="w-4 h-4 flex-shrink-0"></div>
                                    )}
                                    <span>
                                      {showingTranslateValue(subcategory2?.name)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Category;
