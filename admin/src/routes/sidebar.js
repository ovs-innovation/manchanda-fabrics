import {
  FiGrid,
  FiUsers,
  FiUser,
  FiSettings,
  FiGift,
  FiShoppingCart,
  FiLayers,
  FiPackage,
} from "react-icons/fi";

/**
 * Manchanda Fabrics Admin — simple navigation
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
      { path: "/orders/pending", name: "Pending" },
      { path: "/orders/processing", name: "Processing" },
      { path: "/orders/on-the-way", name: "Shipped" },
      { path: "/orders/delivered", name: "Delivered" },
    ],
  },
  {
    icon: FiLayers,
    name: "Catalog",
    routes: [
      { path: "/products", name: "Products" },
      { path: "/categories", name: "Categories" },
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
    icon: FiSettings,
    name: "Settings",
    routes: [
      { path: "/settings/business", name: "Business & Contact" },
      { path: "/store/homepage/overview", name: "Website Content" },
      { path: "/settings/payment", name: "Payment" },
      { path: "/settings/order", name: "Delivery" },
    ],
  },
  {
    path: "/our-staff",
    icon: FiUser,
    name: "Admins",
  },
];

export default sidebar;
