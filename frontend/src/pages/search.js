import React, { useContext, useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import useTranslation from "next-translate/useTranslation";
import { IoArrowBack, IoClose, IoSearchOutline } from "react-icons/io5";
import { FiHeart, FiShoppingCart, FiUser, FiFilter, FiList } from "react-icons/fi";
import { useCart } from "react-use-cart";
import LocationButton from "@components/location/LocationButton";
import SearchSuggestions from "@components/search/SearchSuggestions";

//internal import
import Layout from "@layout/Layout";
import useFilter from "@hooks/useFilter";
import Card from "@components/cta-card/Card";
import Loading from "@components/preloader/Loading";
import ProductServices from "@services/ProductServices";
import ProductCard from "@components/product/ProductCard";
import { SidebarContext } from "@context/SidebarContext";
import AttributeServices from "@services/AttributeServices";
import CategoryServices from "@services/CategoryServices";
import CategoryCarousel from "@components/carousel/CategoryCarousel";
import FilterSidebar from "@components/category/FilterSidebar";
import FilterDrawer from "@components/drawer/FilterDrawer";
import useWishlist from "@hooks/useWishlist";

const Search = ({ products, attributes }) => {
  const { t } = useTranslation("common");
  const router = useRouter();
  const { query } = router.query;
  const { isLoading, setIsLoading, toggleFilterDrawer } = useContext(SidebarContext);
  const [visibleProduct, setVisibleProduct] = useState(18);
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  const { totalItems } = useCart();
  const { count: wishlistCount } = useWishlist();
  const isSidebarAction = useRef(false);

  useEffect(() => {
    setIsLoading(false);
  }, [products, setIsLoading]);

  // Maintain local products state so we can refetch when query params change (category/_id etc.)
  const [initialProducts, setInitialProducts] = useState(products || []);
  const [categories, setCategories] = useState([]);

  // Fetch categories for useFilter name-based matching
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await CategoryServices.getShowingCategory();
        setCategories(res || []);
      } catch (err) {
        console.error("Error fetching categories in search.js", err);
      }
    };
    fetchCats();
  }, []);

  // Call useFilter hook FIRST to get sortedField and other values
  const {
    setSortedField,
    productData,
    selectedBrands,
    setSelectedBrands,
    priceRange,
    setPriceRange,
    selectedCategories,
    setSelectedCategories,
    selectedRating,
    setSelectedRating,
    selectedDiscount,
    setSelectedDiscount,
    sortedField,
  } = useFilter(initialProducts, categories);

  // Reset visible products when sort or filters change
  // This useEffect must come AFTER useFilter call
  useEffect(() => {
    setVisibleProduct(18);
  }, [sortedField, selectedBrands, selectedCategories, router.query]);

  // Sync sort state from URL when route is ready or query changes
  useEffect(() => {
    if (!router.isReady) return;
    
    const sortFromUrl = router.query.sort;
    const currentSort = sortedField || "All";
    
    // Only sync if URL value differs from current state (prevents loops)
    if (sortFromUrl && sortFromUrl !== currentSort) {
      setSortedField(sortFromUrl);
    } else if (!sortFromUrl && currentSort !== "All") {
      setSortedField("All");
    } else if (!sortFromUrl && !currentSort) {
      // Initial load - set default
      setSortedField("All");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, router.query.sort, router.asPath]);

  // Update URL when sort changes (called from UI)
  const handleSortChange = (value) => {
    // Update state immediately for instant UI feedback
    // This triggers useFilter to recalculate productData
    setSortedField(value);
    
    // Build query object preserving all existing params (id, brand, query, etc.)
    const newQuery = { ...router.query };
    if (value === "All" || value === "") {
      delete newQuery.sort;
    } else {
      newQuery.sort = value;
    }
    
    router.push(
      {
        pathname: "/search",
        query: newQuery,
      },
      undefined,
      { shallow: false }
    );
  };

  // Main synchronization useEffect for products and URL params
  useEffect(() => {
    const fetchByQuery = async () => {
      setIsLoading(true);
      try {
        const q = router.query.query;
        const brand = router.query.brand;

        // Fetch products without category constraint so client-side filters work on all items
        const response = await ProductServices.getShowingStoreProducts({
          category: "", 
          title: q ? encodeURIComponent(q) : "",
          brand: brand ? brand : "",
        });

        if (response?.products) {
          setInitialProducts(response.products);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (router.isReady) {
      // Initialize selectedCategories from URL on first load or URL changes
      // Skip this sync when the user is interacting with the sidebar (to avoid overwriting their selection)
      if (!isSidebarAction.current) {
        const catSlug = router.query.category;
        const id = router.query._id;
        
        if (catSlug) {
          setSelectedCategories([catSlug]);
        } else if (id) {
          setSelectedCategories([id]);
        } else {
          // No category in URL → show ALL (empty selection = all products in useFilter)
          setSelectedCategories([]);
        }
      }
      // Reset sidebar flag AFTER we've decided whether to sync categories
      isSidebarAction.current = false;
      fetchByQuery();
    }
  }, [router.isReady, router.query._id, router.query.category, router.query.query, router.query.brand]);

  // Clear search query and URL filters when sidebar filters are applied
  const clearSearchQuery = () => {
    // Check if any filtering params exist in URL that limit the initial data fetch
    if (
      router.query.query || 
      router.query._id || 
      router.query.category || 
      router.query.brand
    ) {
      const newQuery = { ...router.query };
      
      // Remove params that restrict the server-side product list
      delete newQuery.query;
      delete newQuery._id;
      delete newQuery.category;
      delete newQuery.brand;
      
      router.push(
        {
          pathname: "/search",
          query: newQuery,
        },
        undefined,
        { scroll: false, shallow: true }
      );
    }
  };

  // Wrapper functions that clear search query before applying filters
  const handleBrandChange = (brandId) => {
    isSidebarAction.current = true;
    clearSearchQuery();
    if (selectedBrands.includes(brandId)) {
      setSelectedBrands(selectedBrands.filter((id) => id !== brandId));
    } else {
      setSelectedBrands([...selectedBrands, brandId]);
    }
  };

  const handleCategoryChange = (catIdOrIds) => {
    isSidebarAction.current = true;
    clearSearchQuery();

    if (catIdOrIds === "all") {
      setSelectedCategories([]);
      return;
    }

    // Toggle logic
    if (Array.isArray(catIdOrIds)) {
      const idsToToggle = catIdOrIds;
      setSelectedCategories((prev) => {
        const anySelected = idsToToggle.some((id) => prev.includes(id));
        if (anySelected) {
          return prev.filter((id) => !idsToToggle.includes(id));
        } else {
          return [...prev, ...idsToToggle.filter((id) => !prev.includes(id))];
        }
      });
    } else {
      const catId = catIdOrIds;
      setSelectedCategories((prev) => 
        prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
      );
    }
  };

  const handlePriceRangeChange = (newPriceRange) => {
    // This function receives the full priceRange object from FilterSidebar
    isSidebarAction.current = true;
    clearSearchQuery();
    setPriceRange(newPriceRange);
  };

  const handleRatingChange = (rating) => {
    isSidebarAction.current = true;
    clearSearchQuery();
    setSelectedRating(rating);
  };

  const handleDiscountChange = (discount) => {
    isSidebarAction.current = true;
    clearSearchQuery();
    setSelectedDiscount(discount);
  };

  const handleClearAll = () => {
    isSidebarAction.current = true;
    setSelectedBrands([]);
    setPriceRange({ min: 0, max: 100000 });
    setSelectedCategories([]);
    setSelectedRating(0);
    setSelectedDiscount(0);
    clearSearchQuery();
  };

  // Mobile search state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef(null);

  // Sync searchText with URL query parameter
  useEffect(() => {
    if (router.query.query) {
      setSearchText(router.query.query);
    } else {
      setSearchText("");
    }
  }, [router.query.query]);


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
      router.push(
        {
          pathname: "/search",
          query: { ...router.query, query: trimmedSearchText },
        },
        `/search?query=${encodeURIComponent(trimmedSearchText)}`,
        { shallow: false }
      ).then(() => {
        setSearchText("");
        setIsSearchOpen(false);
      }).catch((err) => {
        console.error("Navigation error:", err);
        window.location.href = `/search?query=${encodeURIComponent(trimmedSearchText)}`;
      });
    }
  };


  return (
    <Layout title="Search" description="This is search page" hideMobileHeader={true}>
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-50 bg-white border-b border-[#E6D1CB]/50 px-4 py-3">
        {isSearchOpen ? (
          <form onSubmit={handleSearchSubmit} className="relative flex items-center bg-white border-2 border-[#E6D1CB]/60 rounded-full shadow-sm overflow-visible">
            <button 
              type="button" 
              onClick={() => {
                setIsSearchOpen(false);
                setShowSuggestions(false);
              }} 
              className="text-gray-700 px-3"
            >
              <IoArrowBack size={24} />
            </button>
            {/* Location Button */}
            <LocationButton className="h-full" />
            
            {/* Search Input */}
            <div className="flex-1 relative">
              <input
                ref={searchInputRef}
                autoFocus
                type="text"
                value={searchText}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search sarees, suits, fabrics..."
                className="w-full py-2.5 pl-4 pr-12 rounded-full bg-white focus:outline-none outline-none focus:ring-0 focus:border-transparent focus:shadow-none text-gray-700 text-sm"
                onFocus={() => searchText.length > 0 && setShowSuggestions(true)}
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
              <button 
                type="submit" 
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#9C6A5A] transition-colors"
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => router.back()} className="text-gray-700">
                <IoArrowBack size={24} />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 relative">
                  <Image
                    src="/logo.png"
                    alt="logo"
                    fill
                    className="object-contain"
                    sizes="32px"
                  />
                </div>
                <h1 className="text-lg font-semibold text-gray-800 capitalize truncate max-w-[120px]">
                  {query || "Search"}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-4 text-gray-700">
              <button onClick={() => setIsSearchOpen(true)}>
                <IoSearchOutline size={22} />
              </button>
              <button onClick={() => router.push("/wishlist")} className="relative">
                <FiHeart size={22} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#FAF7F5] text-[#3B2A25] text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </button>
              <button onClick={() => router.push("/cart")} className="relative">
                <FiShoppingCart size={22} />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#FAF7F5] text-[#3B2A25] text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>
              <button onClick={() => router.push("/user/dashboard")}>
                <FiUser size={22} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Sort/Filter Bar */}
      <div className="lg:hidden sticky top-[57px] z-40 bg-white border-b border-[#E6D1CB]/50 flex divide-x divide-neutral-850">
        <button
          onClick={() => setIsSortModalOpen(true)}
          className="flex-1 py-3 flex items-center justify-center gap-2 text-sm font-semibold text-[#3B2A25] hover:text-[#9C6A5A] transition-colors"
        >
          <FiList size={18} />
          Sort
        </button>
        <button
          onClick={toggleFilterDrawer}
          className="flex-1 py-3 flex items-center justify-center gap-2 text-sm font-semibold text-[#3B2A25] hover:text-[#9C6A5A] transition-colors"
        >
          <FiFilter size={18} />
          Filter
        </button>
      </div>

      <div className="mx-auto max-w-screen-2xl px-3 sm:px-6 lg:px-10">
        <div className="flex gap-6">
          {/* Sidebar for Desktop */}
          <div className="hidden lg:block w-1/5 shrink-0">
            <FilterSidebar
              selectedBrands={selectedBrands}
              setSelectedBrands={handleBrandChange}
              priceRange={priceRange}
              setPriceRange={handlePriceRangeChange}
              selectedCategories={selectedCategories}
              setSelectedCategories={handleCategoryChange}
              selectedRating={selectedRating}
              setSelectedRating={handleRatingChange}
              selectedDiscount={selectedDiscount}
              setSelectedDiscount={handleDiscountChange}
              onClearAll={handleClearAll}
            />
          </div>

          <div className="w-full lg:w-3/4">
            <div className="w-full">
              <div className="w-full grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:gap-6">
                {/* <Card /> */}
              </div>
              {/* <div className="relative block">
                <CategoryCarousel />
              </div> */}
              {productData?.length === 0 ? (
                <div className="mx-auto p-5 my-5">
                  <Image
                    className="my-4 mx-auto"
                    src="/no-result.svg"
                    alt="no-result"
                    width={400}
                    height={380}
                  />
                  <h2 className="text-lg md:text-xl lg:text-2xl xl:text-2xl text-center mt-2 font-medium font-serif text-gray-600">
                    {t("sorryText") === "sorryText" ? "Sorry, we could not find any products matching your search" : t("sorryText")} 😞
                  </h2>
                </div>
              ) : (
                <div className="hidden lg:flex justify-between items-center my-3 bg-white border border-[#E6D1CB]/60 rounded-xl p-4 mb-6">
                  <h6 className="text-sm font-sans text-[#3B2A25] font-semibold">
                    {t("totalI")}{" "}
                    <span className="font-bold text-[#9C6A5A]">{productData?.length}</span>{" "}
                    {t("itemsFound")}
                  </h6>
                  <span className="text-sm font-sans">
                    <select
                      onChange={(e) => handleSortChange(e.target.value)}
                      value={sortedField}
                      className="py-2 pl-3 pr-8 text-xs font-sans font-bold block w-full rounded-lg border border-[#E6D1CB] bg-white text-[#3B2A25] cursor-pointer focus:ring-[#9C6A5A] focus:border-[#9C6A5A] focus:outline-none"
                    >
                      <option className="bg-white text-[#3B2A25]" value="All" defaultValue hidden>
                        {t("sortByPrice")}
                      </option>
                      <option className="bg-white text-[#3B2A25]" value="Low">
                        {t("lowToHigh")}
                      </option>
                      <option className="bg-white text-[#3B2A25]" value="High">
                        {t("highToLow")}
                      </option>
                      <option className="bg-white text-[#3B2A25]" value="newest">
                        Latest
                      </option>
                      <option className="bg-white text-[#3B2A25]" value="best-selling">
                        Best Selling
                      </option>
                      <option className="bg-white text-[#3B2A25]" value="most-discounted">
                        Most Discounted
                      </option>
                    </select>
                  </span>
                </div>
              )}

              {isLoading ? (
                <Loading loading={isLoading} />
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-5 gap-2 md:gap-3 lg:gap-3">
                    {productData?.slice(0, visibleProduct).map((product, i) => (
                      <ProductCard
                        key={i + 1}
                        product={product}
                        attributes={attributes}
                      />
                    ))}
                  </div>

                  {productData?.length > visibleProduct && (
                    <button
                      onClick={() => setVisibleProduct((pre) => pre + 10)}
                      className={`w-auto mx-auto md:text-sm leading-5 flex items-center transition ease-in-out duration-300 font-medium text-center justify-center border-0 border-transparent rounded-md focus-visible:outline-none focus:outline-none bg-[#FAF7F5] text-gray-700 px-5 md:px-6 lg:px-8 py-2 md:py-3 lg:py-3 hover:text-[#3B2A25] hover:bg-[#9C6A5A] h-12 mt-6 text-sm lg:text-sm`}
                    >
                      {t("loadMoreBtn")}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Drawer for Mobile */}
      <FilterDrawer
        selectedBrands={selectedBrands}
        setSelectedBrands={handleBrandChange}
        priceRange={priceRange}
        setPriceRange={handlePriceRangeChange}
        selectedCategories={selectedCategories}
        setSelectedCategories={handleCategoryChange}
        selectedRating={selectedRating}
        setSelectedRating={handleRatingChange}
        selectedDiscount={selectedDiscount}
        setSelectedDiscount={handleDiscountChange}
        onClearAll={handleClearAll}
      />

      {/* Sort Modal for Mobile */}
      {isSortModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-50 lg:hidden">
          <div className="bg-white w-full rounded-t-2xl p-6 animate-slide-up">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Sort By</h3>
              <button className="p-2 border border-store-400 rounded-lg" onClick={() => setIsSortModalOpen(false)}>
                <IoClose size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <button
                onClick={() => {
                  handleSortChange("Low");
                  setIsSortModalOpen(false);
                }}
                className={`w-full text-left py-2 px-4 rounded-lg ${
                  sortedField === "Low" ? "bg-[#FAF7F5] text-[#9C6A5A] font-semibold" : "text-gray-700"
                }`}
              >
                Price: Low to High
              </button>
              <button
                onClick={() => {
                  handleSortChange("High");
                  setIsSortModalOpen(false);
                }}
                className={`w-full text-left py-2 px-4 rounded-lg ${
                  sortedField === "High" ? "bg-[#FAF7F5] text-[#9C6A5A] font-semibold" : "text-gray-700"
                }`}
              >
                Price: High to Low
              </button>
              <button
                onClick={() => {
                  handleSortChange("newest");
                  setIsSortModalOpen(false);
                }}
                className={`w-full text-left py-2 px-4 rounded-lg ${
                  sortedField === "newest" ? "bg-[#FAF7F5] text-[#9C6A5A] font-semibold" : "text-gray-700"
                }`}
              >
                Latest
              </button>
              <button
                onClick={() => {
                  handleSortChange("best-selling");
                  setIsSortModalOpen(false);
                }}
                className={`w-full text-left py-2 px-4 rounded-lg ${
                  sortedField === "best-selling" ? "bg-[#FAF7F5] text-[#9C6A5A] font-semibold" : "text-gray-700"
                }`}
              >
                Best Selling
              </button>
              <button
                onClick={() => {
                  handleSortChange("most-discounted");
                  setIsSortModalOpen(false);
                }}
                className={`w-full text-left py-2 px-4 rounded-lg ${
                  sortedField === "most-discounted" ? "bg-[#FAF7F5] text-[#9C6A5A] font-semibold" : "text-gray-700"
                }`}
              >
                Most Discounted
              </button>
              <button
                onClick={() => {
                  handleSortChange("All");
                  setIsSortModalOpen(false);
                }}
                className={`w-full text-left py-2 px-4 rounded-lg ${
                  sortedField === "All" ? "bg-[#FAF7F5] text-[#9C6A5A] font-semibold" : "text-gray-700"
                }`}
              >
                Default
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Search;

export const getServerSideProps = async (context) => {
  const { query, brand } = context.query;

  const [dataResult, attributesResult] = await Promise.allSettled([
    ProductServices.getShowingStoreProducts({
      category: "", // Fetch all products to support full client-side category filtering
      title: query ? encodeURIComponent(query) : "",
      brand: brand ? brand : "",
    }),
    AttributeServices.getShowingAttributes({}),
  ]);

  const data = dataResult.status === "fulfilled" ? dataResult.value : null;
  const attributes =
    attributesResult.status === "fulfilled" ? attributesResult.value : [];

  return {
    props: {
      attributes: attributes || [],
      products: data?.products || [],
    },
  };
};
