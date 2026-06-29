import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FiCalendar, 
  FiSmartphone, 
  FiBox, 
  FiTruck, 
  FiCheckCircle, 
  FiXCircle, 
  FiRefreshCcw, 
  FiAlertCircle 
} from 'react-icons/fi';

const DetailedOrderStatus = ({ dashboardOrderCount }) => {
  // Map counts from dashboard data where available, otherwise default to 0
  const pendingCount = dashboardOrderCount?.totalPendingOrder?.count || 0;
  const processingCount = dashboardOrderCount?.totalProcessingOrder || 0;
  const deliveredCount = dashboardOrderCount?.totalDeliveredOrder || 0;
  const canceledCount = dashboardOrderCount?.totalCancelOrder || 0;
  
  // These statuses might not exist in the basic schema, so defaulting to 0
  const acceptedCount = dashboardOrderCount?.totalAcceptedOrder || 0;
  const outForDeliveryCount = dashboardOrderCount?.totalOutForDeliveryOrder || 0;
  const refundedCount = dashboardOrderCount?.totalRefundedOrder || 0;
  const paymentFailedCount = dashboardOrderCount?.totalFailedOrder || 0;

  const cards = [
    {
      title: "Unassigned Orders",
      value: pendingCount,
      valueColor: "text-gray-500 dark:text-gray-400",
      iconBg: "bg-blue-50 dark:bg-blue-900/30",
      iconColor: "text-blue-500",
      Icon: FiCalendar,
      link: "/orders/pending"
    },
    {
      title: "Accepted By Delivery Man",
      value: acceptedCount,
      valueColor: "text-store-500",
      iconBg: "bg-store-50 dark:bg-store-800/40",
      iconColor: "text-store-500",
      Icon: FiSmartphone,
      link: "/orders/accepted"
    },
    {
      title: "Packaging",
      value: processingCount,
      valueColor: "text-gray-600 dark:text-gray-300",
      iconBg: "bg-orange-50 dark:bg-orange-900/30",
      iconColor: "text-orange-500",
      Icon: FiBox,
      link: "/orders/processing"
    },
    {
      title: "Out For Delivery",
      value: outForDeliveryCount,
      valueColor: "text-store-500",
      iconBg: "bg-store-100 dark:bg-store-800/40",
      iconColor: "text-store-500",
      Icon: FiTruck,
      link: "/orders/on-the-way"
    },
    {
      title: "Delivered",
      value: deliveredCount,
      valueColor: "text-store-600",
      iconBg: "bg-green-50 dark:bg-green-900/30",
      iconColor: "text-green-500",
      Icon: FiCheckCircle,
      link: "/orders/delivered"
    },
    {
      title: "Canceled",
      value: canceledCount,
      valueColor: "text-red-500",
      iconBg: "bg-red-50 dark:bg-red-900/30",
      iconColor: "text-red-500",
      Icon: FiXCircle,
      link: "/orders/canceled"
    },
    {
      title: "Refunded",
      value: refundedCount,
      valueColor: "text-red-500",
      iconBg: "bg-pink-50 dark:bg-pink-900/30",
      iconColor: "text-pink-500",
      Icon: FiRefreshCcw,
      link: "/orders/refunded"
    },
    {
      title: "Payment Failed",
      value: paymentFailedCount,
      valueColor: "text-red-500",
      iconBg: "bg-rose-50 dark:bg-rose-900/30",
      iconColor: "text-rose-500",
      Icon: FiAlertCircle,
      link: "/orders/payment-failed"
    }
  ];

  return (
    <div className="w-full bg-white dark:bg-store-900 p-6 md:p-8 rounded-3xl shadow-sm border border-store-200 dark:border-store-700/40 mt-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, index) => (
          <Link 
            key={index} 
            to={card.link}
            className="flex items-center justify-between p-4 bg-store-50 dark:bg-store-800/30 rounded-2xl border border-store-200 dark:border-store-700/40 hover:shadow-md hover:border-store-300 dark:hover:border-store-600 transition-all duration-300 group no-underline"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.iconBg} group-hover:scale-110 transition-transform duration-300`}>
                <card.Icon className={`w-5 h-5 ${card.iconColor}`} />
              </div>
              <span className="text-sm font-semibold text-store-700 dark:text-store-200 max-w-[120px] leading-tight group-hover:text-store-600 dark:group-hover:text-store-300 transition-colors">
                {card.title}
              </span>
            </div>
            <span className={`text-xl font-bold ${card.valueColor} group-hover:scale-110 transition-transform duration-300`}>
              {card.value}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default DetailedOrderStatus;
