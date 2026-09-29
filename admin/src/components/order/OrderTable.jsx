import { TableBody, TableCell, TableRow } from "@windmill/react-ui";

import { useTranslation } from "react-i18next";
import { FiZoomIn, FiEdit2, FiCheck, FiX, FiExternalLink, FiImage, FiPlus, FiTruck, FiPhoneCall } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useState, memo } from "react";
import { createPortal } from "react-dom";

//internal import

import Status from "@/components/table/Status";
import Tooltip from "@/components/tooltip/Tooltip";
import useUtilsFunction from "@/hooks/useUtilsFunction";
import PrintReceipt from "@/components/form/others/PrintReceipt";
import SelectStatus from "@/components/form/selectOption/SelectStatus";
import OrderActions from "@/components/order/OrderActions";
import CheckBox from "@/components/form/others/CheckBox";
import OrderServices from "@/services/OrderServices";
import { notifyError, notifySuccess } from "@/utils/toast";
import { getOptimizedThumbnailUrl } from "@/utils/cloudinaryUrl";

// Helper to reliably extract the exact product/variant image from a cart item
const getItemImage = (item) => {
  if (typeof item?.image === "string" && item.image.trim()) return item.image.trim();
  if (Array.isArray(item?.image) && item.image[0]) return item.image[0];
  if (typeof item?.img === "string" && item.img.trim()) return item.img.trim();
  if (typeof item?.featuredImage === "string" && item.featuredImage.trim()) return item.featuredImage.trim();
  if (Array.isArray(item?.images) && item.images[0]) return item.images[0];
  if (Array.isArray(item?.colorVariants)) {
    const match = item.colorVariants.find(
      (cv) => cv?.colorName?.toLowerCase() === item?.color?.toLowerCase()
    );
    if (match?.images?.[0]) return match.images[0];
    if (item.colorVariants[0]?.images?.[0]) return item.colorVariants[0].images[0];
  }
  return "";
};

const POPULAR_COURIERS = [
  "DTDC",
  "Delhivery",
  "Blue Dart",
  "India Post",
  "Trackon",
  "Shree Tirupati",
  "Professional Couriers",
  "Ekart",
  "Shadowfax",
  "Xpressbees",
];

// Lightweight Shipping ID & Courier Badge in Table (zero heavy state, zero row expansion!)
const ShippingIdCell = ({ order, onOpenModal }) => {
  const courier = order?.courierName || order?.shiprocket?.courier_name || "";
  const trackingId =
    order?.shippingTrackingId ||
    order?.trackingNumber ||
    order?.shiprocket?.awb_code ||
    "";
  const hasData = Boolean(courier || trackingId);

  return (
    <div className="flex items-center min-w-[130px]">
      {hasData ? (
        <div className="inline-flex items-center gap-2 bg-gray-50/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 shadow-2xs hover:border-teal-400 dark:hover:border-teal-600 transition-colors">
          <div className="flex flex-col text-left leading-tight">
            {courier && (
              <span
                className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wide truncate max-w-[110px]"
                title={courier}
              >
                {courier}
              </span>
            )}
            <span
              className="text-xs font-mono font-semibold text-gray-800 dark:text-gray-200 select-all truncate max-w-[120px]"
              title={trackingId}
            >
              {trackingId || <span className="text-gray-400 font-normal italic">No AWB</span>}
            </span>
          </div>
          <button
            onClick={() => onOpenModal(order)}
            type="button"
            title="Edit Courier & Tracking ID"
            className="p-1 rounded text-gray-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-colors cursor-pointer"
          >
            <FiEdit2 size={12} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => onOpenModal(order)}
          type="button"
          title="Add Courier & Tracking ID"
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/60 border border-emerald-300/80 dark:border-emerald-800 rounded-lg shadow-2xs transition-all cursor-pointer active:scale-95 whitespace-nowrap"
        >
          <FiPlus size={13} className="stroke-[2.5]" />
          <span>Add Courier / ID</span>
        </button>
      )}
    </div>
  );
};

// Modal Dialog for Editing Shipping / Courier Details (renders in document.body via Portal)
// Zero table reflow, buttery 60 FPS typing, instant click response!
const ShippingTrackingModal = ({ order, onClose, onSaveSuccess }) => {
  const initialValue =
    order?.shippingTrackingId ||
    order?.trackingNumber ||
    order?.shiprocket?.awb_code ||
    "";
  const initialCourier =
    order?.courierName || order?.shiprocket?.courier_name || "";
  const isInitialPredefined = POPULAR_COURIERS.includes(initialCourier);

  const [courierSelect, setCourierSelect] = useState(
    initialCourier ? (isInitialPredefined ? initialCourier : "CUSTOM") : ""
  );
  const [customCourier, setCustomCourier] = useState(
    initialCourier && !isInitialPredefined ? initialCourier : ""
  );
  const [trackingId, setTrackingId] = useState(initialValue);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    try {
      setSaving(true);
      const chosenCourier =
        courierSelect === "CUSTOM"
          ? customCourier.trim()
          : courierSelect.trim();
      const chosenTracking = trackingId.trim();

      await OrderServices.updateShippingId(order._id, {
        shippingTrackingId: chosenTracking || null,
        courierName: chosenCourier || null,
      });

      // Update order object in place so the table reflects instantly
      order.shippingTrackingId = chosenTracking || null;
      order.courierName = chosenCourier || null;
      if (chosenTracking) {
        order.trackingNumber = chosenTracking;
      }

      notifySuccess("Courier & Tracking details saved!");
      if (onSaveSuccess) onSaveSuccess(order);
      onClose();
    } catch (err) {
      notifyError(err?.response?.data?.message || "Failed to save shipping details");
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-200 dark:border-gray-700 animate-in zoom-in-95 duration-150 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-400 flex items-center justify-center shadow-xs">
              <FiTruck size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                Courier & Tracking Details
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Invoice #{order?.invoice} • {order?.user_info?.name || "Customer"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            title="Close"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              Courier / Delivery Partner
            </label>
            <select
              value={courierSelect}
              onChange={(e) => setCourierSelect(e.target.value)}
              disabled={saving}
              className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer shadow-xs transition-all"
            >
              <option value="">-- Select Courier Company --</option>
              {POPULAR_COURIERS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
              <option value="CUSTOM">Other (Type Custom Courier)...</option>
            </select>
          </div>

          {courierSelect === "CUSTOM" && (
            <div className="animate-in fade-in duration-150">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Custom Courier Name
              </label>
              <input
                type="text"
                autoFocus
                value={customCourier}
                onChange={(e) => setCustomCourier(e.target.value)}
                placeholder="e.g. Porter, Trackon, Private Courier"
                disabled={saving}
                className="w-full text-sm border border-teal-400 rounded-xl px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-teal-500 shadow-xs"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              Tracking / AWB Number
            </label>
            <input
              type="text"
              autoFocus={courierSelect !== "CUSTOM"}
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              placeholder="e.g. DT123456789IN or AWB Number"
              disabled={saving}
              className="w-full text-sm font-mono border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500 shadow-xs"
            />
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1.5">
              Visible on the customer tracking timeline and 4x6 shipping label PDF.
            </p>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 text-sm font-semibold rounded-xl text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-sm font-semibold rounded-xl text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 transition-all cursor-pointer shadow-sm active:scale-95 flex items-center gap-1.5"
            >
              {saving ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <FiCheck size={16} />
                  <span>Save Details</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};


const OrderTable = ({
  orders,
  visibleColumns = {},
  isCheck,
  setIsCheck,
  handleModalOpen,
}) => {
  const { t } = useTranslation();
  const {
    showDateTimeFormat,
    currency,
    getNumberTwo,
    showingTranslateValue,
  } = useUtilsFunction();

  const [previewItem, setPreviewItem] = useState(null);
  const [shippingModalOrder, setShippingModalOrder] = useState(null);
  const [, setRefreshCount] = useState(0);

  const handleClick = (e) => {
    const { id, checked } = e.target;
    if (checked) {
      setIsCheck([...(isCheck || []), id]);
    } else {
      setIsCheck((isCheck || []).filter((item) => item !== id));
    }
  };

  // Default visible columns if not provided (e.g. in Dashboard)
  const columns =
    Object.keys(visibleColumns).length > 0
      ? visibleColumns
      : {
        invoice: true,
        time: true,
        orderType: true,
        customerName: true,
        customerId: false,
        productName: true,
        productId: false,
        contact: true,
        shippingCost: true,
        discount: true,
        method: true,
        amount: true,
        shippingId: true,
        status: true,
        action: true,
        actions: true,
      };

  return (
    <>
      <TableBody className="dark:bg-gray-900">
        {orders?.map((order, i) => (
          <TableRow key={order?._id || i}>
            {isCheck !== undefined && (
              <TableCell className="align-top py-4 px-2 w-10 text-center">
                <CheckBox
                  type="checkbox"
                  name={order?.invoice?.toString()}
                  id={order._id}
                  handleClick={handleClick}
                  isChecked={isCheck?.includes(order._id)}
                />
              </TableCell>
            )}

            {columns.invoice && (
              <TableCell className="align-top py-4 px-3 whitespace-nowrap min-w-[90px]">
                <span className="font-semibold uppercase text-xs font-mono text-gray-800 dark:text-gray-200">
                  {order?.invoice}
                </span>
              </TableCell>
            )}

            {columns.time && (
              <TableCell className="align-top py-4 px-3 whitespace-nowrap min-w-[160px]">
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {showDateTimeFormat(order?.updatedDate)}
                </span>
              </TableCell>
            )}

            {columns.orderType && (
              <TableCell className="align-top py-4 px-3 whitespace-nowrap min-w-[110px]">
                {order?.orderType === "RESELLER" ? (
                  <div className="flex flex-col gap-0.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200 w-max">
                      RESELLER
                    </span>
                    <span
                      className="text-[10px] text-gray-500 truncate max-w-[120px]"
                      title={`To: ${order?.final_customer_info?.name || "Customer"}`}
                    >
                      To: {order?.final_customer_info?.name || "Customer"}
                    </span>
                  </div>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200 w-max">
                    DIRECT
                  </span>
                )}
              </TableCell>
            )}

            {columns.customerName && (
              <TableCell className="align-top py-4 px-3 whitespace-nowrap min-w-[140px]">
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {order?.user_info?.name || "Customer"}
                </span>
              </TableCell>
            )}

            {columns.customerId && (
              <TableCell className="align-top py-4 px-3 whitespace-nowrap min-w-[100px]">
                <span className="text-xs text-gray-500 font-mono">{order?.user}</span>
              </TableCell>
            )}

            {columns.contact && (
              <TableCell className="align-top py-4 px-3 whitespace-nowrap min-w-[150px]">
                {order?.user_info?.contact ? (
                  <a
                    href={`tel:${order?.user_info?.contact}`}
                    title="Click to call customer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-50 hover:bg-teal-50 dark:bg-gray-800/80 dark:hover:bg-teal-900/30 border border-gray-200/80 hover:border-teal-300 dark:border-gray-700/80 text-xs font-mono font-medium text-gray-800 hover:text-teal-700 dark:text-gray-200 dark:hover:text-teal-300 transition-colors cursor-pointer"
                  >
                    <FiPhoneCall size={12} className="text-teal-600 dark:text-teal-400 shrink-0" />
                    <span className="select-all">{order?.user_info?.contact}</span>
                  </a>
                ) : (
                  <span className="text-xs text-gray-400 italic">No phone</span>
                )}
              </TableCell>
            )}

            {columns.productName && (
              <TableCell className="align-top py-4 px-4 whitespace-normal min-w-[340px] max-w-[440px]">
                <div className="flex flex-col gap-2 min-w-[300px]">
                  {order?.cart?.map((item, index) => {
                    const itemImg = getItemImage(item);
                    const itemTitle =
                      typeof item.title === "object"
                        ? showingTranslateValue(item.title)
                        : item.title;
                    const itemColor =
                      item.color ||
                      item.variant?.color ||
                      item.variantTitle ||
                      item.defaultColorName;

                    return (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-2 rounded-xl bg-gray-50/90 hover:bg-gray-100 dark:bg-gray-800/80 dark:hover:bg-gray-800 border border-gray-200/70 dark:border-gray-700/70 shadow-2xs transition-colors"
                      >
                        {/* Product Thumbnail with Click to Zoom */}
                        <button
                          type="button"
                          onClick={() => {
                            if (itemImg) {
                              setPreviewItem({
                                src: itemImg,
                                title: itemTitle,
                                color: itemColor,
                                invoice: order?.invoice,
                                price: item.price,
                                quantity: item.quantity || 1,
                                slug: item.slug,
                              });
                            }
                          }}
                          className={`relative flex-shrink-0 w-12 h-12 rounded-md overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-xs group/thumb focus:outline-none focus:ring-2 focus:ring-teal-500 ${itemImg ? "cursor-pointer" : "cursor-default"
                            }`}
                          title={itemImg ? "Click to enlarge product image" : "No image available"}
                        >
                          {itemImg ? (
                            <>
                              <img
                                src={getOptimizedThumbnailUrl(itemImg, 96, 96) || itemImg}
                                alt={itemTitle || "Product"}
                                width="48"
                                height="48"
                                decoding="async"
                                loading="lazy"
                                className="w-full h-full object-cover transition-transform duration-200 group-hover/thumb:scale-110"
                              />
                              <div className="absolute inset-0 bg-black/35 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity text-white">
                                <FiZoomIn size={16} />
                              </div>
                            </>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100 dark:bg-gray-800">
                              <FiImage size={18} />
                            </div>
                          )}
                        </button>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-xs font-semibold text-gray-900 dark:text-gray-100 leading-snug line-clamp-2"
                            title={itemTitle}
                          >
                            {itemTitle || "Product"}
                          </p>

                          <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            {itemColor && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-800/40">
                                {itemColor}
                              </span>
                            )}
                            <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                              Qty:{" "}
                              <strong className="text-gray-800 dark:text-gray-200 font-bold">
                                {item.quantity || 1}
                              </strong>
                              {item.price ? ` × ${currency}${getNumberTwo(item.price)}` : ""}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TableCell>
            )}

            {columns.productId && (
              <TableCell className="whitespace-nowrap min-w-[100px]">
                <div className="flex flex-col gap-1">
                  {order?.cart?.map((item, index) => (
                    <span
                      key={index}
                      className="text-xs text-gray-500 dark:text-gray-400"
                    >
                      • {item._id || item.id}
                    </span>
                  ))}
                </div>
              </TableCell>
            )}

            {columns.shippingCost && (
              <TableCell className="align-top py-4 px-3 whitespace-nowrap min-w-[90px]">
                <span className="text-sm font-semibold">
                  {currency}
                  {getNumberTwo(order?.shippingCost)}
                </span>
              </TableCell>
            )}

            {columns.discount && (
              <TableCell className="align-top py-4 px-3 whitespace-nowrap min-w-[90px]">
                <span className="text-sm font-semibold">
                  {currency}
                  {getNumberTwo(order?.discount)}
                </span>
              </TableCell>
            )}

            {columns.method && (
              <TableCell className="align-top py-4 px-3 whitespace-nowrap min-w-[110px]">
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-100/90 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200/80 dark:border-gray-700">
                  {order?.paymentMethod || "COD"}
                </span>
              </TableCell>
            )}

            {columns.amount && (
              <TableCell className="align-top py-4 px-3 whitespace-nowrap min-w-[100px]">
                <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  {currency}
                  {getNumberTwo(order?.total)}
                </span>
              </TableCell>
            )}

            {columns.shippingId && (
              <TableCell className="align-top py-4 px-3 whitespace-nowrap min-w-[170px]">
                <ShippingIdCell
                  order={order}
                  onOpenModal={setShippingModalOrder}
                />
              </TableCell>
            )}

            {columns.status && (
              <TableCell className="align-top py-4 px-3 whitespace-nowrap min-w-[110px]">
                <Status status={order?.status} />
              </TableCell>
            )}

            {columns.action && (
              <TableCell className="align-top py-4 px-3 whitespace-nowrap min-w-[140px] text-center">
                <SelectStatus id={order._id} order={order} />
              </TableCell>
            )}

            {columns.actions && (
              <TableCell className="align-top py-4 px-2 whitespace-nowrap min-w-[80px] text-center">
                <OrderActions order={order} handleModalOpen={handleModalOpen} />
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>

      {/* Lightbox Image Preview Modal */}
      {previewItem &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
            onClick={() => setPreviewItem(null)}
          >
            <div
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-200 dark:border-gray-700 animate-in zoom-in-95 duration-150 flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-gray-700">
                <div className="min-w-0 pr-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 dark:bg-teal-900/30 dark:text-teal-300 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-800/40">
                    Invoice #{previewItem.invoice}
                  </span>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate mt-1">
                    {previewItem.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewItem(null)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title="Close"
                >
                  <FiX size={18} />
                </button>
              </div>

              {/* High-res Image preview */}
              <div className="p-4 bg-gray-50 dark:bg-gray-900/60 flex items-center justify-center min-h-[300px] max-h-[500px] overflow-hidden">
                <img
                  src={previewItem.src}
                  alt={previewItem.title}
                  className="max-h-[460px] w-auto max-w-full object-contain rounded-lg shadow-md"
                />
              </div>

              {/* Modal Footer Info */}
              <div className="p-4 flex items-center justify-between flex-wrap gap-2 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
                <div className="flex items-center gap-2">
                  {previewItem.color && (
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-200">
                      Color: {previewItem.color}
                    </span>
                  )}
                  <span className="text-xs text-gray-600 dark:text-gray-300 font-semibold">
                    Qty: {previewItem.quantity} {previewItem.price ? `• ₹${getNumberTwo(previewItem.price)}` : ""}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={previewItem.src}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors"
                  >
                    <FiExternalLink size={13} />
                    <span>Full Image</span>
                  </a>
                  {previewItem.slug && (
                    <a
                      href={`https://manchandafabric.in/product/${previewItem.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-700 text-white transition-colors"
                    >
                      <FiExternalLink size={13} />
                      <span>View on Store</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Courier & Tracking Edit Modal */}
      {shippingModalOrder && (
        <ShippingTrackingModal
          order={shippingModalOrder}
          onClose={() => setShippingModalOrder(null)}
          onSaveSuccess={() => setRefreshCount((n) => n + 1)}
        />
      )}
    </>
  );
};

export default memo(OrderTable);
