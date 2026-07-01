import React from "react";
import {
  FiShoppingCart,
  FiUsers,
  FiTruck,
  FiHome,
  FiXCircle,
  FiRefreshCw,
  FiCreditCard,
  FiPackage,
} from "react-icons/fi";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import isToday from "dayjs/plugin/isToday";
import isYesterday from "dayjs/plugin/isYesterday";
import CardItem from "@/components/dashboard/CardItem";

dayjs.extend(isBetween);
dayjs.extend(isToday);
dayjs.extend(isYesterday);

const ModernStats = ({ dashboardOrderCount, timeFilter, setTimeFilter, dashboardOrderAmount }) => {
  const filteredOrders =
    dashboardOrderAmount?.ordersData?.filter((order) => {
      const orderDate = dayjs(order.updatedAt);
      if (timeFilter === "week") return orderDate.isAfter(dayjs().subtract(7, "day"));
      if (timeFilter === "month") return orderDate.isAfter(dayjs().subtract(1, "month"));
      return true;
    }) || [];

  const getStatusCount = (status) => filteredOrders.filter((o) => o.status === status).length;

  const topCards = [
    {
      title: "Total Sales",
      Icon: FiCreditCard,
      quantity: dashboardOrderAmount?.totalAmount || 0,
      isAmount: true,
      link: "/orders",
      tone: 0,
    },
    {
      title: "Total Orders",
      Icon: FiShoppingCart,
      quantity: timeFilter === "year" ? dashboardOrderCount?.totalOrder || 0 : filteredOrders.length,
      link: "/orders",
      tone: 1,
    },
    {
      title: "Total Customers",
      Icon: FiUsers,
      quantity: dashboardOrderCount?.totalCustomer || 0,
      link: "/customers",
      tone: 2,
    },
    {
      title: "Total Products",
      Icon: FiPackage,
      quantity: dashboardOrderCount?.totalProduct || 0,
      link: "/products",
      tone: 0,
    },
    {
      title: "Pending Orders",
      Icon: FiRefreshCw,
      quantity:
        timeFilter === "year"
          ? dashboardOrderCount?.totalPendingOrder?.count || 0
          : getStatusCount("Pending"),
      amount: timeFilter === "year" ? dashboardOrderCount?.totalPendingOrder?.total || 0 : null,
      link: "/orders/pending",
      tone: 1,
    },
    {
      title: "Processing",
      Icon: FiTruck,
      quantity:
        timeFilter === "year"
          ? dashboardOrderCount?.totalProcessingOrder || 0
          : getStatusCount("Processing"),
      link: "/orders/processing",
      tone: 2,
    },
    {
      title: "Delivered",
      Icon: FiHome,
      quantity:
        timeFilter === "year"
          ? dashboardOrderCount?.totalDeliveredOrder || 0
          : getStatusCount("Delivered"),
      link: "/orders/delivered",
      variant: "success",
    },
    {
      title: "Cancelled",
      Icon: FiXCircle,
      quantity:
        timeFilter === "year"
          ? dashboardOrderCount?.totalCancelOrder || 0
          : getStatusCount("Cancel"),
      link: "/orders/canceled",
      variant: "danger",
    },
  ];

  return (
    <div className="admin-card p-5 md:p-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-base font-semibold text-store-800 dark:text-store-100">Overview</h2>
          <p className="admin-muted mt-0.5">Sales and orders at a glance</p>
        </div>
        <div className="inline-flex bg-store-50 dark:bg-store-900 p-1 rounded-xl border border-store-200 dark:border-store-700/40">
          {["week", "month", "year"].map((period) => (
            <button
              key={period}
              type="button"
              onClick={() => setTimeFilter(period)}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg capitalize transition-colors ${
                timeFilter === period
                  ? "bg-store-500 text-white"
                  : "text-store-600/70 hover:text-store-800 dark:text-store-300/70 dark:hover:text-store-100"
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 items-stretch">
        {topCards.map((card, i) => (
          <CardItem
            key={card.title}
            title={card.title}
            Icon={card.Icon}
            quantity={card.quantity}
            amount={card.amount}
            tone={card.tone}
            variant={card.variant}
            isAmount={card.isAmount}
            link={card.link}
            loading={false}
          />
        ))}
      </div>
    </div>
  );
};

export default ModernStats;
