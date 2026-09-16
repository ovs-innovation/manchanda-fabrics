import { TableBody, TableCell, TableRow } from "@windmill/react-ui";

import { useTranslation } from "react-i18next";
import { FiZoomIn } from "react-icons/fi";
import { Link } from "react-router-dom";

//internal import

import Status from "@/components/table/Status";
import Tooltip from "@/components/tooltip/Tooltip";
import useUtilsFunction from "@/hooks/useUtilsFunction";
import PrintReceipt from "@/components/form/others/PrintReceipt";
import SelectStatus from "@/components/form/selectOption/SelectStatus";
import OrderActions from "@/components/order/OrderActions";

const OrderTable = ({ orders, visibleColumns = {} }) => {
  const { t } = useTranslation();
  const {
    showDateTimeFormat,
    currency,
    getNumberTwo,
    showingTranslateValue,
  } = useUtilsFunction();

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
          status: true,
          action: true,
          actions: true,
        };

  return (
    <>
      <TableBody className="dark:bg-gray-900">
        {orders?.map((order, i) => (
          <TableRow key={i + 1}>
            {columns.invoice && (
              <TableCell className="whitespace-nowrap">
                <span className="font-semibold uppercase text-xs">
                  {order?.invoice}
                </span>
              </TableCell>
            )}

            {columns.time && (
              <TableCell className="whitespace-nowrap">
                <span className="text-sm">
                  {showDateTimeFormat(order?.updatedDate)}
                </span>
              </TableCell>
            )}

            {columns.orderType && (
              <TableCell className="whitespace-nowrap">
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
              <TableCell className="text-xs whitespace-nowrap">
                <span className="text-sm">{order?.user_info?.name}</span>{" "}
              </TableCell>
            )}

            {columns.customerId && (
              <TableCell className="whitespace-nowrap">
                <span className="text-xs text-gray-500">{order?.user}</span>
              </TableCell>
            )}

            {columns.productName && (
              <TableCell className="whitespace-normal">
                <div className="flex flex-col gap-1 min-w-[150px]">
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
              <TableCell className="whitespace-nowrap">
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
              <TableCell className="whitespace-nowrap">
                <span className="text-sm">{order?.user_info?.contact}</span>
              </TableCell>
            )}

            {columns.shippingCost && (
              <TableCell className="whitespace-nowrap">
                <span className="text-sm font-semibold">
                  {currency}
                  {getNumberTwo(order?.shippingCost)}
                </span>
              </TableCell>
            )}

            {columns.discount && (
              <TableCell className="whitespace-nowrap">
                <span className="text-sm font-semibold">
                  {currency}
                  {getNumberTwo(order?.discount)}
                </span>
              </TableCell>
            )}

            {columns.method && (
              <TableCell className="whitespace-nowrap">
                <span className="text-sm font-semibold">
                  {order?.paymentMethod}
                </span>
              </TableCell>
            )}

            {columns.amount && (
              <TableCell className="whitespace-nowrap">
                <span className="text-sm font-semibold">
                  {currency}
                  {getNumberTwo(order?.total)}
                </span>
              </TableCell>
            )}

            {columns.status && (
              <TableCell className="text-xs whitespace-nowrap">
                <Status status={order?.status} />
              </TableCell>
            )}

            {columns.action && (
              <TableCell className="text-center whitespace-nowrap">
                <SelectStatus id={order._id} order={order} />
              </TableCell>
            )}

            {columns.actions && (
              <TableCell className="text-right relative whitespace-nowrap">
                <OrderActions order={order} />
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </>
  );
};

export default OrderTable;
