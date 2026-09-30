import React, { useMemo, useState, useContext } from "react";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { IoCheckmarkOutline } from "react-icons/io5";
import useTranslation from "next-translate/useTranslation";

import ProductServices from "@services/ProductServices";
import useCartDB from "@hooks/useCartDB";
import useUtilsFunction from "@hooks/useUtilsFunction";
import { SidebarContext } from "@context/SidebarContext";
import { notifySuccess } from "@utils/toast";
import { PRODUCT_PLACEHOLDER, normalizeProductImageUrl } from "@utils/brandAssets";

const SUIT_REGEX = /suit|salwar|kurta|kurtis?|set|anarkali|unstitched|stitched|dupatta|garara|sharara/i;

const CartRecommendations = ({ cartItems = [] }) => {
  const { t } = useTranslation("common");
  const router = useRouter();
  const { closeCartDrawer } = useContext(SidebarContext) || {};
  const { addItemWithDB } = useCartDB();
  const { showingTranslateValue, currency, formatPrice } = useUtilsFunction();

  const [addingId, setAddingId] = useState(null);
  const [addedId, setAddedId] = useState(null);

  // Fetch all active products (re-uses existing React Query cache)
  const { data: allProducts = [], isLoading } = useQuery({
    queryKey: ["products-showing"],
    queryFn: async () => await ProductServices.getShowingProducts(),
    staleTime: 5 * 60 * 1000,
  });

  // Calculate cart reference price (average of items in cart)
  const cartAvgPrice = useMemo(() => {
    if (!cartItems || cartItems.length === 0) return 3000;
    const sum = cartItems.reduce((acc, it) => acc + (Number(it.price) || 0), 0);
    return sum / cartItems.length;
  }, [cartItems]);

  // Set of IDs already in cart to exclude
  const cartProductIds = useMemo(() => {
    return new Set(
      cartItems.map((item) => {
        const idStr = String(item.id || item._id || "");
        return idStr.split("-")[0];
      })
    );
  }, [cartItems]);

  // Filter & rank top 4 to 5 recommendations (suits in similar price range or bestsellers)
  const recommendedProducts = useMemo(() => {
    if (!allProducts || !Array.isArray(allProducts) || allProducts.length === 0) {
      return [];
    }

    // 1. Exclude products already in cart & out of stock products
    const available = allProducts.filter((product) => {
      const pid = String(product._id || product.id || "");
      if (cartProductIds.has(pid)) return false;
      if (typeof product.stock === "number" && product.stock <= 0) return false;
      return true;
    });

    if (available.length === 0) return [];

    // 2. Score each product based on "suits" keyword, price similarity to cart, and bestsellers
    const scored = available.map((product) => {
      const titleStr =
        typeof product.title === "object"
          ? String(product.title?.en || Object.values(product.title || {})[0] || "")
          : String(product.title || "");
      const categoryStr = String(
        product.categoryName || product.categorySlug || product.category?.name?.en || ""
      );
      const isSuit = SUIT_REGEX.test(`${titleStr} ${categoryStr}`);

      const price = Number(product.prices?.price || product.price || 0);
      const originalPrice = Number(
        product.prices?.originalPrice || product.originalPrice || price
      );

      // Distance from cart average price
      const priceDiff = Math.abs(price - cartAvgPrice);
      const priceDiffRatio = cartAvgPrice > 0 ? priceDiff / cartAvgPrice : 1;

      // Higher score is better
      let score = 0;

      // Bonus for being a suit (as requested by client)
      if (isSuit) {
        score += 80;
      }

      // Bonus for price similarity: products within 35% price get up to 50 points
      if (priceDiffRatio <= 0.35) {
        score += Math.max(0, 50 - priceDiffRatio * 100);
      } else if (priceDiffRatio <= 0.7) {
        score += Math.max(0, 25 - priceDiffRatio * 30);
      }

      // Bonus for bestsellers / high sales count
      const salesCount = Number(product.sales || 0);
      if (salesCount > 0) {
        score += Math.min(30, salesCount * 2);
      }

      // Bonus for active discount
      if (originalPrice > price) {
        score += 10;
      }

      return {
        product,
        price,
        originalPrice,
        score,
        isSuit,
      };
    });

    // 3. Sort by score descending and take top 5
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 5).map((item) => item.product);
  }, [allProducts, cartProductIds, cartAvgPrice]);

  const handleProductClick = (product) => {
    if (closeCartDrawer) closeCartDrawer();
    if (product.slug) {
      router.push(`/product/${product.slug}`);
    }
  };

  const handleQuickAdd = async (e, product) => {
    e.stopPropagation();
    if (!product?._id) return;

    try {
      setAddingId(product._id);
      const effectivePrice =
        product.prices?.price ||
        product.prices?.salePrice ||
        product.price ||
        0;
      const originalPrice =
        product.prices?.originalPrice || effectivePrice;

      const itemToAdd = {
        ...product,
        id: product._id,
        title: showingTranslateValue(product.title),
        price: effectivePrice,
        originalPrice: originalPrice,
        image:
          product.image?.[0] ||
          product.images?.[0] ||
          PRODUCT_PLACEHOLDER,
        shippingCost:
          product.shippingCost !== undefined ? Number(product.shippingCost) : 0,
        isShippingFree: Boolean(product.isShippingFree),
        stock: product.stock ?? 10,
      };

      await addItemWithDB(itemToAdd, 1);

      setAddedId(product._id);
      setTimeout(() => {
        setAddedId(null);
      }, 2000);
    } catch (err) {
      console.error("Quick add failed:", err);
    } finally {
      setAddingId(null);
    }
  };

  if (isLoading && recommendedProducts.length === 0) {
    return (
      <div className="px-5 py-4 border-t border-neutral-100 bg-[#FAF7F5]/50">
        <div className="h-4 w-32 bg-neutral-200 rounded animate-pulse mb-3" />
        <div className="flex gap-2.5 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-[136px] min-w-[136px] h-48 bg-white rounded-lg border border-neutral-200 p-2 animate-pulse flex flex-col justify-between"
            >
              <div className="w-full aspect-square bg-neutral-100 rounded" />
              <div className="h-3 w-3/4 bg-neutral-100 rounded mt-2" />
              <div className="h-3 w-1/2 bg-neutral-100 rounded mt-1" />
              <div className="h-7 w-full bg-neutral-200 rounded mt-2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (recommendedProducts.length === 0) {
    return null;
  }

  return (
    <div className="pt-3 pb-2 border-t border-neutral-100 bg-[#FAF7F5]/30">
      {/* Header */}
      <div className="flex items-center justify-between px-5 mb-2.5">
        <h3
          className="font-bold text-xs uppercase tracking-[0.2em] text-[#111111] flex items-center gap-1.5"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          <span>{t("You May Also Like") || "You May Also Like"}</span>
        </h3>
        <span className="text-[10px] text-neutral-400 font-medium tracking-wider uppercase">
          {recommendedProducts.length} {t("items") || "items"}
        </span>
      </div>

      {/* Horizontal Scrollable Row */}
      <div className="px-5">
        <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none snap-x -mx-1 px-1">
          {recommendedProducts.map((product) => {
            const effectivePrice =
              product.prices?.price ||
              product.prices?.salePrice ||
              product.price ||
              0;
            const originalPrice =
              product.prices?.originalPrice || effectivePrice;
            const hasDiscount = originalPrice > effectivePrice;
            const discountPercent = hasDiscount
              ? Math.round(((originalPrice - effectivePrice) / originalPrice) * 100)
              : 0;
            const isAdded = addedId === product._id;
            const isAdding = addingId === product._id;

            return (
              <div
                key={product._id}
                className="w-[136px] min-w-[136px] max-w-[136px] bg-white border border-neutral-200/90 rounded-lg p-2 flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:border-neutral-400 transition-all snap-start select-none"
              >
                {/* Product Image & Title (Click to open details) */}
                <div
                  onClick={() => handleProductClick(product)}
                  className="cursor-pointer group flex flex-col flex-1"
                >
                  <div className="relative w-full aspect-square rounded overflow-hidden bg-[#FAF7F5] border border-black/5">
                    <img
                      src={normalizeProductImageUrl(
                        product.image?.[0] || product.images?.[0]
                      )}
                      alt={showingTranslateValue(product.title)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = PRODUCT_PLACEHOLDER;
                      }}
                    />
                    {hasDiscount && discountPercent > 0 && (
                      <span className="absolute top-1 left-1 bg-[#111111] text-white text-[9px] font-bold px-1.5 py-0.5 rounded tracking-tight">
                        {discountPercent}% OFF
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h4
                    title={showingTranslateValue(product.title)}
                    className="text-[11px] font-medium text-neutral-800 line-clamp-2 mt-2 leading-tight group-hover:text-black transition-colors"
                  >
                    {showingTranslateValue(product.title)}
                  </h4>
                </div>

                {/* Price & Add Button */}
                <div className="mt-2 pt-1 border-t border-neutral-100 flex flex-col gap-1.5">
                  <div className="flex items-baseline gap-1 flex-wrap">
                    <span className="text-xs font-bold text-[#111111]">
                      {currency}
                      {formatPrice(effectivePrice)}
                    </span>
                    {hasDiscount && (
                      <span className="text-[10px] text-neutral-400 line-through">
                        {currency}
                        {formatPrice(originalPrice)}
                      </span>
                    )}
                  </div>

                  {/* Small "+ Add" Button */}
                  <button
                    type="button"
                    onClick={(e) => handleQuickAdd(e, product)}
                    disabled={isAdding}
                    className={`w-full py-1.5 px-2 rounded text-[11px] font-bold tracking-wider uppercase flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer ${
                      isAdded
                        ? "bg-green-700 text-white border border-green-700"
                        : "bg-white hover:bg-[#111111] text-[#111111] hover:text-white border border-neutral-300 hover:border-[#111111]"
                    }`}
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    {isAdded ? (
                      <>
                        <IoCheckmarkOutline className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>{t("Added") || "Added"}</span>
                      </>
                    ) : (
                      <>
                        <span className="text-xs font-bold leading-none">+</span>
                        <span>{t("Add") || "Add"}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default React.memo(CartRecommendations);
