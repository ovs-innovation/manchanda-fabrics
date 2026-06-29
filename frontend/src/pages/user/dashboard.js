import Cookies from "js-cookie";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useContext, useEffect, useState } from "react";
import { IoLockOpenOutline } from "react-icons/io5";
import {
  FiBell,
  FiCheck,
  FiGrid,
  FiList,
  FiRefreshCw,
  FiSettings,
  FiShoppingCart,
  FiTruck,
  FiUser,
  FiMapPin,
  FiHeart,
  FiChevronRight,
  FiShoppingBag,
} from "react-icons/fi";
import { signOut, useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";

import Layout from "@layout/Layout";
import Card from "@components/order-card/Card";
import OrderServices from "@services/OrderServices";
import RecentOrder from "@pages/user/recent-order";
import CustomerServices from "@services/CustomerServices";
import { SidebarContext } from "@context/SidebarContext";
import { UserContext } from "@context/UserContext";
import Loading from "@components/preloader/Loading";
import useGetSetting from "@hooks/useGetSetting";
import useUtilsFunction from "@hooks/useUtilsFunction";
import { setToken } from "@services/httpServices";

const Dashboard = ({ title, description, children }) => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { state: userState, dispatch } = useContext(UserContext);
  const { isLoading, setIsLoading, currentPage } = useContext(SidebarContext);

  const { storeCustomizationSetting } = useGetSetting();
  const { showingTranslateValue } = useUtilsFunction();
  const [isOpen, setIsOpen] = useState(false);

  const userInfo = userState?.userInfo || session?.user;
  const userId = userInfo?._id || userInfo?.id;
  const isAuthenticated = !!userInfo?.token || status === "authenticated";

  const {
    data,
    error,
    isLoading: loading,
  } = useQuery({
    queryKey: ["orders", { currentPage, user: userId }],
    queryFn: async () =>
      await OrderServices.getOrderCustomer({
        page: currentPage,
        limit: 10,
      }),
    enabled: isAuthenticated,
  });

  const { data: shippingAddressesResponse } = useQuery({
    queryKey: ["shippingAddress", { id: userId }],
    queryFn: async () =>
      await CustomerServices.getShippingAddress({
        userId: userId,
      }),
    enabled: !!userId && isAuthenticated,
  });

  const shippingAddresses = Array.isArray(shippingAddressesResponse?.shippingAddress)
    ? shippingAddressesResponse.shippingAddress
    : shippingAddressesResponse?.shippingAddress
      ? [shippingAddressesResponse.shippingAddress]
      : [];

  const defaultAddress = shippingAddresses.find(addr => addr.isDefault) || shippingAddresses[0] || null;

  const handleLogOut = async () => {
    Cookies.remove("userInfo");
    Cookies.remove("couponInfo");
    setToken(null);
    dispatch({ type: "USER_LOGOUT" });
    await signOut({ redirect: false });
    router.push("/");
  };

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const userSidebar = [
    {
      title: showingTranslateValue(
        storeCustomizationSetting?.dashboard?.dashboard_title
      ),
      href: "/user/dashboard",
      icon: FiGrid,
    },

    {
      title: showingTranslateValue(
        storeCustomizationSetting?.dashboard?.my_order
      ),
      href: "/user/my-orders",
      icon: FiList,
    },
    {
      title: "Notifications",
      href: "/user/notifications",
      icon: FiBell,
    },
    {
      title: "My Account",
      href: "/user/my-account",
      icon: FiUser,
    },
    {
      title: "Track Order",
      href: "/user/track-order",
      icon: FiTruck,
    },

    {
      title: showingTranslateValue(
        storeCustomizationSetting?.dashboard?.update_profile
      ),
      href: "/user/update-profile",
      icon: FiSettings,
    },
  ];

  return (
    <>
      {isLoading ? (
        <Loading loading={isLoading} />
      ) : (
        <Layout
          title={title ? title : "Dashboard"}
          description={description ? description : "This is User Dashboard"}
        >
          <div className="bg-[#FAF7F5] min-h-screen user-dashboard-wrapper">
            <style dangerouslySetInnerHTML={{ __html: `
              .user-dashboard-wrapper {
                background-color: #FAF7F5 !important;
              }
              .user-dashboard-wrapper .bg-white {
                background-color: #ffffff !important;
                border-color: #E6D1CB !important;
              }
              .user-dashboard-wrapper .border-gray-50,
              .user-dashboard-wrapper .border-gray-100,
              .user-dashboard-wrapper .border-gray-200,
              .user-dashboard-wrapper .divide-gray-100 > :not([hidden]) ~ :not([hidden]) {
                border-color: #E6D1CB !important;
              }
              .user-dashboard-wrapper .bg-gray-50,
              .user-dashboard-wrapper .bg-gray-50\\/30 {
                background-color: #FAF7F5 !important;
              }
              .user-dashboard-wrapper .bg-gray-50\\/50 {
                background-color: #FAF7F5 !important;
              }
              .user-dashboard-wrapper text-gray-800,
              .user-dashboard-wrapper .text-gray-800,
              .user-dashboard-wrapper .text-gray-900,
              .user-dashboard-wrapper h1,
              .user-dashboard-wrapper h2,
              .user-dashboard-wrapper h3,
              .user-dashboard-wrapper h4 {
                color: #3B2A25 !important;
              }
              .user-dashboard-wrapper .text-gray-600 {
                color: #3B2A25 !important;
                opacity: 0.9 !important;
              }
              .user-dashboard-wrapper .text-gray-500 {
                color: #3B2A25 !important;
                opacity: 0.7 !important;
              }
              .user-dashboard-wrapper .text-gray-400 {
                color: #3B2A25 !important;
                opacity: 0.6 !important;
              }
              
              /* Form Inputs styling */
              .user-dashboard-wrapper input,
              .user-dashboard-wrapper textarea,
              .user-dashboard-wrapper select {
                background-color: #ffffff !important;
                color: #3B2A25 !important;
                border-color: #E6D1CB !important;
              }
              .user-dashboard-wrapper input:focus,
              .user-dashboard-wrapper textarea:focus,
              .user-dashboard-wrapper select:focus {
                border-color: #9C6A5A !important;
                box-shadow: 0 0 0 2px rgba(156, 106, 90, 0.15) !important;
              }
              
              /* Address modal and other modal slide overs */
              .user-dashboard-wrapper .bg-white.shadow-xl {
                background-color: #ffffff !important;
                border-left: 1px solid #E6D1CB !important;
              }
              .user-dashboard-wrapper .border-gray-200 {
                border-color: #E6D1CB !important;
              }
              .user-dashboard-wrapper label {
                color: #3B2A25 !important;
              }
              
              /* Button overrides */
              .user-dashboard-wrapper .bg-store-500 {
                background-color: #9C6A5A !important;
                color: #ffffff !important;
              }
              .user-dashboard-wrapper .bg-store-500:hover {
                background-color: #6F4A3D !important;
              }
              .user-dashboard-wrapper .border-store-500 {
                border-color: #9C6A5A !important;
              }
              .user-dashboard-wrapper .text-store-600 {
                color: #9C6A5A !important;
              }
              .user-dashboard-wrapper .bg-store-50 {
                background-color: #FAF7F5 !important;
              }
              
              /* Tables styling */
              .user-dashboard-wrapper tr.hover\\:bg-gray-50\\/60:hover {
                background-color: rgba(156, 106, 90, 0.03) !important;
              }
              .user-dashboard-wrapper .divide-y > :not([hidden]) ~ :not([hidden]) {
                border-color: #E6D1CB !important;
              }
              
              /* Status Badge customization for light mode */
              .user-dashboard-wrapper .bg-emerald-100 {
                background-color: rgba(16, 185, 129, 0.1) !important;
                color: #047857 !important;
                border-color: rgba(16, 185, 129, 0.15) !important;
              }
              .user-dashboard-wrapper .bg-amber-100 {
                background-color: rgba(245, 158, 11, 0.1) !important;
                color: #b45309 !important;
                border-color: rgba(245, 158, 11, 0.15) !important;
              }
              .user-dashboard-wrapper .bg-indigo-100 {
                background-color: rgba(99, 102, 241, 0.1) !important;
                color: #4338ca !important;
                border-color: rgba(99, 102, 241, 0.15) !important;
              }
              .user-dashboard-wrapper .bg-red-100 {
                background-color: rgba(239, 68, 68, 0.1) !important;
                color: #b91c1c !important;
                border-color: rgba(239, 68, 68, 0.15) !important;
              }
              .user-dashboard-wrapper .bg-blue-100 {
                background-color: rgba(59, 130, 246, 0.1) !important;
                color: #1d4ed8 !important;
                border-color: rgba(59, 130, 246, 0.15) !important;
              }
              .user-dashboard-wrapper .bg-gray-100 {
                background-color: rgba(59, 130, 246, 0.05) !important;
                color: #3B2A25 !important;
                border-color: rgba(59, 130, 246, 0.1) !important;
              }

              /* Notification List Items */
              .user-dashboard-wrapper .from-store-50\\/80 {
                --tw-gradient-from: rgba(156, 106, 90, 0.05) !important;
                --tw-gradient-to: #ffffff !important;
                --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important;
              }
              .user-dashboard-wrapper .to-white {
                --tw-gradient-to: #ffffff !important;
              }
              .user-dashboard-wrapper .hover\\:bg-gray-50\\/80:hover {
                background-color: rgba(156, 106, 90, 0.03) !important;
              }
              .user-dashboard-wrapper .border-store-200 {
                border-color: #E6D1CB !important;
              }
              .user-dashboard-wrapper .from-store-100 {
                --tw-gradient-from: #FAF7F5 !important;
              }
              .user-dashboard-wrapper .to-store-200 {
                --tw-gradient-to: #ffffff !important;
              }
              .user-dashboard-wrapper .hover\\:bg-store-50:hover {
                background-color: rgba(156, 106, 90, 0.05) !important;
              }
              .user-dashboard-wrapper .hover\\:text-store-700:hover {
                color: #9C6A5A !important;
              }

              /* Address card special overrides */
              .user-dashboard-wrapper .border-store-500.bg-store-50\\/10 {
                border-color: #9C6A5A !important;
                background-color: rgba(156, 106, 90, 0.03) !important;
              }

              /* Address type badge */
              .user-dashboard-wrapper .bg-indigo-50 {
                background-color: rgba(99, 102, 241, 0.08) !important;
                color: #4338ca !important;
                border-color: rgba(99, 102, 241, 0.15) !important;
              }
              .user-dashboard-wrapper .bg-amber-50 {
                background-color: rgba(245, 158, 11, 0.08) !important;
                color: #b45309 !important;
                border-color: rgba(245, 158, 11, 0.15) !important;
              }
              
              /* Pagination styling */
              .user-dashboard-wrapper .page--item {
                border-color: #E6D1CB !important;
                background-color: #ffffff !important;
              }
              .user-dashboard-wrapper .page--link {
                color: #3B2A25 !important;
              }
              .user-dashboard-wrapper .page--link:hover {
                color: #9C6A5A !important;
              }
              .user-dashboard-wrapper .page-previous-link,
              .user-dashboard-wrapper .page-next-link {
                border-color: #E6D1CB !important;
                background-color: #ffffff !important;
                color: #3B2A25 !important;
              }
              .user-dashboard-wrapper .page-previous-link:hover,
              .user-dashboard-wrapper .page-next-link:hover {
                background-color: #9C6A5A !important;
                color: #ffffff !important;
                border-color: #9C6A5A !important;
              }
              .user-dashboard-wrapper .activePagination {
                background: #9C6A5A !important;
                border-color: #9C6A5A !important;
                color: #ffffff !important;
              }
            ` }} />
            <div className="mx-auto max-w-screen-2xl px-3 sm:px-10">
              <div className="py-10 lg:py-12 flex flex-col lg:flex-row w-full">
                <div className="flex-shrink-0 w-full lg:w-80 mr-7 lg:mr-10 xl:mr-10">
                  {/* Mobile Header */}
                  <div className="bg-white border border-[#E6D1CB]/60 p-4 rounded-xl mb-5 lg:hidden flex justify-between items-center shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-full overflow-hidden border border-[#9C6A5A]/20 bg-[#FAF7F5] flex items-center justify-center">
                        {userInfo?.image ? (
                          <img
                            src={userInfo.image}
                            alt={userInfo?.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-[#9C6A5A] text-lg font-black">
                            {userInfo?.name?.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-[#3B2A25] leading-tight">
                          {userInfo?.name}
                        </h2>
                        <span className="text-xs text-[#3B2A25]/60">
                          {userInfo?.email || userInfo?.phone || "—"}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsOpen(!isOpen)}
                      className="p-2.5 bg-[#FAF7F5] border border-[#E6D1CB]/60 rounded-xl text-[#9C6A5A] hover:bg-[#E6D1CB]/20 hover:text-[#9C6A5A] transition-all shadow-md"
                    >
                      <FiGrid className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Sidebar Menu */}
                  <div className={`${isOpen ? 'block' : 'hidden'} lg:block bg-white border border-[#E6D1CB]/60 p-6 rounded-xl shadow-lg sticky top-32`}>
                    {/* User Profile Header (Desktop) */}
                    <div className="hidden lg:flex flex-col items-center mb-8 pb-8 border-b border-[#E6D1CB]/40">
                      <div className="relative w-20 h-20 rounded-full overflow-hidden mb-4 shadow-lg border-2 border-[#9C6A5A]/30 bg-[#FAF7F5] flex items-center justify-center">
                        {userInfo?.image ? (
                          <img
                            src={userInfo.image}
                            alt={userInfo?.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-[#9C6A5A] text-3xl font-black">
                            {userInfo?.name?.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <h2 className="text-lg font-serif font-bold text-[#3B2A25] text-center line-clamp-1">
                        {userInfo?.name}
                      </h2>
                      <p className="text-sm text-[#3B2A25]/60 text-center line-clamp-1">
                        {userInfo?.email || userInfo?.phone || "—"}
                      </p>
                    </div>

                    <div className="space-y-1">
                      {userSidebar?.map((item) => {
                        const isActive = router.pathname === item.href;
                        return (
                          <Link
                            key={item.title}
                            href={item.href}
                            className={`group flex items-center px-4 py-3 text-sm font-bold rounded-xl transition-all duration-200 border ${
                              isActive
                                ? 'bg-[#9C6A5A] text-white border-[#9C6A5A] shadow-[0_4px_20px_rgba(156,106,90,0.15)]'
                                : 'text-[#3B2A25]/70 border-transparent hover:bg-[#FAF7F5] hover:text-[#3B2A25] hover:border-[#E6D1CB]/40'
                            }`}
                          >
                            <item.icon
                              className={`flex-shrink-0 h-5 w-5 mr-3 transition-colors ${
                                isActive ? 'text-white' : 'text-[#3B2A25]/60 group-hover:text-[#3B2A25]'
                              }`}
                              aria-hidden="true"
                            />
                            {item.title}
                          </Link>
                        );
                      })}

                      <button
                        onClick={handleLogOut}
                        className="w-full flex items-center px-4 py-3 text-sm font-bold rounded-xl text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all duration-200 mt-4 border-t border-[#E6D1CB]/40 pt-6"
                      >
                        <IoLockOpenOutline className="flex-shrink-0 h-5 w-5 mr-3" />
                        {showingTranslateValue(storeCustomizationSetting?.navbar?.logout) || "Logout"}
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="w-full mt-4 lg:mt-0 lg:ml-4 overflow-hidden">
                  {!children && (
                    <div className="space-y-6">
                      <div className="mb-4">
                        <h2 className="text-2xl font-serif font-light text-[#3B2A25]">
                          Welcome back, {userInfo?.name}!
                        </h2>
                        <p className="text-xs text-[#3B2A25]/60 mt-1">
                          Manage your orders, saved addresses, and profile details below.
                        </p>
                      </div>

                      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
                        {/* Main Customer Actions & Latest Order */}
                        <div className="lg:col-span-2 space-y-6">
                          {/* Latest Order Status */}
                          <div className="bg-white border border-[#E6D1CB]/60 rounded-2xl p-6 shadow-md">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-[#9C6A5A] mb-4">
                              Latest Order
                            </h3>
                            {data?.orders && data.orders.length > 0 ? (
                              (() => {
                                const latestOrder = data.orders[0];
                                return (
                                  <div className="space-y-4">
                                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E6D1CB]/40 pb-3">
                                      <div>
                                        <span className="font-mono text-xs font-bold text-[#9C6A5A] bg-[#FAF7F5] px-2.5 py-1 rounded border border-[#E6D1CB]">
                                          #{latestOrder?._id?.slice(-6).toUpperCase()}
                                        </span>
                                        <span className="text-[11px] text-[#3B2A25]/60 ml-3">
                                          Placed on {new Date(latestOrder.createdAt).toLocaleDateString()}
                                        </span>
                                      </div>
                                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                                        latestOrder.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                        latestOrder.status === 'Cancel' ? 'bg-red-50 text-red-700 border-red-200' :
                                        'bg-orange-50 text-orange-700 border-orange-200'
                                      }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${
                                          latestOrder.status === 'Delivered' ? 'bg-emerald-500' :
                                          latestOrder.status === 'Cancel' ? 'bg-red-500' : 'bg-orange-500'
                                        }`} />
                                        {latestOrder.status}
                                      </span>
                                    </div>

                                    <div className="flex justify-between items-center py-1">
                                      <div className="text-sm font-bold text-[#3B2A25]">
                                        Total: <span className="text-[#9C6A5A]">{showingTranslateValue(storeCustomizationSetting?.theme?.currency) || "₹"}{parseFloat(latestOrder.total).toFixed(2)}</span>
                                      </div>
                                      <div className="flex gap-2.5">
                                        <Link
                                          href={`/order/${latestOrder._id}`}
                                          className="text-xs font-bold uppercase tracking-wider text-[#3B2A25]/80 hover:text-[#3B2A25] bg-[#FAF7F5] border border-[#E6D1CB]/60 px-4 py-2 rounded-xl transition-all duration-200"
                                        >
                                          View Details
                                        </Link>
                                        <Link
                                          href={`/order/${latestOrder._id}`}
                                          className="text-xs font-bold uppercase tracking-wider text-white bg-[#9C6A5A] hover:bg-[#6F4A3D] px-4 py-2 rounded-xl transition-all duration-200"
                                        >
                                          Track Package
                                        </Link>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })()
                            ) : (
                              <div className="py-6 text-center">
                                <p className="text-sm text-[#3B2A25]/60 mb-4">You have not placed any orders yet.</p>
                                <Link
                                  href="/"
                                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white bg-[#9C6A5A] hover:bg-[#6F4A3D] px-6 py-3 rounded-xl transition-all duration-200"
                                >
                                  <FiShoppingBag size={14} /> Shop Collections
                                </Link>
                              </div>
                            )}
                          </div>

                          {/* Recent Orders List */}
                          <RecentOrder data={data} loading={loading} error={error} />
                        </div>

                        {/* Right Column: Default Address Preview */}
                        <div>
                          <div className="bg-white border border-[#E6D1CB]/60 rounded-2xl p-6 shadow-md h-full flex flex-col justify-between">
                            <div>
                              <h3 className="text-xs font-bold uppercase tracking-widest text-[#9C6A5A] mb-4">
                                Default Address
                              </h3>
                              {defaultAddress ? (
                                <div className="space-y-4">
                                  <div>
                                    <span className="px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest rounded-lg border bg-indigo-50 text-indigo-700 border-indigo-200">
                                      {defaultAddress.addressType || "Home"}
                                    </span>
                                    <h4 className="text-base font-bold text-[#3B2A25] mt-2">
                                      {defaultAddress.name}
                                    </h4>
                                    <p className="text-xs text-[#3B2A25]/60 mt-1 font-medium">
                                      {defaultAddress.phone}
                                    </p>
                                  </div>
                                  <p className="text-sm text-[#3B2A25]/80 leading-relaxed border-t border-[#E6D1CB]/40 pt-3">
                                    {defaultAddress.address}, {defaultAddress.city}, {defaultAddress.country} - <span className="font-bold text-[#3B2A25]">{defaultAddress.zipCode}</span>
                                  </p>
                                </div>
                              ) : (
                                <div className="py-6 text-center">
                                  <p className="text-xs text-[#3B2A25]/60 leading-relaxed">No delivery addresses saved yet. Add a default shipping location.</p>
                                </div>
                              )}
                            </div>
                            <div className="mt-6">
                              <Link
                                href="/user/my-account"
                                className="w-full flex items-center justify-center gap-1.5 text-center text-xs font-bold uppercase tracking-wider text-white bg-[#9C6A5A] hover:bg-[#6F4A3D] py-3 rounded-xl transition-all duration-200"
                              >
                                {defaultAddress ? "Edit Address" : "Add Address"}
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {children}
                </div>
              </div>
            </div>
          </div>
        </Layout>
      )}
    </>
  );
};

export default dynamic(() => Promise.resolve(Dashboard), { ssr: false });
