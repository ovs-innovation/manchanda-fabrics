import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import Cookies from "js-cookie";
import { useTranslation } from "react-i18next";
import { Button } from "@windmill/react-ui";
import { IoLogOutOutline } from "react-icons/io5";
import { FiChevronsLeft, FiChevronsRight } from "react-icons/fi";

import sidebar from "@/routes/sidebar";
import { AdminContext } from "@/context/AdminContext";
import { SidebarContext } from "@/context/SidebarContext";
import SidebarSubMenu from "@/components/sidebar/SidebarSubMenu";
import useGetCData from "@/hooks/useGetCData";
import { ADMIN_BRAND_LOGO } from "@/utils/cloudinaryUrl";

const SidebarContent = ({ collapsed = false, onToggleCollapse }) => {
  const { t } = useTranslation();
  const { dispatch } = useContext(AdminContext);
  const { globalSetting } = useContext(SidebarContext);
  const { accessList, role } = useGetCData();

  const allSidebarRouteKeys = sidebar
    .flatMap((route) => {
      if (route.routes) {
        return route.routes.map((r) => r.path?.split("?")[0].split("/")[1]);
      }
      if (route.path) {
        return [route.path.split("?")[0].split("/")[1]];
      }
      return [];
    })
    .filter(Boolean);

  const handleLogOut = () => {
    dispatch({ type: "USER_LOGOUT" });
    Cookies.remove("adminInfo");
  };

  const effectiveAccessList =
    role === "Super Admin" || role === "Admin"
      ? allSidebarRouteKeys
      : Array.isArray(accessList) && accessList.length > 0
        ? accessList.filter(Boolean)
        : allSidebarRouteKeys;

  const updatedSidebar = sidebar
    .map((route) => {
      if (route.routes) {
        const validSubRoutes = route.routes.filter((subRoute) => {
          const routeKey = subRoute.path?.split("?")[0].split("/")[1];
          return effectiveAccessList.includes(routeKey) || subRoute.outside;
        });

        if (validSubRoutes.length > 0) {
          return { ...route, routes: validSubRoutes };
        }
        return null;
      }

      if (route.type === "title") return route;
      const routeKey = route.path?.split("?")[0].split("/")[1];
      return routeKey && effectiveAccessList.includes(routeKey) ? route : null;
    })
    .filter(Boolean);

  return (
    <div className={`flex flex-col h-full ${collapsed ? "items-center px-2 py-4" : "px-3 py-4"}`}>
      <div className={`flex items-center w-full ${collapsed ? "flex-col gap-2" : "justify-between gap-3 px-2 mb-1"}`}>
        <a className="block shrink-0" href="/dashboard" title="Dashboard">
          <img
            src={ADMIN_BRAND_LOGO}
            alt={globalSetting?.company_name || "Manchanda Fabrics"}
            className={`object-contain ${collapsed ? "h-9 w-9" : "h-10 w-auto max-w-[170px]"}`}
          />
        </a>
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg text-store-500/70 hover:text-store-600 hover:bg-store-100 dark:hover:bg-white/5 transition-colors"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <FiChevronsRight className="w-4 h-4" /> : <FiChevronsLeft className="w-4 h-4" />}
          </button>
        )}
      </div>

      {!collapsed && (
        <p className="px-3 mt-2 mb-3 text-[11px] font-medium text-store-500/70">
          Manchanda Fabrics Admin
        </p>
      )}

      <ul className={`flex-1 overflow-y-auto w-full space-y-1 ${collapsed ? "mt-2" : ""}`}>
        {updatedSidebar?.map((route) =>
          route.type === "title" ? (
            !collapsed && (
              <li className="px-3 pt-4 pb-1 first:pt-2" key={route.name}>
                <span className="text-[11px] font-semibold tracking-wide text-store-500/60 uppercase">
                  {t(route.name)}
                </span>
              </li>
            )
          ) : route.routes ? (
            <SidebarSubMenu route={route} key={route.name} collapsed={collapsed} />
          ) : (
            <li className="relative" key={route.name}>
              <NavLink
                exact
                to={route.path}
                target={`${route?.outside ? "_blank" : "_self"}`}
                className={`admin-nav-item inline-flex items-center w-full text-sm font-medium text-store-700/80 dark:text-store-200/80 hover:text-store-700 hover:bg-store-100/70 dark:hover:bg-white/5 ${
                  collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5"
                }`}
                activeClassName="is-active font-semibold"
                rel="noreferrer"
                title={collapsed ? t(route.name) : undefined}
              >
                <route.icon className="w-5 h-5 shrink-0" aria-hidden="true" />
                {!collapsed && <span className="ml-3">{t(route.name)}</span>}
              </NavLink>
            </li>
          )
        )}
      </ul>

      <div className={`mt-3 w-full ${collapsed ? "px-1" : "px-2"}`}>
        <Button onClick={handleLogOut} size="small" layout="outline" className={`w-full !border-store-200 ${collapsed ? "!px-2" : ""}`}>
          <span className={`flex items-center justify-center ${collapsed ? "" : "gap-2"}`}>
            <IoLogOutOutline className="text-lg" />
            {!collapsed && <span>{t("LogOut")}</span>}
          </span>
        </Button>
      </div>
    </div>
  );
};

export default SidebarContent;
