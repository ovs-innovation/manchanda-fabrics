import { useRouter } from "next/router";
import React, { useContext, useMemo, useState } from "react";
import { useCart } from "react-use-cart";
import { IoBagCheckOutline, IoClose, IoBagHandle } from "react-icons/io5";
import useTranslation from "next-translate/useTranslation";

//internal import
import CartItem from "@components/cart/CartItem";
import { SidebarContext } from "@context/SidebarContext";
import useUtilsFunction from "@hooks/useUtilsFunction";
import useGetSetting from "@hooks/useGetSetting";
import { calculateShipping, isDelhiLocation, INDIAN_STATES } from "@utils/shippingRules";

const Cart = () => {
  const { t } = useTranslation("common");
  const router = useRouter();
  const { isEmpty, items, cartTotal } = useCart();
  const { closeCartDrawer } = useContext(SidebarContext);
  const { currency, formatPrice } = useUtilsFunction();
  const { storeCustomizationSetting } = useGetSetting();
  const storeColor = storeCustomizationSetting?.theme?.color || "green";

  const [orderNoteOpen, setOrderNoteOpen] = useState(false);
  const [couponOpen, setCouponOpen] = useState(false);
  const [shippingOpen, setShippingOpen] = useState(false);
  const [orderNote, setOrderNote] = useState("");
  const [coupon, setCoupon] = useState("");
  const [shipCountry, setShipCountry] = useState("India");
  const [shipProvince, setShipProvince] = useState("");
  const [shipZip, setShipZip] = useState("");
  const [shippingEstimate, setShippingEstimate] = useState(null);
  const [shippingError, setShippingError] = useState("");

  const totalQuantity = useMemo(() => {
    return items?.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0) || 0;
  }, [items]);

  const handleCalculateShipping = () => {
    if (!shipProvince && !shipZip) {
      setShippingError(t("Please select a State or enter a PIN code"));
      return;
    }
    setShippingError("");
    const dest = { state: shipProvince, zipCode: shipZip };
    const cost = calculateShipping(totalQuantity, dest, false);
    const isDelhi = isDelhiLocation(dest);
    setShippingEstimate({ cost, isDelhi });
    try {
      sessionStorage.setItem("manchanda_shipping_estimate", JSON.stringify({ state: shipProvince, zipCode: shipZip, cost, isDelhi }));
    } catch (e) {}
  };

  const formattedTotal = useMemo(() => {
    const n = Number(cartTotal || 0) + (shippingEstimate?.cost || 0);
    return formatPrice(n);
  }, [cartTotal, shippingEstimate, formatPrice]);

  const handleCheckout = () => {
    if (items?.length <= 0) {
      closeCartDrawer();
    } else {
      router.push("/checkout");
      closeCartDrawer();
    }
  };

  return (
    <>
      <div className="flex flex-col w-full h-full justify-between bg-white rounded cursor-pointer">
        <div className="w-full flex justify-between items-center relative px-5 py-4 border-b border-neutral-100 bg-white">
          <h2
            className="font-bold text-base m-0 flex items-center tracking-[0.18em] uppercase text-[#111111]"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            <span className="text-lg mr-2 mb-0.5 text-[#111111]">
              <IoBagCheckOutline />
            </span>
            {isEmpty ? t("Cart") : `${t("Cart")} (${items?.length || 0})`}
          </h2>
          <button
            onClick={closeCartDrawer}
            className="inline-flex text-base items-center justify-center text-gray-500 p-2 focus:outline-none transition-opacity hover:text-red-400"
          >
            <IoClose />
            <span className="text-xs tracking-widest uppercase text-gray-500 hover:text-red-400 ml-1">
              {t("Close")}
            </span>
          </button>
        </div>
        <div className="overflow-y-scroll flex-grow scrollbar-hide w-full max-h-full">
          {isEmpty && (
            <div className="flex flex-col h-full justify-center">
              <div className="flex flex-col items-center">
                <div className={`flex justify-center items-center w-20 h-20 rounded-full bg-store-100`}>
                  <span className={`text-store-600 text-4xl block`}>
                    <IoBagHandle />
                  </span>
                </div>
                <h3 className="font-serif font-semibold text-gray-700 text-lg pt-5">
                  {t("Your cart is empty")}
                </h3>
                <p className="px-12 text-center text-sm text-gray-500 pt-2">
                  {t("No items added in your cart. Please add product to your cart list.")}
                </p>
              </div>
            </div>
          )}

          {items.map((item, i) => (
            <CartItem key={i + 1} item={item} />
          ))}
        </div>
        <div className="px-5 pt-4 pb-5 border-t border-neutral-100 bg-white">
          {/* Order note */}
          <div className="border border-neutral-200">
            <button
              type="button"
              onClick={() => setOrderNoteOpen((v) => !v)}
              className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold uppercase tracking-[0.22em] text-[#111111] hover:bg-[#FAF7F5] transition-colors"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              <span>{t("Order Note")}</span>
              <span className="text-neutral-500">{orderNoteOpen ? "−" : "+"}</span>
            </button>
            {orderNoteOpen && (
              <div className="px-4 pb-4">
                <textarea
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  rows={3}
                  placeholder={t("Add instructions for your order...")}
                  className="w-full border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#111111]"
                />
              </div>
            )}
          </div>

          {/* Coupon */}
          <div className="border border-neutral-200 border-t-0">
            <button
              type="button"
              onClick={() => setCouponOpen((v) => !v)}
              className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold uppercase tracking-[0.22em] text-[#111111] hover:bg-[#FAF7F5] transition-colors"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              <span>{t("Coupon")}</span>
              <span className="text-neutral-500">{couponOpen ? "−" : "+"}</span>
            </button>
            {couponOpen && (
              <div className="px-4 pb-4 flex gap-2">
                <input
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  placeholder={t("Enter coupon code")}
                  className="flex-1 border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#111111]"
                />
                <button
                  type="button"
                  className="px-4 py-2 bg-[#111111] text-white text-xs font-bold uppercase tracking-[0.22em] hover:bg-black transition-colors"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                  onClick={() => {
                    // UI-only (backend-less) coupon placeholder
                    setCouponOpen(false);
                  }}
                >
                  {t("Apply")}
                </button>
              </div>
            )}
          </div>

          {/* Shipping estimate */}
          <div className="border border-neutral-200 border-t-0">
            <button
              type="button"
              onClick={() => setShippingOpen((v) => !v)}
              className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold uppercase tracking-[0.22em] text-[#111111] hover:bg-[#FAF7F5] transition-colors"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              <span>{t("Shipping")}</span>
              <span className="text-neutral-500">{shippingOpen ? "−" : "+"}</span>
            </button>
            {shippingOpen && (
              <div className="px-4 pb-4 grid grid-cols-1 gap-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    value={shipCountry}
                    readOnly
                    placeholder={t("Country")}
                    className="border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm outline-none text-neutral-600 cursor-not-allowed"
                  />
                  <select
                    value={shipProvince}
                    onChange={(e) => {
                      setShipProvince(e.target.value);
                      setShippingError("");
                      setShippingEstimate(null);
                    }}
                    className="border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#111111] cursor-pointer"
                  >
                    <option value="">{t("Select State *")}</option>
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
                <input
                  value={shipZip}
                  maxLength={6}
                  onChange={(e) => {
                    setShipZip(e.target.value.replace(/\D/g, ""));
                    setShippingError("");
                    setShippingEstimate(null);
                  }}
                  placeholder={t("PIN code (e.g. 110006)")}
                  className="border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#111111]"
                />
                <button
                  type="button"
                  className="w-full px-4 py-2.5 bg-[#111111] text-white text-xs font-bold uppercase tracking-[0.22em] hover:bg-[#333333] transition-colors"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                  onClick={handleCalculateShipping}
                >
                  {t("Calculate shipping")}
                </button>

                {shippingError && (
                  <p className="text-xs text-red-600">{shippingError}</p>
                )}

                {shippingEstimate && (
                  <div className="p-3 bg-[#FAF7F5] rounded border border-[#E6D1CB] text-xs">
                    <div className="flex justify-between font-bold text-[#111111]">
                      <span>
                        {shippingEstimate.isDelhi ? t("Delhi Delivery") : t("Out of Delhi Delivery")}
                      </span>
                      <span>{currency}{shippingEstimate.cost}</span>
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-1">
                      {totalQuantity} {totalQuantity === 1 ? t("item") : t("items")} · {t("Shipping added to total")}
                    </p>
                  </div>
                )}

                <p className="text-[11px] text-neutral-400">
                  {t("Taxes and exact shipping verified at checkout")}
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-neutral-500">
                {t("Total")}
              </p>
              <p className="text-xl font-bold text-[#111111]">
                {currency}
                {formattedTotal}
              </p>
            </div>
            <button
              onClick={handleCheckout}
              className="px-5 py-3 bg-[#592523] hover:bg-[#401817] text-white text-xs sm:text-sm font-bold uppercase tracking-[0.22em] transition-colors"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              {t("Proceed to checkout")}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Cart;

