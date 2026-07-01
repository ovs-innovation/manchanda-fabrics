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
  const hasSizeVariants =
    product?.variants?.length > 0 && sizeAttrId;

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

      <article className="group flex h-full w-full flex-col overflow-hidden rounded-lg border border-[#E8E0DC] bg-white transition-shadow hover:shadow-md">
        {/* Image */}
        <div
          onClick={goToProduct}
          className="relative aspect-[4/5] w-full cursor-pointer overflow-hidden bg-[#F7F3F1]"
        >
          {isSoldOut && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70">
              <span className="rounded bg-[#3B2A25] px-3 py-1 text-[11px] font-medium text-white">
                Sold Out
              </span>
            </div>
          )}

          {!hideDiscount && hasSale && (
            <span className="absolute left-2 top-2 z-20 rounded bg-[#9C6A5A] px-2 py-0.5 text-[10px] font-medium text-white">
              {discountPercent}% OFF
            </span>
          )}

          {!hideWishlistCompare && (
            <button
              type="button"
              onClick={handleAddToWishlist}
              id={`wishlist-${product._id}`}
              aria-label="Add to wishlist"
              className={`absolute right-2 top-2 z-20 flex h-8 w-8 items-center justify-center rounded-full border transition-colors ${
                wishlistActive
                  ? "border-[#9C6A5A] bg-[#9C6A5A] text-white"
                  : "border-[#E8E0DC] bg-white text-[#3B2A25] hover:border-[#9C6A5A]"
              }`}
            >
              <FiHeart className={`h-3.5 w-3.5 ${wishlistActive ? "fill-white" : ""}`} />
            </button>
          )}

          {primaryImg ? (
            <>
              <img
                src={primaryImg}
                alt={title}
                className={`h-full w-full object-cover object-top transition duration-500 ${
                  hoverImg ? "group-hover:opacity-0" : "group-hover:scale-[1.03]"
                }`}
              />
              {hoverImg && (
                <img
                  src={hoverImg}
                  alt={title}
                  className="absolute inset-0 h-full w-full object-cover object-top opacity-0 transition duration-500 group-hover:opacity-100"
                />
              )}
            </>
          ) : (
            <Image src="/placeholder.png" fill className="object-cover" alt="product" />
          )}
        </div>

        {/* Details */}
        <div className="flex flex-1 flex-col gap-2 p-3 font-sans">
          <h3
            onClick={goToProduct}
            title={title}
            className="cursor-pointer text-[13px] font-normal leading-snug text-[#3B2A25] line-clamp-2 hover:text-[#9C6A5A]"
          >
            {title}
          </h3>

          {!hidePriceAndAdd && (
            <div className="flex items-baseline gap-2">
              <span className="text-[15px] font-semibold tabular-nums text-[#3B2A25] font-price">
                {currency}{formatCardPrice(currentPrice)}
              </span>
              {hasSale && (
                <span className="text-xs tabular-nums text-[#8A7A74] line-through font-price">
                  {currency}{formatCardPrice(originalPriceValue)}
                </span>
              )}
            </div>
          )}

          {!hidePriceAndAdd && (
            <div className="mt-auto pt-1">
              {isSoldOut ? (
                <button
                  type="button"
                  disabled
                  className="flex h-9 w-full items-center justify-center rounded-md border border-[#E8E0DC] bg-[#FAF7F5] text-xs font-medium text-[#8A7A74]"
                >
                  Out of Stock
                </button>
              ) : mounted && isItemInCart && !hasSizeVariants ? (
                (() => {
                  const item = getItem(activeItemId);
                  return (
                    item && (
                      <div className="flex h-9 w-full items-center justify-between rounded-md border border-[#E8E0DC] px-3 text-sm">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateItemQuantity(item.id, item.quantity - 1);
                          }}
                          className="text-[#3B2A25] hover:text-[#9C6A5A]"
                        >
                          <IoRemove />
                        </button>
                        <span className="text-sm font-medium text-[#3B2A25]">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleIncreaseQuantity({ ...item, stock: product.stock });
                          }}
                          className="text-[#3B2A25] hover:text-[#9C6A5A]"
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
                  className="flex h-9 w-full items-center justify-center gap-1.5 rounded-md bg-[#9C6A5A] text-xs font-medium text-white transition-colors hover:bg-[#7A4D3C]"
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
