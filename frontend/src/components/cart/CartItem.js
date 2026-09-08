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
  const { currency: defaultCurrency } = useUtilsFunction();
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

  return (
    <div className="flex gap-4 p-4 border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
      {/* Product Image */}
      <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
        <Image
          src={
            (Array.isArray(item.image) ? item.image[0] : item.image) ||
            (Array.isArray(item.images) ? item.images[0] : item.images) ||
            PRODUCT_PLACEHOLDER
          }
          alt={item.title || "Product"}
          layout="fill"
          objectFit="cover"
          className="hover:scale-105 transition-transform duration-200"
        />
      </div>

      {/* Product Details */}
      <div className="flex flex-col flex-grow min-w-0">
        {/* Title */}
        <Link
          href={`/product/${item.slug || item.id}`}
          onClick={closeCartDrawer}
          className="text-sm font-medium text-gray-900 hover:text-emerald-600 transition-colors line-clamp-1 mb-1"
        >
          {t(item.title)}
        </Link>

        {/* Variant Info */}
        {item.variant && (
          <p className="text-xs text-gray-500 mb-1">
            {typeof item.variant === "object"
              ? Object.values(item.variant).filter(Boolean).map(v => t(v)).join(", ")
              : t(item.variant)}
          </p>
        )}

        {/* MRP and Discount Badge */}
        {originalPrice > currentPrice && (
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-gray-500 line-through font-medium">
              {t("MRP")}: {currency}{formatPrice(originalPrice)}
            </span>
            <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 py-0.5 rounded-full text-xs font-bold shadow-sm">
              {discountPercentage}% OFF
            </span>
          </div>
        )}

        {/* Item Price */}
        <span className="text-xs text-gray-500 mb-2 font-medium">
            {t("Unit Price")}:{" "}
            <span className="text-emerald-600 font-semibold">
            {currency}{formatPrice(item.price)}
          </span>
        </span>

        {/* Bottom Section: Price, Quantity, Delete */}
        <div className="flex items-center justify-between mt-auto pt-2">
          {/* Total Price */}
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 font-medium">{t("Total")}</span>
            <span className="font-bold text-base md:text-lg text-gray-900 leading-tight">
              {currency}{formatPrice(item.price * item.quantity)}
            </span>
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center gap-2">
            <div className="h-9 flex items-center justify-center p-1 border-2 border-emerald-300 bg-white hover:border-emerald-300 text-gray-700 rounded-lg transition-all duration-200 shadow-sm">
              <button
                onClick={handleDecrease}
                className="h-full px-2 hover:bg-gray-100 rounded-md transition-colors duration-150 active:scale-95"
              >
                <FiMinus className="text-gray-600" />
              </button>

              <span className="text-sm font-bold text-gray-800 px-3 min-w-[2rem] text-center">
                {item.quantity}
              </span>

              <button
                onClick={() => handleIncreaseQuantity(item)}
                className="h-full px-2 hover:bg-emerald-50 rounded-md transition-colors duration-150 active:scale-95"
              >
                <FiPlus className="text-emerald-600" />
              </button>
            </div>

            {/* Delete Button */}
            <button
              onClick={handleRemove}
              className="h-9 w-9 flex items-center justify-center hover:bg-red-50 text-red-400 hover:text-red-600 rounded-lg cursor-pointer transition-all duration-200 active:scale-95"
              aria-label="Remove item"
            >
              <FiTrash2 className="text-lg" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
