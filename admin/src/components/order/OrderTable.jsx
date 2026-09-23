import { TableBody, TableCell, TableRow } from "@windmill/react-ui";

import { useTranslation } from "react-i18next";
import { FiZoomIn, FiEdit2, FiCheck, FiX } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useState } from "react";

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
          productName: false,
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
              <TableCell className="whitespace-normal min-w-[200px] max-w-[280px]">
                <div className="flex flex-col gap-1 min-w-[180px]">
                  {order?.cart?.map((item, index) => (
                    <span
                      key={index}
                      className="text-xs text-gray-600 font-semibold dark:text-gray-400 leading-tight"
                    >
                      •{" "}
                      {typeof item.title === "object"
                        ? showingTranslateValue(item.title)
                        : item.title}
                    </span>
                  ))}
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
    </>
  );
};

export default OrderTable;
