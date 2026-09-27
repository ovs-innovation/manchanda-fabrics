import { TableBody, TableCell, TableRow } from "@windmill/react-ui";

import { useTranslation } from "react-i18next";
import { FiZoomIn, FiEdit2, FiCheck, FiX, FiExternalLink, FiImage } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useState } from "react";
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

// Inline editable shipping ID cell
const ShippingIdCell = ({ orderId, initialValue }) => {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(initialValue || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      await OrderServices.updateShippingId(orderId, value.trim() || null);
      notifySuccess("Shipping ID saved!");
      setEditing(false);
    } catch (err) {
      notifyError(err?.response?.data?.message || "Failed to save Shipping ID");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setValue(initialValue || "");
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="flex items-center gap-1 min-w-[160px]">
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") handleCancel();
          }}
          className="flex-1 text-xs border border-teal-400 rounded px-2 py-1 outline-none focus:ring-2 focus:ring-teal-400/40 bg-white dark:bg-gray-800 dark:text-white"
          placeholder="Enter tracking ID"
          disabled={saving}
        />
        <button
          onClick={handleSave}
          disabled={saving}
          title="Save"
          className="p-1 rounded text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-colors"
        >
          <FiCheck size={14} />
        </button>
        <button
          onClick={handleCancel}
          disabled={saving}
          title="Cancel"
          className="p-1 rounded text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <FiX size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 group min-w-[120px]">
      {value ? (
        <span className="text-xs font-mono text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
          {value}
        </span>
      ) : (
        <span className="text-xs text-gray-400 italic">—</span>
      )}
      <button
        onClick={() => setEditing(true)}
        title="Edit Shipping ID"
        className="opacity-0 group-hover:opacity-100 p-1 rounded text-gray-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-all"
      >
        <FiEdit2 size={12} />
      </button>
    </div>
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
          <TableRow key={i + 1}>
            {isCheck !== undefined && (
              <TableCell className="w-10 text-center">
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
              <TableCell className="whitespace-nowrap min-w-[90px]">
                <span className="font-semibold uppercase text-xs">
                  {order?.invoice}
                </span>
              </TableCell>
            )}

            {columns.time && (
              <TableCell className="whitespace-nowrap min-w-[160px]">
                <span className="text-sm">
                  {showDateTimeFormat(order?.updatedDate)}
                </span>
              </TableCell>
            )}

            {columns.orderType && (
              <TableCell className="whitespace-nowrap min-w-[110px]">
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
              <TableCell className="text-xs whitespace-nowrap min-w-[140px]">
                <span className="text-sm">{order?.user_info?.name}</span>{" "}
              </TableCell>
            )}

            {columns.customerId && (
              <TableCell className="whitespace-nowrap min-w-[100px]">
                <span className="text-xs text-gray-500">{order?.user}</span>
              </TableCell>
            )}

            {columns.productName && (
              <TableCell className="whitespace-normal min-w-[280px] max-w-[380px] py-3">
                <div className="flex flex-col gap-2 min-w-[260px]">
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
                        className="flex items-start gap-2.5 p-1.5 rounded-lg bg-gray-50/80 hover:bg-gray-100/90 dark:bg-gray-800/50 dark:hover:bg-gray-800/90 transition-colors border border-gray-100 dark:border-gray-700/60"
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
                          className={`relative flex-shrink-0 w-12 h-12 rounded-md overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-xs group/thumb focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                            itemImg ? "cursor-pointer" : "cursor-default"
                          }`}
                          title={itemImg ? "Click to enlarge product image" : "No image available"}
                        >
                          {itemImg ? (
                            <>
                              <img
                                src={itemImg}
                                alt={itemTitle || "Product"}
                                className="w-full h-full object-cover transition-transform duration-200 group-hover/thumb:scale-110"
                                loading="lazy"
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

            {columns.contact && (
              <TableCell className="whitespace-nowrap min-w-[130px]">
                <span className="text-sm">{order?.user_info?.contact}</span>
              </TableCell>
            )}

            {columns.shippingCost && (
              <TableCell className="whitespace-nowrap min-w-[90px]">
                <span className="text-sm font-semibold">
                  {currency}
                  {getNumberTwo(order?.shippingCost)}
                </span>
              </TableCell>
            )}

            {columns.discount && (
              <TableCell className="whitespace-nowrap min-w-[90px]">
                <span className="text-sm font-semibold">
                  {currency}
                  {getNumberTwo(order?.discount)}
                </span>
              </TableCell>
            )}

            {columns.method && (
              <TableCell className="whitespace-nowrap min-w-[100px]">
                <span className="text-sm font-semibold">
                  {order?.paymentMethod}
                </span>
              </TableCell>
            )}

            {columns.amount && (
              <TableCell className="whitespace-nowrap min-w-[100px]">
                <span className="text-sm font-semibold">
                  {currency}
                  {getNumberTwo(order?.total)}
                </span>
              </TableCell>
            )}

            {columns.shippingId && (
              <TableCell className="whitespace-nowrap min-w-[140px]">
                <ShippingIdCell
                  orderId={order._id}
                  initialValue={order?.shippingTrackingId || ""}
                />
              </TableCell>
            )}

            {columns.status && (
              <TableCell className="text-xs whitespace-nowrap min-w-[110px]">
                <Status status={order?.status} />
              </TableCell>
            )}

            {columns.action && (
              <TableCell className="text-center whitespace-nowrap min-w-[140px]">
                <SelectStatus id={order._id} order={order} />
              </TableCell>
            )}

            {columns.actions && (
              <TableCell className="text-center relative whitespace-nowrap min-w-[80px]">
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
    </>
  );
};

export default OrderTable;
