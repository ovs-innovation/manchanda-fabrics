import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { IoAdd, IoRemove } from "react-icons/io5";
import { FiHeart, FiShoppingBag } from "react-icons/fi";
import { useCart } from "react-use-cart";
import { useRouter } from "next/router";
import useTranslation from "next-translate/useTranslation";

import { notifyError, notifySuccess } from "@utils/toast";
import useAddToCart from "@hooks/useAddToCart";
import useGetSetting from "@hooks/useGetSetting";
import useUtilsFunction from "@hooks/useUtilsFunction";
import ProductModal from "@components/modal/ProductModal";
import { handleLogEvent } from "src/lib/analytics";
import { addToWishlist, removeFromWishlist, isInWishlist } from "@lib/wishlist";
import { PRODUCT_PLACEHOLDER } from "@utils/brandAssets";
import { translateLabel } from "@utils/locale";

const formatCardPrice = (value = 0) => {
  const num = Math.max(0, parseFloat(value) || 0);
  return num.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: num % 1 === 0 ? 0 : 2,
  });
};

const ProductCard = ({
  product,
  attributes,
  hidePriceAndAdd = false,
  hideDiscount = false,
  hideWishlistCompare = false,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [wishlistActive, setWishlistActive] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { t } = useTranslation("common");

  useEffect(() => {
    setMounted(true);
    const updateState = () => {
      if (product?._id) {
        setWishlistActive(isInWishlist(product._id));
      }
    };
    updateState();
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

  const { addItem, updateItemQuantity, inCart, getItem } = useCart();
  const { handleIncreaseQuantity } = useAddToCart();
  const { globalSetting } = useGetSetting();
  const { showingTranslateValue, currency } = useUtilsFunction();
  const router = useRouter();

  const sizeAttribute = attributes?.find(
    (att) =>
      att?.name?.en?.toLowerCase() === "size" ||
      att?.title?.en?.toLowerCase() === "size"
  );
  const sizeAttrId = sizeAttribute?._id;
  const hasSizeVariants = product?.variants?.length > 0 && sizeAttrId;

  const activeItemId = product._id;
  const isItemInCart = inCart(activeItemId);

  const handleAddItem = (p) => {
    if (p.stock < 1) return notifyError("Insufficient stock!");

    const { slug, variants, categories, description, ...updatedProduct } = product;
    addItem(
      {
        ...updatedProduct,
        id: product._id,
        title: showingTranslateValue(product.title),
        price: product.prices?.price || 0,
        originalPrice: product.prices?.originalPrice || product.prices?.price || 0,
        image: product.image?.[0] || product.images?.[0],
      },
      1
    );
    notifySuccess("Added to bag!");
  };

  const handleAddClick = (e) => {
    e.stopPropagation();
    if (product.stock < 1) return;
    if (hasSizeVariants) {
      router.push(`/product/${product.slug}`);
      return;
    }
    handleAddItem(product);
  };

  const handleAddToWishlist = (e) => {
    e.stopPropagation();
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

  const goToProduct = () => {
    router.push(`/product/${product.slug}`);
    handleLogEvent("product", `navigated to ${title} product page`);
  };

  const [previewColorImg, setPreviewColorImg] = useState(null);

  const combinedColorVariants = useMemo(() => {
    const list = [];
    if (product?.defaultColorName) {
      list.push({
        colorName: product.defaultColorName,
        colorCode: product.defaultColorCode || "#000000",
        images: product.featuredImage || (Array.isArray(product.image) && product.image[0]) ? [product.featuredImage || product.image[0]] : [],
        isDefault: true,
      });
    }
    if (product?.colorVariants && Array.isArray(product.colorVariants)) {
      list.push(...product.colorVariants.map(cv => ({ ...cv, isDefault: false })));
    }
    return list;
  }, [product]);

  const originalPriceValue = Number(product.prices?.originalPrice || 0);
  const currentPrice = Number(product.prices?.price || 0);
  const hasSale = originalPriceValue > currentPrice;
  const discountPercent =
    hasSale && originalPriceValue > 0
      ? Math.round(((originalPriceValue - currentPrice) / originalPriceValue) * 100)
      : 0;

  const isSoldOut = product.stock < 1;
  const title = translateLabel(showingTranslateValue(product?.title), t);

  const primaryImg = previewColorImg || product.featuredImage || product.image?.[0];
  const hoverImg = product.hoverImage || product.image?.[1];

  // Dynamic luxury status badge
  const getBadgeText = () => {
    if (product.tags?.includes("best-seller") || product.tag?.includes("best-seller")) return t("Best Seller");
    if (product.tags?.includes("new-arrival") || product.tag?.includes("new-arrival") || product.tag?.includes("new")) return t("New");
    if (product.stock < 5 && product.stock > 0) return t("Limited");
    return null;
  };
  const badgeText = getBadgeText();

  return (
    <>
      {modalOpen && (
        <ProductModal
          modalOpen={modalOpen}
          setModalOpen={setModalOpen}
          product={product}
          currency={currency}
          attributes={attributes}
        />
      )}

      <article
        className="group flex h-full w-full flex-col overflow-hidden bg-white"
        style={{ fontFamily: "'Poppins', sans-serif" }}
      >
        {/* Image Container */}
        <div
          onClick={goToProduct}
          className="relative aspect-[3/4] w-full cursor-pointer overflow-hidden bg-neutral-50"
        >
          {isSoldOut && (
            <span className="absolute left-3 top-3 z-20 bg-[#111111] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-white">
              {t("Sold Out")}
            </span>
          )}

          {/* Sale badge (Aisha style "-x%") */}
          {hasSale && !hideDiscount && !isSoldOut && (
            <span className="absolute left-3 top-3 z-20 bg-[#111111] px-3 py-1.5 text-[10px] font-semibold tracking-[0.1em] text-white">
              -{discountPercent}%
            </span>
          )}

          {/* Product Image */}
          {primaryImg ? (
            <div className="w-full h-full relative">
              <img
                src={primaryImg}
                alt={title}
                className="h-full w-full object-cover object-top transition duration-700 ease-in-out group-hover:scale-105"
              />
            </div>
          ) : (
            <Image src={PRODUCT_PLACEHOLDER} fill className="object-cover" alt="product placeholder" />
          )}

          {/* Hover actions: Add to Cart + Quickshop (Aisha style) */}
          {!hidePriceAndAdd && !isSoldOut && (
            <div className="absolute inset-x-3 bottom-3 z-20 flex flex-col gap-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200">
              <button
                type="button"
                onClick={handleAddClick}
                className="w-full bg-[#111111] text-white text-[11px] font-semibold uppercase tracking-[0.2em] py-3 hover:bg-black transition-colors"
              >
                {hasSizeVariants ? t("Select Options") : t("Add to Cart")}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setModalOpen(true);
                }}
                className="w-full bg-white text-[#111111] text-[11px] font-semibold uppercase tracking-[0.2em] py-3 border border-neutral-200 hover:border-[#111111] transition-colors"
              >
                {t("Quickshop")}
              </button>
            </div>
          )}
        </div>

        {/* Details (Aisha: centered title + Regular price) */}
        <div className="flex flex-1 flex-col items-center gap-1.5 px-3 py-5 text-center bg-white">
          {combinedColorVariants && combinedColorVariants.length > 1 && (
            <div className="flex items-center justify-center gap-1.5 mb-2 flex-wrap">
              {combinedColorVariants.map((colorVar, idx) => (
                <button
                  key={idx}
                  type="button"
                  onMouseEnter={() => {
                    if (colorVar.images && colorVar.images.length > 0) {
                      setPreviewColorImg(colorVar.images[0]);
                    }
                  }}
                  onMouseLeave={() => setPreviewColorImg(null)}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (colorVar.images && colorVar.images.length > 0) {
                      setPreviewColorImg(colorVar.images[0]);
                    }
                  }}
                  className="w-4 h-4 rounded-full border border-neutral-300 flex items-center justify-center hover:border-[#111111] transition-all"
                  title={colorVar.colorName}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full block border border-neutral-200/50"
                    style={{ backgroundColor: colorVar.colorCode || "#000000" }}
                  />
                </button>
              ))}
            </div>
          )}

          <h3
            onClick={goToProduct}
            title={title}
            className="cursor-pointer text-[14px] font-normal leading-snug text-[#111111] hover:underline underline-offset-4 transition-colors line-clamp-2"
          >
            {title}
          </h3>

          {!hidePriceAndAdd && (
            <div className="flex items-baseline justify-center gap-2 text-[14px]">
              {hasSale ? (
                <>
                  <span className="text-neutral-400 line-through">
                    {currency}{formatCardPrice(originalPriceValue)}
                  </span>
                  <span className="text-[#111111] font-medium">
                    {currency}{formatCardPrice(currentPrice)}
                  </span>
                </>
              ) : (
                <span className="text-[#111111]">
                  <span className="text-neutral-500 text-[13px] mr-1.5">{t("Regular price")}</span>
                  {currency}{formatCardPrice(currentPrice)}
                </span>
              )}
            </div>
          )}
        </div>
      </article>
    </>
  );
};

export default ProductCard;
