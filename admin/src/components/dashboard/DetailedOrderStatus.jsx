import React from "react";
import { Link } from "react-router-dom";
import {
  FiCalendar,
  FiSmartphone,
  FiBox,
  FiTruck,
  FiCheckCircle,
  FiXCircle,
  FiRefreshCcw,
  FiAlertCircle,
} from "react-icons/fi";

const DetailedOrderStatus = ({ dashboardOrderCount }) => {
  const pendingCount = dashboardOrderCount?.totalPendingOrder?.count || 0;
  const processingCount = dashboardOrderCount?.totalProcessingOrder || 0;
  const deliveredCount = dashboardOrderCount?.totalDeliveredOrder || 0;
  const canceledCount = dashboardOrderCount?.totalCancelOrder || 0;
  const acceptedCount = dashboardOrderCount?.totalAcceptedOrder || 0;
  const outForDeliveryCount = dashboardOrderCount?.totalOutForDeliveryOrder || 0;
  const refundedCount = dashboardOrderCount?.totalRefundedOrder || 0;
  const paymentFailedCount = dashboardOrderCount?.totalFailedOrder || 0;

  const cards = [
    { title: "Unassigned Orders", value: pendingCount, Icon: FiCalendar, link: "/orders/pending" },
    { title: "Accepted By Delivery Man", value: acceptedCount, Icon: FiSmartphone, link: "/orders/accepted" },
    { title: "Packaging", value: processingCount, Icon: FiBox, link: "/orders/processing" },
    { title: "Out For Delivery", value: outForDeliveryCount, Icon: FiTruck, link: "/orders/on-the-way" },
    { title: "Delivered", value: deliveredCount, Icon: FiCheckCircle, link: "/orders/delivered", highlight: "success" },
    { title: "Canceled", value: canceledCount, Icon: FiXCircle, link: "/orders/canceled", highlight: "danger" },
    { title: "Refunded", value: refundedCount, Icon: FiRefreshCcw, link: "/orders/refunded", highlight: "danger" },
    { title: "Payment Failed", value: paymentFailedCount, Icon: FiAlertCircle, link: "/orders/payment-failed", highlight: "danger" },
  ];

  return (
    <div className="admin-card p-5 md:p-6">
      <h2 className="text-base font-semibold text-store-800 dark:text-store-100 mb-4">Order status</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((card) => (
          <Link
            key={card.title}
            to={card.link}
            className="flex items-center justify-between p-3.5 bg-store-50/80 dark:bg-store-800/25 rounded-xl border border-store-200/80 dark:border-store-700/40 hover:border-store-300 dark:hover:border-store-600 transition-colors group no-underline"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-store-500/10 text-store-600 dark:text-store-300 shrink-0">
                <card.Icon className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-store-700 dark:text-store-200 leading-tight truncate">
                {card.title}
              </span>
            </div>
            <span
              className={`text-lg font-bold shrink-0 ml-2 ${
                card.highlight === "danger"
                  ? "text-red-600 dark:text-red-400"
                  : card.highlight === "success"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-store-700 dark:text-store-100"
              }`}
            >
              {card.value}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default DetailedOrderStatus;
