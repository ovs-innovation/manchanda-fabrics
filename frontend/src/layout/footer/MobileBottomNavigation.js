import React, { useContext, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCart } from "react-use-cart";
import { FiHome, FiShoppingCart, FiHeart, FiFileText, FiSearch, FiBell } from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";
import useCustomerAuth from "@hooks/useCustomerAuth";
import CustomerNotificationServices from "@services/CustomerNotificationServices";
import { SidebarContext } from "@context/SidebarContext";
import useWishlist from "@hooks/useWishlist";
import useGetSetting from "@hooks/useGetSetting";

const MobileBottomNavigation = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const router = useRouter();
  const { totalItems } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { toggleCartDrawer, toggleSearch, showSearch } = useContext(SidebarContext);
  const { storeCustomizationSetting } = useGetSetting();
  const { isLoggedIn, userId } = useCustomerAuth();

  const { data: notifData } = useQuery({
    queryKey: ["customerNotifications", userId, "badge"],
    queryFn: () => CustomerNotificationServices.getUnreadCount(),
    enabled: isLoggedIn,
    refetchInterval: 60000,
  });

  const unreadCount = notifData?.unreadCount || 0;

  const isActive = (href) => router.pathname === href;

  if (!mounted) {
    return null;
  }

  return (
    <div className="lg:hidden fixed bottom-0 w-full bg-[#FAF7F5] z-50 shadow-[0_-2px_12px_rgba(43,33,30,0.06)] border-t border-[#E6D1CB]/70 safe-area-bottom">
      <div className="flex justify-between items-center px-2 sm:px-4 py-2">
        {/* Notifications */}
        <Link
          href={isLoggedIn ? "/user/notifications" : "/auth/login"}
          className={`flex flex-col items-center justify-center w-full relative ${isActive("/user/notifications") ? "text-[#9C6A5A]" : "text-[#3B2A25]/70 hover:text-[#3B2A25]"}`}
        >
          <div className="relative">
          <FiBell className="w-5 h-5 sm:w-6 sm:h-6 mb-0.5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#9C6A5A] text-white text-[9px] font-bold rounded-full h-4 min-w-[16px] px-0.5 flex items-center justify-center border border-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </div>
          <span className="text-[9px] sm:text-[10px] font-medium leading-none">Alerts</span>
        </Link>

        {/* My Orders */}
        <Link href="/user/my-orders" className={`flex flex-col items-center justify-center w-full ${isActive("/user/my-orders") ? "text-[#9C6A5A]" : "text-[#3B2A25]/70 hover:text-[#3B2A25]"}`}>
          <FiFileText className="w-5 h-5 sm:w-6 sm:h-6 mb-0.5" />
          <span className="text-[9px] sm:text-[10px] font-medium leading-none">Orders</span>
        </Link>

        {/* Cart */}
        <button 
          onClick={toggleCartDrawer} 
          className={`flex flex-col items-center justify-center w-full relative ${router.pathname === "/cart" ? "text-[#9C6A5A]" : "text-[#3B2A25]/70 hover:text-[#3B2A25]"}`}
        >
          <div className="relative">
            <FiShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 mb-0.5" />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#9C6A5A] text-white text-[9px] font-bold rounded-full h-4 min-w-[16px] px-0.5 flex items-center justify-center border border-white">
                {totalItems}
              </span>
            )}
          </div>
          <span className="text-[9px] sm:text-[10px] font-medium leading-none">Cart</span>
        </button>

        {/* Search */}
        <button 
          onClick={toggleSearch} 
          className={`flex flex-col items-center justify-center w-full ${showSearch ? "text-[#9C6A5A]" : "text-[#3B2A25]/70 hover:text-[#3B2A25]"}`}
        >
          <FiSearch className="w-5 h-5 sm:w-6 sm:h-6 mb-0.5" />
          <span className="text-[9px] sm:text-[10px] font-medium leading-none">Search</span>
        </button>

        {/* WishList */}
        <Link href="/wishlist" className={`flex flex-col items-center justify-center w-full ${isActive("/wishlist") ? "text-[#9C6A5A]" : "text-[#3B2A25]/70 hover:text-[#3B2A25]"}`}>
          <div className="relative">
            <FiHeart className="w-5 h-5 sm:w-6 sm:h-6 mb-0.5" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#9C6A5A] text-white text-[9px] font-bold rounded-full h-4 min-w-[16px] px-0.5 flex items-center justify-center border border-white">
                {wishlistCount}
              </span>
            )}
          </div>
          <span className="text-[9px] sm:text-[10px] font-medium leading-none">WishList</span>
        </Link>
      </div>
    </div>
  );
};

export default MobileBottomNavigation;
