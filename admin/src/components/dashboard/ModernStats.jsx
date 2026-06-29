import React from "react";
import {
  FiShoppingCart,
  FiUsers,
  FiFileText,
  FiTruck,
  FiHome,
  FiXCircle,
  FiRefreshCw,
  FiCreditCard,
  FiActivity,
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
  const filteredOrders = dashboardOrderAmount?.ordersData?.filter(order => {
    const orderDate = dayjs(order.updatedAt);
    if (timeFilter === "week") return orderDate.isAfter(dayjs().subtract(7, 'day'));
    if (timeFilter === "month") return orderDate.isAfter(dayjs().subtract(1, 'month'));
    return true;
  }) || [];

  const getStatusCount = (status) => filteredOrders.filter(o => o.status === status).length;

  // Top summary cards — same as Orders page style
  const topCards = [
    {
      title: "Total Sales",
      Icon: FiCreditCard,
      quantity: dashboardOrderAmount?.totalAmount || 0,
      className: "text-store-600 bg-store-100",
      isAmount: true,
      link: "/orders"
    },
    {
      title: "Total Orders",
      Icon: FiShoppingCart,
      quantity: timeFilter === 'year' ? (dashboardOrderCount?.totalOrder || 0) : filteredOrders.length,
      className: "text-orange-600 bg-orange-100",
      link: "/orders"
    },
    {
      title: "Total Customers",
      Icon: FiUsers,
      quantity: dashboardOrderCount?.totalCustomer || 0,
      className: "text-purple-600 bg-purple-100",
      link: "/customers"
    },
    {
      title: "Total Products",
      Icon: FiPackage,
      quantity: dashboardOrderCount?.totalProduct || 0,
      className: "text-blue-600 bg-blue-100",
      link: "/products"
    },
    {
      title: "Pending Orders",
      Icon: FiRefreshCw,
      quantity: timeFilter === 'year' ? (dashboardOrderCount?.totalPendingOrder?.count || 0) : getStatusCount("Pending"),
      amount: timeFilter === 'year' ? (dashboardOrderCount?.totalPendingOrder?.total || 0) : null,
      className: "text-yellow-600 bg-yellow-100",
      link: "/orders/pending"
    },
    {
      title: "Processing",
      Icon: FiTruck,
      quantity: timeFilter === 'year' ? (dashboardOrderCount?.totalProcessingOrder || 0) : getStatusCount("Processing"),
      className: "text-store-600 bg-store-100",
      link: "/orders/processing"
    },
    {
      title: "Delivered",
      Icon: FiHome,
      quantity: timeFilter === 'year' ? (dashboardOrderCount?.totalDeliveredOrder || 0) : getStatusCount("Delivered"),
      className: "text-green-600 bg-green-100",
      link: "/orders/delivered"
    },
    {
      title: "Cancelled",
      Icon: FiXCircle,
      quantity: timeFilter === 'year' ? (dashboardOrderCount?.totalCancelOrder || 0) : getStatusCount("Cancel"),
      className: "text-red-600 bg-red-100",
      link: "/orders/canceled"
    },
  ];

  return (
    <div className="w-full space-y-6 bg-white dark:bg-store-900 p-7 md:p-10 rounded-3xl shadow-sm border border-store-200 dark:border-store-700/40">

      {/* Period Filter Toggle */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-extrabold text-store-800 dark:text-store-100 tracking-tight">Overview</h2>
        <div className="inline-flex bg-store-50 dark:bg-store-900 p-1.5 rounded-xl border border-store-200 dark:border-store-700/40">
          {["week", "month", "year"].map((period) => (
            <button
              key={period}
              onClick={() => setTimeFilter(period)}
              className={`px-5 py-2 text-sm font-semibold rounded-lg capitalize transition-all duration-200 ${
                timeFilter === period
                  ? 'bg-store-500 text-white shadow-sm shadow-store-500/30'
                  : 'text-store-600/70 hover:text-store-800 dark:text-store-300/70 dark:hover:text-store-100'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards Grid — same CardItem as Orders page */}
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 items-stretch">
        {topCards.map((card, i) => (
          <CardItem
            key={i}
            title={card.title}
            Icon={card.Icon}
            quantity={card.quantity}
            amount={card.amount}
            className={card.className}
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

