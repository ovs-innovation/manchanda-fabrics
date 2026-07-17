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
import Loading from "@components/preloader/Loading";
import ProductServices from "@services/ProductServices";
import ProductCard from "@components/product/ProductCard";
import { SidebarContext } from "@context/SidebarContext";
import AttributeServices from "@services/AttributeServices";
import CategoryServices from "@services/CategoryServices";
import FilterSidebar from "@components/category/FilterSidebar";
import FilterDrawer from "@components/drawer/FilterDrawer";
import useWishlist from "@hooks/useWishlist";

const CollectionsSlug = ({ products, attributes }) => {
  const { t } = useTranslation("common");
  const router = useRouter();
  const { slug } = router.query;

  const { isLoading, setIsLoading, toggleFilterDrawer } =
    useContext(SidebarContext);
  const [visibleProduct, setVisibleProduct] = useState(18);
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  const { totalItems } = useCart();
  const { count: wishlistCount } = useWishlist();
  const isSidebarAction = useRef(false);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setIsLoading(false);
    setMounted(true);
  }, [products, setIsLoading]);

  // Maintain local products state so we can refetch when query params change (sort/query etc.)
  const [initialProducts, setInitialProducts] = useState(products || []);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await CategoryServices.getShowingCategory();
        setCategories(res || []);
      } catch (err) {
        console.error("Error fetching categories in collections/[slug].js", err);
      }
    };
    fetchCats();
  }, []);

  const {
    setSortedField,
    productData,
    priceRange,
    setPriceRange,
    selectedCategories,
    setSelectedCategories,
    selectedRating,
    setSelectedRating,
    selectedDiscount,
    setSelectedDiscount,
    selectedColor,
    setSelectedColor,
    sortedField,
  } = useFilter(initialProducts, categories);

  useEffect(() => {
    setVisibleProduct(18);
  }, [sortedField, selectedCategories, router.query]);

  // Sync sort state from URL
  useEffect(() => {
    if (!router.isReady) return;
    const sortFromUrl = router.query.sort;
    const currentSort = sortedField || "All";
    if (sortFromUrl && sortFromUrl !== currentSort) {
      setSortedField(sortFromUrl);
    } else if (!sortFromUrl && currentSort !== "All") {
      setSortedField("All");
    } else if (!sortFromUrl && !currentSort) {
      setSortedField("All");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, router.query.sort, router.asPath]);

  const handleSortChange = (value) => {
    setSortedField(value);
    const newQuery = { ...router.query };
    if (value === "All" || value === "") delete newQuery.sort;
    else newQuery.sort = value;

    router.push(
      {
        pathname: router.asPath.split("?")[0],
        query: newQuery,
      },
      undefined,
      { shallow: false }
    );
  };

  useEffect(() => {
    const fetchByQuery = async () => {
      setIsLoading(true);
      try {
        const q = router.query.query;
        const response = await ProductServices.getShowingStoreProducts({
          category: "",
          title: q ? encodeURIComponent(q) : "",
        });

        if (response?.products) setInitialProducts(response.products);
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (router.isReady) {
      if (!isSidebarAction.current) {
        // Base category comes from slug; if _id is provided (from category drawer), prefer _id
        const id = router.query._id;
        if (id) setSelectedCategories([String(id)]);
        else if (slug) setSelectedCategories([String(slug)]);
        else setSelectedCategories([]);
      }
      isSidebarAction.current = false;
      fetchByQuery();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, slug, router.query.query, router.query._id]);

  // In collections pages, keep the base collection; only clear search query
  const clearSearchQuery = () => {
    if (router.query.query) {
      const newQuery = { ...router.query };
      delete newQuery.query;
      router.push(
        { pathname: router.asPath.split("?")[0], query: newQuery },
        undefined,
        { scroll: false, shallow: true }
      );
    }
  };

  const handleCategoryChange = (catIdOrIds) => {
    isSidebarAction.current = true;
    clearSearchQuery();

    if (catIdOrIds === "all") {
      if (slug) setSelectedCategories([String(slug)]);
      else setSelectedCategories([]);
      return;
    }

    if (Array.isArray(catIdOrIds)) {
      const idsToToggle = catIdOrIds;
      setSelectedCategories((prev) => {
        const anySelected = idsToToggle.some((id) => prev.includes(id));
        if (anySelected) return prev.filter((id) => !idsToToggle.includes(id));
        return [...prev, ...idsToToggle.filter((id) => !prev.includes(id))];
      });
    } else {
      const catId = catIdOrIds;
      setSelectedCategories((prev) =>
        prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
      );
    }
  };

  const handlePriceRangeChange = (newPriceRange) => {
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

  const handleColorChange = (color) => {
    isSidebarAction.current = true;
    clearSearchQuery();
    setSelectedColor(color);
  };

  const handleClearAll = () => {
    isSidebarAction.current = true;
    setPriceRange({ min: 0, max: 100000 });
    if (slug) setSelectedCategories([String(slug)]);
    else setSelectedCategories([]);
    setSelectedRating(0);
    setSelectedDiscount(0);
    setSelectedColor("");
    clearSearchQuery();
  };

  // Mobile search state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (router.query.query) setSearchText(router.query.query);
    else setSearchText("");
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
      const newQuery = { ...router.query, query: trimmedSearchText };
      router
        .push(
          { pathname: router.asPath.split("?")[0], query: newQuery },
          undefined,
          { shallow: false }
        )
        .then(() => {
          setSearchText("");
          setIsSearchOpen(false);
        })
        .catch((err) => {
          console.error("Navigation error:", err);
          window.location.href = `${router.asPath.split("?")[0]}?query=${encodeURIComponent(
            trimmedSearchText
          )}`;
        });
    }
  };

  const pageTitle = slug ? `${String(slug).replace(/-/g, " ")} | Collections` : "Collections";

  return (
    <Layout title={pageTitle} description="Collection page" hideMobileHeader={true}>
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-50 bg-white border-b border-[#E6D1CB]/50 px-4 py-3">
        {isSearchOpen ? (
          <form
            onSubmit={handleSearchSubmit}
            className="relative flex items-center bg-white border-2 border-[#E6D1CB]/60 rounded-full shadow-sm overflow-visible"
          >
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
            <LocationButton className="h-full" />

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
                    src="/manchandalogo.png"
                    alt="logo"
                    fill
                    className="object-contain"
                    sizes="32px"
                  />
                </div>
                <h1 className="text-lg font-semibold text-gray-800 capitalize truncate max-w-[160px]">
                  {slug ? String(slug).replace(/-/g, " ") : "Collections"}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-4 text-gray-700">
              <button onClick={() => setIsSearchOpen(true)}>
                <IoSearchOutline size={22} />
              </button>
              <button
                onClick={() => router.push("/wishlist")}
                className="relative"
              >
                <FiHeart size={22} />
                {mounted && wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#FAF7F5] text-[#3B2A25] text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </button>
              <button onClick={() => router.push("/cart")} className="relative">
                <FiShoppingCart size={22} />
                {mounted && totalItems > 0 && (
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

      {/* Desktop header */}
      <div className="hidden lg:block bg-white border-b border-neutral-100">
        <div className="max-w-screen-2xl mx-auto px-6 sm:px-10 lg:px-16 py-10">
          <p className="text-[12px] font-semibold tracking-[0.3em] uppercase text-neutral-400">
            {t("Catalog")}
          </p>
          <h1
            className="mt-3 text-4xl sm:text-5xl font-semibold text-[#111111] capitalize"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            {slug ? String(slug).replace(/-/g, " ") : t("Collections")}
          </h1>
          <p className="mt-4 text-sm text-neutral-500 max-w-2xl">
            {t("Browse the latest pieces in this collection and refine with filters.")}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-screen-2xl px-3 sm:px-6 lg:px-10">
        <div className="flex gap-6">
          <div className="hidden lg:block w-1/5 shrink-0">
            <FilterSidebar
              priceRange={priceRange}
              setPriceRange={handlePriceRangeChange}
              selectedCategories={selectedCategories}
              setSelectedCategories={handleCategoryChange}
              selectedRating={selectedRating}
              setSelectedRating={handleRatingChange}
              selectedDiscount={selectedDiscount}
              setSelectedDiscount={handleDiscountChange}
              selectedColor={selectedColor}
              setSelectedColor={handleColorChange}
              onClearAll={handleClearAll}
            />
          </div>

          <div className="w-full lg:w-3/4">
            <div className="w-full">
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
                    {t("sorryText") === "sorryText"
                      ? "Sorry, we could not find any products matching your search"
                      : t("sorryText")}
                  </h2>
                </div>
              ) : (
                <div className="hidden lg:flex justify-between items-center my-6 bg-white border border-[#E6D1CB]/60 rounded-xl p-4">
                  <h6 className="text-sm font-sans text-[#3B2A25] font-semibold">
                    {t("totalI")}{" "}
                    <span className="font-bold text-[#9C6A5A]">
                      {productData?.length}
                    </span>{" "}
                    {t("itemsFound")}
                  </h6>
                  <span className="text-sm font-sans">
                    <select
                      onChange={(e) => handleSortChange(e.target.value)}
                      value={sortedField}
                      className="py-2 pl-3 pr-8 text-xs font-sans font-bold block w-full rounded-lg border border-[#E6D1CB] bg-white text-[#3B2A25] cursor-pointer focus:ring-[#9C6A5A] focus:border-[#9C6A5A] focus:outline-none"
                    >
                      <option
                        className="bg-white text-[#3B2A25]"
                        value="All"
                        defaultValue
                        hidden
                      >
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
                      <option
                        className="bg-white text-[#3B2A25]"
                        value="best-selling"
                      >
                        Best Selling
                      </option>
                      <option
                        className="bg-white text-[#3B2A25]"
                        value="most-discounted"
                      >
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 py-8">
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
                      className="w-auto mx-auto md:text-sm leading-5 flex items-center transition ease-in-out duration-300 font-medium text-center justify-center border-0 border-transparent rounded-md focus-visible:outline-none focus:outline-none bg-[#FAF7F5] text-gray-700 px-5 md:px-6 lg:px-8 py-2 md:py-3 lg:py-3 hover:text-[#3B2A25] hover:bg-[#9C6A5A] h-12 mt-2 mb-10 text-sm lg:text-sm"
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

      <FilterDrawer
        priceRange={priceRange}
        setPriceRange={handlePriceRangeChange}
        selectedCategories={selectedCategories}
        setSelectedCategories={handleCategoryChange}
        selectedRating={selectedRating}
        setSelectedRating={handleRatingChange}
        selectedDiscount={selectedDiscount}
        setSelectedDiscount={handleDiscountChange}
        selectedColor={selectedColor}
        setSelectedColor={handleColorChange}
        onClearAll={handleClearAll}
      />

      {isSortModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-50 lg:hidden">
          <div className="bg-white w-full rounded-t-2xl p-6 animate-slide-up">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Sort By</h3>
              <button
                className="p-2 border border-store-400 rounded-lg"
                onClick={() => setIsSortModalOpen(false)}
              >
                <IoClose size={24} />
              </button>
            </div>
            <div className="space-y-4">
              {[
                ["Low", "Price: Low to High"],
                ["High", "Price: High to Low"],
                ["newest", "Latest"],
                ["best-selling", "Best Selling"],
                ["most-discounted", "Most Discounted"],
                ["All", "Default"],
              ].map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => {
                    handleSortChange(val);
                    setIsSortModalOpen(false);
                  }}
                  className={`w-full text-left py-2 px-4 rounded-lg ${
                    sortedField === val
                      ? "bg-[#FAF7F5] text-[#9C6A5A] font-semibold"
                      : "text-gray-700"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default CollectionsSlug;

export const getServerSideProps = async (context) => {
  const { query } = context.query;

  const [dataResult, attributesResult] = await Promise.allSettled([
    ProductServices.getShowingStoreProducts({
      category: "",
      title: query ? encodeURIComponent(query) : "",
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

