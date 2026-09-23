import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { FiMinus, FiPlus, FiHeart } from "react-icons/fi";
import ProductImageGallery from "@components/product/ProductImageGallery";
import Price from "@components/common/Price";
import VariantList from "@components/variants/VariantList";
import { resolveColorHex } from "@utils/resolveColorHex";
import { isInWishlist, addToWishlist, removeFromWishlist } from "@lib/wishlist";
import { notifySuccess, notifyError } from "@utils/toast";

const AishaProductHero = ({
  product,
  dynamicTitle,
  dynamicDescription,
  productImages,
  currentImages,
  price,
  originalPrice,
  discount,
  currency,
  stock,
  variantTitle,
  selectVariant,
  selectVa,
  setValue,
  setSelectVa,
  setSelectVariant,
  lang,
  showingTranslateValue,
  getNumber,
  categoryName,
  categoryId,
  onAddToCart,
  quantity,
  onQuantityChange,
  selectedColorVar,
  setSelectedColorVar,
  t,
}) => {
  const title = dynamicTitle || showingTranslateValue(product?.title);
  const description =
    dynamicDescription || showingTranslateValue(product?.description);
  const sku = selectedColorVar?.sku || selectVariant?.sku || product?.sku || "—";

  const [wishlistActive, setWishlistActive] = useState(false);
  const [isAutoSliding, setIsAutoSliding] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  // Automatically slide through color variants one by one when page opens
  useEffect(() => {
    const variants = product?.colorVariants;
    if (!variants || variants.length <= 1) return;
    if (!isAutoSliding || isHovered) return;

    const interval = setInterval(() => {
      setSelectedColorVar((prev) => {
        if (!prev) return variants[0];
        const currentIndex = variants.findIndex((cv) => {
          if (prev._id && cv._id) return String(prev._id) === String(cv._id);
          return (
            prev.colorName &&
            cv.colorName &&
            prev.colorName.toLowerCase() === cv.colorName.toLowerCase()
          );
        });
        const nextIndex = (currentIndex + 1) % variants.length;
        return variants[nextIndex];
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [product?.colorVariants, isAutoSliding, isHovered, setSelectedColorVar]);

  useEffect(() => {
    if (product?._id) {
      setWishlistActive(isInWishlist(product._id));
    }
    const updateState = () => {
      if (product?._id) {
        setWishlistActive(isInWishlist(product._id));
      }
    };
    if (typeof window !== "undefined") {
      const WISHLIST_EVENT = "wishlist:changed";
      window.addEventListener(WISHLIST_EVENT, updateState);
      window.addEventListener("storage", updateState);
      return () => {
        window.removeEventListener(WISHLIST_EVENT, updateState);
        window.removeEventListener("storage", updateState);
      };
    }
  }, [product?._id]);

  const handleToggleWishlist = () => {
    if (!product?._id) return;
    if (wishlistActive) {
      const res = removeFromWishlist(product._id);
      if (res.ok) {
        setWishlistActive(false);
        notifySuccess("Removed from wishlist!");
      } else {
        notifyError("Failed to update wishlist!");
      }
    } else {
      const res = addToWishlist(product);
      if (res.ok) {
        setWishlistActive(true);
        notifySuccess("Added to wishlist!");
      } else {
        notifyError("Failed to update wishlist!");
      }
    }
  };

  const galleryImages = useMemo(() => {
    // 1. If currentImages has items, use them
    if (currentImages && currentImages.length > 0) return currentImages;
    // 2. If a color variant is selected, use only that variant's images
    if (selectedColorVar?.images && selectedColorVar.images.length > 0) return selectedColorVar.images;
    // 3. If product has color variants, use default or first variant's images
    if (product?.colorVariants && product.colorVariants.length > 0) {
      const targetVar =
        product.colorVariants.find(
          (cv) => cv.colorName?.toLowerCase() === product.defaultColorName?.toLowerCase()
        ) || product.colorVariants[0];
      if (targetVar?.images?.length > 0) return targetVar.images;
      if (product.featuredImage) return [product.featuredImage];
    }
    // 4. Fallback for non-variant products
    return productImages || [];
  }, [currentImages, selectedColorVar, product, productImages]);

  return (
    <div className="flex flex-col lg:flex-row gap-10 lg:gap-14">
      {/* Left — gallery */}
      <div
        className="w-full lg:w-[48%] xl:w-[46%]"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <ProductImageGallery
          variant="aisha"
          images={galleryImages}
          productTitle={title}
        />
      </div>

      {/* Right — buy box (Aisha style) */}
      <div className="w-full lg:w-[52%] xl:w-[54%] min-w-0">
        <h1
          className="text-2xl sm:text-3xl font-medium text-[#111111] leading-snug"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          {title}
        </h1>

        <div className="mt-5">
          <Price
            price={price > 0 ? price : getNumber(product?.prices?.price || 0)}
            product={product}
            currency={currency}
            discount={discount || product?.prices?.discount || 0}
            originalPrice={
              originalPrice > 0
                ? originalPrice
                : getNumber(product?.prices?.originalPrice || product?.prices?.price || 0)
            }
          />
        </div>

        <hr className="my-6 border-neutral-200" />

        {/* Color Variants */}
        {product.colorVariants && product.colorVariants.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <p
                className="text-sm font-medium text-[#111111]"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                Color: <span className="font-semibold text-neutral-800">{selectedColorVar?.colorName}</span>
              </p>
              {product.colorVariants.length > 1 && (
                <button
                  type="button"
                  onClick={() => setIsAutoSliding((prev) => !prev)}
                  className="text-xs text-neutral-600 hover:text-black flex items-center gap-1.5 transition-colors px-2.5 py-1 rounded-full bg-neutral-100 hover:bg-neutral-200 cursor-pointer"
                  title={isAutoSliding ? "Pause auto slide" : "Play auto slide"}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isAutoSliding ? "bg-emerald-500 animate-pulse" : "bg-neutral-400"}`} />
                  <span className="text-[11px] font-medium">{isAutoSliding ? "Auto-sliding colors" : "Paused • Click to slide"}</span>
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2.5">
              {product.colorVariants.map((colorVar, idx) => {
                const isSelected = (selectedColorVar?._id && colorVar?._id)
                  ? String(selectedColorVar._id) === String(colorVar._id)
                  : (selectedColorVar?.colorName && colorVar?.colorName && selectedColorVar.colorName.toLowerCase() === colorVar.colorName.toLowerCase());
                return (
                  <button
                    key={colorVar._id || colorVar.colorName || idx}
                    type="button"
                    onClick={() => {
                      setIsAutoSliding(false);
                      setSelectedColorVar(colorVar);
                    }}
                    className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all ${
                      isSelected
                        ? "border-[#111111] ring-2 ring-neutral-300 scale-105 shadow-sm"
                        : "border-neutral-300 hover:border-neutral-800 opacity-80 hover:opacity-100"
                    }`}
                    title={colorVar.colorName}
                  >
                    <span
                      className="w-7 h-7 rounded-full block border border-neutral-200/50 shadow-xs"
                      style={{ backgroundColor: resolveColorHex(colorVar.colorCode, colorVar.colorName) }}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Variants */}
        {variantTitle?.length > 0 && (
          <div className="space-y-5 mb-6">
            {variantTitle.map((a, i) => (
              <div key={a._id || i}>
                <p
                  className="text-sm font-medium text-[#111111] mb-2"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  {showingTranslateValue(a?.name)}
                </p>
                <VariantList
                  att={a._id}
                  lang={lang}
                  option={a.option}
                  setValue={setValue}
                  varTitle={variantTitle}
                  setSelectVa={setSelectVa}
                  variants={product.variants}
                  selectVariant={selectVariant}
                  setSelectVariant={setSelectVariant}
                />
              </div>
            ))}
          </div>
        )}

        {stock > 0 && stock <= 10 && (
          <p className="text-sm text-[#111111] mb-4">
            {t("Hurry")}, {stock} {t("item(s) left in stock!")}
          </p>
        )}
        {stock <= 0 && (
          <p className="text-sm text-red-600 mb-4 font-medium">{t("stockOut")}</p>
        )}

        {/* Quantity */}
        <div className="mb-6">
          <p
            className="text-sm font-medium text-[#111111] mb-2"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            {t("Quantity")}
          </p>
          <div className="inline-flex items-center border border-neutral-300">
            <button
              type="button"
              onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
              className="w-10 h-10 flex items-center justify-center hover:bg-neutral-50"
              aria-label="Decrease quantity"
            >
              <FiMinus size={16} />
            </button>
            <span className="w-12 text-center text-sm font-medium">{quantity}</span>
            <button
              type="button"
              onClick={() => onQuantityChange(quantity + 1)}
              className="w-10 h-10 flex items-center justify-center hover:bg-neutral-50"
              aria-label="Increase quantity"
            >
              <FiPlus size={16} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onAddToCart}
            disabled={stock <= 0}
            className="flex-1 h-12 bg-[#111111] text-white text-sm font-semibold uppercase tracking-[0.14em] hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            {stock <= 0 ? t("Sold Out") : t("Add to Cart")}
          </button>
          <button
            type="button"
            onClick={handleToggleWishlist}
            title={wishlistActive ? t("Remove from Wishlist") : t("Add to Wishlist")}
            aria-label={wishlistActive ? t("Remove from Wishlist") : t("Add to Wishlist")}
            className={`w-12 h-12 border flex items-center justify-center transition-all duration-200 cursor-pointer ${
              wishlistActive
                ? "bg-[#B0322F] border-[#B0322F] text-white hover:bg-[#8e2825]"
                : "border-neutral-300 text-neutral-700 hover:border-[#B0322F] hover:text-[#B0322F] bg-white"
            }`}
          >
            <FiHeart
              size={20}
              className={wishlistActive ? "fill-white text-white" : "transition-colors"}
            />
          </button>
        </div>

        <hr className="my-6 border-neutral-200" />

        <div className="space-y-2 text-sm text-neutral-600">
          <p>
            <span className="font-medium text-[#111111]">{t("Sku")}:</span> {sku}
          </p>
          <p>
            <span className="font-medium text-[#111111]">{t("Available")}:</span>{" "}
            {stock > 0 ? t("Available") : t("stockOut")}
          </p>
          <p>
            <span className="font-medium text-[#111111]">{t("Shipping")}:</span>{" "}
            <span className="text-neutral-700">{t("Calculated at checkout")}</span>
          </p>
          {categoryName && (
            <p>
              <span className="font-medium text-[#111111]">{t("category")}:</span>{" "}
              <Link
                href={`/collections/${categoryName}?_id=${categoryId}`}
                className="underline underline-offset-2 hover:text-[#111111]"
              >
                {categoryName}
              </Link>
            </p>
          )}
        </div>

        {description && (
          <div className="mt-8">
            <h2
              className="text-base font-semibold text-[#111111] mb-3"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              {t("Description")}
            </h2>
            <div className="text-sm text-neutral-600 leading-relaxed whitespace-pre-line">
              {String(description).replace(/<[^>]*>/g, "")}
            </div>
          </div>
        )}

        {/* Trust rows like Aisha */}
        <div className="mt-10 space-y-4 border-t border-neutral-200 pt-8">
          <div>
            <p className="text-sm font-semibold text-[#111111]">{t("Premium Quality Fabrics")}</p>
            <p className="text-xs text-neutral-500 mt-1">
              {t("Handpicked premium fabrics sourced from master weavers across India.")}
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-[#111111]">{t("Care Guide")}</p>
            <p className="text-xs text-neutral-500 mt-1">
              {t("Dry clean first wash recommended. Store in a cool dry place.")}
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-[#111111]">{t("Secure payment")}</p>
            <p className="text-xs text-neutral-500 mt-1">
              {t("100% secure checkout with encrypted payment.")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AishaProductHero;
