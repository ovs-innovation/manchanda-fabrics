import { useContext } from "react";
import Link from "next/link";
import { useCart } from "react-use-cart";
import { FiPlus, FiMinus, FiTrash2 } from "react-icons/fi";
import Image from "next/image";
import useTranslation from "next-translate/useTranslation";

//internal import
import useAddToCart from "@hooks/useAddToCart";
import useCartDB from "@hooks/useCartDB";
import useUtilsFunction, { formatPrice } from "@hooks/useUtilsFunction";
import { SidebarContext } from "@context/SidebarContext";
import { notifyError } from "@utils/toast";
import { PRODUCT_PLACEHOLDER } from "@utils/brandAssets";

const CartItem = ({ item, currency: propCurrency }) => {
  const { t } = useTranslation("common");
  const { closeCartDrawer } = useContext(SidebarContext);
  const { handleIncreaseQuantity } = useAddToCart();
  const { updateQuantityWithDB, removeItemWithDB } = useCartDB();
  const { currency: defaultCurrency, showingTranslateValue } = useUtilsFunction();
  const rawCurr = propCurrency || defaultCurrency;
  const currency =
    rawCurr && rawCurr !== "$" && rawCurr !== "USD" ? rawCurr : "₹";

  // Calculate MRP and discount - Check multiple possible price fields
  const originalPrice =
    item.originalPrice ||
    item.mrp ||
    item.prices?.original ||
    item.price * 1.2; // Add 20% markup as fallback
  const currentPrice = item.price || item.prices?.sale || 0;
  const discount = originalPrice > currentPrice ? originalPrice - currentPrice : 0;
  const discountPercentage =
    originalPrice > currentPrice
      ? Math.round((discount / originalPrice) * 100)
      : 0;

  const handleDecrease = async () => {
    if (item.quantity <= 1) {
      notifyError("Minimum quantity is 1");
      return;
    }
    await updateQuantityWithDB(item.id, item.quantity - 1);
  };

  /**
   * Increase quantity handler - checks stock before increasing
   */
  const handleIncrease = async () => {
    handleIncreaseQuantity(item);
  };

  /**
   * Handle remove — removes from local cart + DB.
   */
  const handleRemove = async () => {
    await removeItemWithDB(item.id);
  };

  const productHref = (() => {
    if (item.slug) return `/product/${item.slug}`;
    const raw = String(item.id || item._id || "");
    const baseId = raw.includes("-") ? raw.split("-")[0] : raw;
    return `/product/${baseId}`;
  })();

  return (
    <div className="flex gap-3.5 p-3.5 border-b border-neutral-100 hover:bg-neutral-50/40 transition-colors">
      {/* Product Image */}
      <Link
        href={productHref}
        onClick={closeCartDrawer}
        className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-md overflow-hidden bg-neutral-100 border border-black/5 block group"
      >
        <Image
          src={
            (Array.isArray(item.image) ? item.image[0] : item.image) ||
            (Array.isArray(item.images) ? item.images[0] : item.images) ||
            PRODUCT_PLACEHOLDER
          }
          alt={item.title || "Product"}
          layout="fill"
          objectFit="cover"
          className="group-hover:scale-105 transition-transform duration-200"
        />
      </Link>

      {/* Product Details */}
      <div className="flex flex-col flex-grow min-w-0 justify-between">
        <div>
          {/* Title */}
          <Link
            href={productHref}
            onClick={closeCartDrawer}
            className="text-xs sm:text-[13px] font-medium text-[#111111] hover:text-neutral-600 transition-colors line-clamp-1 block leading-snug"
          >
            {showingTranslateValue(item.title) || t(item.title)}
          </Link>

          {/* Variant Info */}
          {item.variant && (
            <p className="text-[11px] text-neutral-400 mt-0.5 line-clamp-1">
              {typeof item.variant === "object"
                ? Object.values(item.variant).filter(Boolean).map(v => t(v)).join(", ")
                : t(item.variant)}
            </p>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xs sm:text-[13px] font-bold text-[#111111]">
              {currency}{formatPrice(currentPrice)}
            </span>
            {item.quantity > 1 && (
              <span className="text-[11px] text-neutral-400">
                × {item.quantity} = {currency}{formatPrice(currentPrice * item.quantity)}
              </span>
            )}
            {originalPrice > currentPrice && item.quantity === 1 && (
              <span className="text-[10px] text-neutral-400 line-through">
                {currency}{formatPrice(originalPrice)}
              </span>
            )}
          </div>
        </div>

        {/* Stepper + Remove Row */}
        <div className="flex items-center justify-between mt-2 pt-1">
          {/* Minimalist sleek stepper */}
          <div className="inline-flex items-center border border-neutral-200 rounded bg-white overflow-hidden shadow-2xs">
            <button
              type="button"
              onClick={handleDecrease}
              className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-neutral-500 hover:text-black hover:bg-neutral-100 transition-colors active:scale-95"
              aria-label="Decrease quantity"
            >
              <FiMinus size={11} />
            </button>

            <span className="text-xs font-semibold text-[#111111] px-2 min-w-[1.4rem] text-center select-none">
              {item.quantity}
            </span>

            <button
              type="button"
              onClick={handleIncrease}
              className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-neutral-500 hover:text-black hover:bg-neutral-100 transition-colors active:scale-95"
              aria-label="Increase quantity"
            >
              <FiPlus size={11} />
            </button>
          </div>

          {/* Clean Remove text button in red */}
          <button
            type="button"
            onClick={handleRemove}
            className="text-[11px] font-medium text-red-500 hover:text-red-700 transition-colors flex items-center gap-1 cursor-pointer py-1 px-1.5 active:scale-95"
            aria-label="Remove item"
          >
            <FiTrash2 size={12} className="text-red-500" />
            <span>{t("Remove") || "Remove"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
