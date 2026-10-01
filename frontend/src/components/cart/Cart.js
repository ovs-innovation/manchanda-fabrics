import { useRouter } from "next/router";
import React, { useContext, useMemo, useState } from "react";
import { useCart } from "react-use-cart";
import { IoBagCheckOutline, IoClose, IoBagHandle } from "react-icons/io5";
import { Maximize2, Minimize2 } from "lucide-react";
import useTranslation from "next-translate/useTranslation";

//internal import
import CartItem from "@components/cart/CartItem";
import CartRecommendations from "@components/cart/CartRecommendations";
import { SidebarContext } from "@context/SidebarContext";
import useUtilsFunction from "@hooks/useUtilsFunction";
import useGetSetting from "@hooks/useGetSetting";
import { calculateShipping, isDelhiLocation, INDIAN_STATES } from "@utils/shippingRules";

const Cart = ({ isMaximized = false, onToggleMaximize, isMobile = false }) => {
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
      <div className="flex flex-col w-full h-full justify-between bg-white overflow-hidden">
        {/* Cart Top Header */}
        <div className="w-full flex justify-between items-center relative px-4 py-3 sm:py-3.5 border-b border-neutral-100 bg-white shrink-0">
          <h2
            className="font-bold text-xs sm:text-sm m-0 flex items-center tracking-[0.16em] uppercase text-[#111111]"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            <span className="text-base mr-2 text-[#111111]">
              <IoBagCheckOutline />
            </span>
            {isEmpty ? t("Cart") : `${t("Cart")} (${items?.length || 0})`}
          </h2>

          {/* Right Header Actions: Maximize / Restore & Close */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {onToggleMaximize && (
              <button
                type="button"
                onClick={onToggleMaximize}
                className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase text-neutral-700 hover:text-black bg-neutral-100/90 hover:bg-neutral-200 active:scale-95 py-1 px-2.5 rounded-full transition-all cursor-pointer border border-neutral-200/70"
                style={{ fontFamily: "'Poppins', sans-serif" }}
                title={isMaximized ? "Restore half screen" : "Maximize cart to full screen"}
                aria-label={isMaximized ? "Restore half screen" : "Maximize cart"}
              >
                {isMaximized ? (
                  <>
                    <Minimize2 size={12} className="text-neutral-700" />
                    <span>{t("Half Screen") || "HALF"}</span>
                  </>
                ) : (
                  <>
                    <Maximize2 size={12} className="text-neutral-700" />
                    <span>{t("Maximise") || "MAXIMISE"}</span>
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={closeCartDrawer}
              className="inline-flex text-xs items-center justify-center text-neutral-400 hover:text-black py-1 px-2 transition-colors cursor-pointer"
              title="Close cart"
              aria-label="Close cart"
            >
              <IoClose size={18} />
              <span className="text-[10px] tracking-widest uppercase ml-1 font-semibold" style={{ fontFamily: "'Poppins', sans-serif" }}>
                {t("Close")}
              </span>
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-grow scrollbar-hide w-full max-h-full">
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

          {/* You May Also Like Section (suits in similar price range or bestsellers with + Add button) */}
          <CartRecommendations cartItems={items} />
        </div>
        <div className="px-4 sm:px-5 pt-3 pb-6 md:pb-5 border-t border-neutral-100 bg-white shrink-0 shadow-[0_-4px_16px_rgba(0,0,0,0.03)]">
          {/* Collapsible Options (Order Note, Coupon, Shipping) - Clean & Minimalist */}
          <div className="border-t border-neutral-100/80 mb-3">
            {/* Order note */}
            <div className="border-b border-neutral-100/80">
              <button
                type="button"
                onClick={() => setOrderNoteOpen((v) => !v)}
                className="w-full py-2.5 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-700 hover:text-black transition-colors"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                <span>{t("Order Note")}</span>
                <span className="text-neutral-400 text-xs font-normal">{orderNoteOpen ? "−" : "+"}</span>
              </button>
              {orderNoteOpen && (
                <div className="pb-3 pt-1">
                  <textarea
                    value={orderNote}
                    onChange={(e) => setOrderNote(e.target.value)}
                    rows={2}
                    placeholder={t("Add instructions for your order...")}
                    className="w-full border border-neutral-200 bg-neutral-50/50 rounded-md p-2.5 text-xs outline-none focus:border-[#111111] focus:bg-white transition-all"
                  />
                </div>
              )}
            </div>

            {/* Coupon */}
            <div className="border-b border-neutral-100/80">
              <button
                type="button"
                onClick={() => setCouponOpen((v) => !v)}
                className="w-full py-2.5 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-700 hover:text-black transition-colors"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                <span>{t("Coupon")}</span>
                <span className="text-neutral-400 text-xs font-normal">{couponOpen ? "−" : "+"}</span>
              </button>
              {couponOpen && (
                <div className="pb-3 pt-1 flex gap-2">
                  <input
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    placeholder={t("Enter coupon code")}
                    className="flex-1 border border-neutral-200 bg-neutral-50/50 rounded-md px-3 py-2 text-xs outline-none focus:border-[#111111] focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    className="px-3 py-2 bg-[#111111] text-white text-[10px] font-bold uppercase tracking-[0.16em] rounded-md hover:bg-black transition-colors"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                    onClick={() => setCouponOpen(false)}
                  >
                    {t("Apply")}
                  </button>
                </div>
              )}
            </div>

            {/* Shipping estimate */}
            <div className="border-b border-neutral-100/80">
              <button
                type="button"
                onClick={() => setShippingOpen((v) => !v)}
                className="w-full py-2.5 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-700 hover:text-black transition-colors"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                <span>{t("Shipping")}</span>
                <span className="text-neutral-400 text-xs font-normal">{shippingOpen ? "−" : "+"}</span>
              </button>
              {shippingOpen && (
                <div className="pb-3 pt-1 grid grid-cols-1 gap-2.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      value={shipCountry}
                      readOnly
                      placeholder={t("Country")}
                      className="border border-neutral-200 bg-neutral-100/60 rounded-md px-2.5 py-1.5 text-xs outline-none text-neutral-500 cursor-not-allowed"
                    />
                    <select
                      value={shipProvince}
                      onChange={(e) => {
                        setShipProvince(e.target.value);
                        setShippingError("");
                        setShippingEstimate(null);
                      }}
                      className="border border-neutral-200 bg-white rounded-md px-2.5 py-1.5 text-xs outline-none focus:border-[#111111] cursor-pointer"
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
                    className="border border-neutral-200 bg-white rounded-md px-2.5 py-1.5 text-xs outline-none focus:border-[#111111]"
                  />
                  <button
                    type="button"
                    className="w-full py-2 bg-[#111111] text-white text-[10px] font-bold uppercase tracking-[0.16em] rounded-md hover:bg-neutral-800 transition-colors"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                    onClick={handleCalculateShipping}
                  >
                    {t("Calculate shipping")}
                  </button>

                  {shippingError && (
                    <p className="text-[11px] text-red-600">{shippingError}</p>
                  )}

                  {shippingEstimate && (
                    <div className="p-2.5 bg-[#FAF7F5] rounded border border-[#E6D1CB] text-xs">
                      <div className="flex justify-between font-bold text-[#111111]">
                        <span>
                          {shippingEstimate.isDelhi ? t("Delhi Delivery") : t("Out of Delhi Delivery")}
                        </span>
                        <span>{currency}{shippingEstimate.cost}</span>
                      </div>
                      <p className="text-[10px] text-neutral-500 mt-0.5">
                        {totalQuantity} {totalQuantity === 1 ? t("item") : t("items")} · {t("Shipping added to total")}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Total & Checkout Section (Aisha Creations & Luxury Fashion Boutique style) */}
          <div className="pt-1">
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-xs uppercase tracking-[0.16em] font-medium text-neutral-500">
                {t("Total")}
              </span>
              <span className="text-lg sm:text-xl font-bold text-[#111111]">
                {currency}{formattedTotal}
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 mb-3">
              {t("Taxes and shipping calculated at checkout")}
            </p>

            {/* Sleek rounded checkout button */}
            <button
              onClick={handleCheckout}
              className="w-full py-3.5 px-6 bg-[#111111] hover:bg-black active:scale-[0.98] text-white text-xs sm:text-[13px] font-bold uppercase tracking-[0.2em] rounded-full shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              <span>{t("Check Out") || "CHECK OUT"}</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Cart;

