import { useState, useEffect } from "react";
import Image from "next/image";
import { IoAdd, IoRemove } from "react-icons/io5";
import { FiHeart, FiShoppingBag } from "react-icons/fi";
import { useCart } from "react-use-cart";
import { useRouter } from "next/router";

import { notifyError, notifySuccess } from "@utils/toast";
import useAddToCart from "@hooks/useAddToCart";
import useGetSetting from "@hooks/useGetSetting";
import useUtilsFunction from "@hooks/useUtilsFunction";
import ProductModal from "@components/modal/ProductModal";
import { handleLogEvent } from "src/lib/analytics";
import { addToWishlist } from "@lib/wishlist";

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

  useEffect(() => {
    setMounted(true);
  }, []);

  const { addItem, updateItemQuantity, inCart, getItem } = useCart();
  const { handleIncreaseQuantity } = useAddToCart();
  const { globalSetting } = useGetSetting();
  const { showingTranslateValue } = useUtilsFunction();
  const router = useRouter();

  const currency = globalSetting?.default_currency || "₹";

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
    addToWishlist({
      product,
      onSuccess: () => {
        setWishlistActive(true);
        notifySuccess("Added to wishlist!");
      },
      onError: (err) => {
        notifyError(err?.message || "Failed to wishlist!");
      },
    });
  };

  const goToProduct = () => {
    router.push(`/product/${product.slug}`);
    handleLogEvent("product", `navigated to ${title} product page`);
  };

  const originalPriceValue = Number(product.prices?.originalPrice || 0);
  const currentPrice = Number(product.prices?.price || 0);
  const hasSale = originalPriceValue > currentPrice;
  const discountPercent =
    hasSale && originalPriceValue > 0
      ? Math.round(((originalPriceValue - currentPrice) / originalPriceValue) * 100)
      : 0;

  const isSoldOut = product.stock < 1;
  const title = showingTranslateValue(product?.title);

  const primaryImg = product.featuredImage || product.image?.[0];
  const hoverImg = product.hoverImage || product.image?.[1];

  // Dynamic luxury status badge
  const getBadgeText = () => {
    if (product.tags?.includes("best-seller") || product.tag?.includes("best-seller")) return "Best Seller";
    if (product.tags?.includes("new-arrival") || product.tag?.includes("new-arrival") || product.tag?.includes("new")) return "New";
    if (product.stock < 5 && product.stock > 0) return "Limited";
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

      <article className="group flex h-full w-full flex-col overflow-hidden rounded-none border border-neutral-100 bg-white transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        {/* Image Container */}
        <div
          onClick={goToProduct}
          className="relative aspect-[3/4] w-full cursor-pointer overflow-hidden bg-[#FAF8F4]"
        >
          {isSoldOut && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70">
              <span className="bg-[#222222] px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                Sold Out
              </span>
            </div>
          )}

          {/* Luxury Badge */}
          {badgeText && !isSoldOut && (
            <span className="absolute left-3 top-3 z-20 bg-[#B08D57] px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-white">
              {badgeText}
            </span>
          )}

          {/* Wishlist Button */}
          {!hideWishlistCompare && (
            <button
              type="button"
              onClick={handleAddToWishlist}
              id={`wishlist-${product._id}`}
              aria-label="Add to wishlist"
              className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm border border-neutral-100 text-[#222222] hover:text-[#B08D57] transition-all active:scale-95 duration-200"
            >
              <FiHeart className={`h-4.5 w-4.5 ${wishlistActive ? "fill-[#B08D57] text-[#B08D57]" : ""}`} />
            </button>
          )}

          {/* Product Image Swap */}
          {primaryImg ? (
            <div className="w-full h-full relative">
              <img
                src={primaryImg}
                alt={title}
                className={`h-full w-full object-cover object-top transition duration-700 ease-in-out ${
                  hoverImg ? "group-hover:opacity-0" : "group-hover:scale-105"
                }`}
              />
              {hoverImg && (
                <img
                  src={hoverImg}
                  alt={title}
                  className="absolute inset-0 h-full w-full object-cover object-top opacity-0 transition duration-700 ease-in-out group-hover:opacity-100 group-hover:scale-105"
                />
              )}
            </div>
          ) : (
            <Image src="/placeholder.png" fill className="object-cover" alt="product placeholder" />
          )}
        </div>

        {/* Details Wrapper */}
        <div className="flex flex-1 flex-col gap-2 p-4 font-sans text-left bg-white">
          <h3
            onClick={goToProduct}
            title={title}
            className="cursor-pointer text-xs font-semibold leading-normal text-[#222222] line-clamp-2 hover:text-[#B08D57] tracking-wide transition-colors uppercase h-8"
          >
            {title}
          </h3>

          <div className="flex items-center justify-between mt-1">
            {/* Price Display */}
            {!hidePriceAndAdd && (
              <div className="flex items-baseline gap-2">
                <span className="text-[14px] font-bold tabular-nums text-[#222222]">
                  {currency}{formatCardPrice(currentPrice)}
                </span>
                {hasSale && (
                  <span className="text-[11px] tabular-nums text-[#666666] line-through">
                    {currency}{formatCardPrice(originalPriceValue)}
                  </span>
                )}
              </div>
            )}
            
            {/* Discount Badge */}
            {hasSale && !hideDiscount && (
              <span className="text-[9px] font-bold text-[#592523] uppercase tracking-wider bg-[#592523]/5 px-2 py-0.5">
                {discountPercent}% Off
              </span>
            )}
          </div>

          {/* Quick Add CTA Button */}
          {!hidePriceAndAdd && (
            <div className="mt-2">
              {isSoldOut ? (
                <button
                  type="button"
                  disabled
                  className="flex h-10 w-full items-center justify-center border border-neutral-100 bg-[#FAF8F4] text-[10px] font-bold uppercase tracking-wider text-[#666666] cursor-not-allowed"
                >
                  Out of Stock
                </button>
              ) : mounted && isItemInCart && !hasSizeVariants ? (
                (() => {
                  const item = getItem(activeItemId);
                  return (
                    item && (
                      <div className="flex h-10 w-full items-center justify-between border border-neutral-200 px-3 text-xs bg-white">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateItemQuantity(item.id, item.quantity - 1);
                          }}
                          className="text-[#222222] hover:text-[#B08D57] transition-colors p-1"
                        >
                          <IoRemove />
                        </button>
                        <span className="font-bold text-[#222222]">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleIncreaseQuantity({ ...item, stock: product.stock });
                          }}
                          className="text-[#222222] hover:text-[#B08D57] transition-colors p-1"
                        >
                          <IoAdd />
                        </button>
                      </div>
                    )
                  );
                })()
              ) : (
                <button
                  type="button"
                  onClick={handleAddClick}
                  className="flex h-10 w-full items-center justify-center gap-2 bg-[#592523] text-[10px] font-bold uppercase tracking-widest text-white transition-colors duration-300 hover:bg-[#401817]"
                >
                  <FiShoppingBag className="h-3.5 w-3.5" />
                  {hasSizeVariants ? "Select Size" : "Add to Bag"}
                </button>
              )}
            </div>
          )}
        </div>
      </article>
    </>
  );
};

export default ProductCard;
