import {
  FiGrid,
  FiUsers,
  FiUser,
  FiSettings,
  FiGift,
  FiBox,
  FiShoppingCart,
  FiLayers,
  FiPackage,
  FiHome,
  FiMessageSquare,
  FiHelpCircle,
} from "react-icons/fi";

/**
 * Manchanda Fabrics Admin — premium fashion store navigation.
 */
const sidebar = [
  {
    path: "/dashboard",
    icon: FiGrid,
    name: "Dashboard",
  },
  {
    icon: FiShoppingCart,
    name: "Orders",
    routes: [
      { path: "/orders", name: "All Orders" },
      { path: "/orders/pending", name: "Pending Orders" },
      { path: "/orders/processing", name: "Processing Orders" },
      { path: "/orders/on-the-way", name: "Shipped Orders" },
      { path: "/orders/delivered", name: "Delivered Orders" },
      { path: "/orders/canceled", name: "Cancelled Orders" },
      { path: "/orders/refunded", name: "Returned Orders" },
      { path: "/orders/refund-requested", name: "Refund Requests" },
    ],
  },
  {
    icon: FiLayers,
    name: "Catalog",
    routes: [
      { path: "/products", name: "Products" },
      { path: "/categories", name: "Categories" },
      { path: "/sub-categories", name: "Sub Categories" },
      { path: "/reviews", name: "Reviews" },
    ],
  },
  {
    icon: FiPackage,
    name: "Inventory",
    routes: [
      { path: "/inventory", name: "Stock Overview" },
      { path: "/inventory/low-stock", name: "Low Stock" },
      { path: "/inventory/out-of-stock", name: "Out Of Stock" },
    ],
  },
  {
    type: "title",
    name: "Customers & Marketing",
  },
  {
    path: "/customers",
    icon: FiUsers,
    name: "Customers",
  },
  {
    path: "/coupons",
    icon: FiGift,
    name: "Coupons",
  },
  {
    path: "/testimonials",
    icon: FiMessageSquare,
    name: "Testimonials",
  },
  {
    path: "/faqs",
    icon: FiHelpCircle,
    name: "FAQs",
  },
  {
    icon: FiSettings,
    name: "Settings",
    routes: [
      { path: "/settings/general", name: "General Settings" },
      { path: "/settings/business", name: "Business Settings" },
      { path: "/settings/payment", name: "Payment Methods" },
      { path: "/settings/order", name: "Order & Delivery" },
      { path: "/store/store-settings", name: "Payment & API Keys" },
      { path: "/store/homepage/overview", name: "Homepage Manager" },
      { path: "/store/customization?storeTab=seo-settings", name: "Store Customization" },
    ],
  },
  {
    path: "/our-staff",
    icon: FiUser,
    name: "Admins",
  },
];

export default sidebar;
