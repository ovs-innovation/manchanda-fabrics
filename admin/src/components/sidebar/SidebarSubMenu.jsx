import React, { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  IoChevronDownOutline,
  IoChevronForwardOutline,
} from "react-icons/io5";

const SidebarSubMenu = ({ route, collapsed = false }) => {
  const { t } = useTranslation();
  const location = useLocation();

  const isChildActive = route.routes?.some((child) => {
    const childPath = child.path?.split("?")[0];
    return (
      location.pathname === childPath ||
      location.pathname.startsWith(`${childPath}/`)
    );
  });

  const [open, setOpen] = useState(isChildActive);

  useEffect(() => {
    if (isChildActive) setOpen(true);
  }, [isChildActive, location.pathname]);

  if (collapsed) {
    return (
      <li className="relative group" key={route.name}>
        <div
          className={`px-4 py-3.5 flex items-center justify-center rounded-xl mx-2 transition-colors ${
            isChildActive
              ? "bg-store-500/15 text-store-500"
              : "text-store-700/70 dark:text-store-200/70 hover:bg-store-100 dark:hover:bg-white/5"
          }`}
          title={t(route.name)}
        >
          <route.icon className="w-6 h-6" aria-hidden="true" />
        </div>
        <div className="absolute left-full top-0 ml-2 hidden group-hover:block z-50">
          <div className="min-w-[200px] py-2 bg-white dark:bg-store-900 rounded-xl shadow-xl border border-store-200 dark:border-store-700/40">
            <p className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-400">
              {t(route.name)}
            </p>
            {route.routes?.map((child, index) => (
              <NavLink
                key={index}
                to={child.path}
                className="block px-4 py-2 text-sm text-store-700 dark:text-store-200 hover:bg-store-50 dark:hover:bg-store-800/40 hover:text-store-600 transition-colors"
                activeClassName="text-store-600 bg-store-50 dark:bg-store-800/40 font-semibold"
              >
                {t(child.name)}
              </NavLink>
            ))}
          </div>
        </div>
      </li>
    );
  }

  return (
    <li className="relative" key={route.name}>
      <button
        type="button"
        className={`inline-flex items-center justify-between focus:outline-none w-full text-sm font-semibold transition-colors duration-150 px-6 py-3.5 rounded-xl mx-2 ${
          isChildActive
            ? "text-store-500 dark:text-store-300"
            : "text-store-700/80 dark:text-store-200/70 hover:text-store-500 dark:hover:text-store-100"
        }`}
        onClick={() => setOpen(!open)}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <span className="inline-flex items-center">
          <route.icon className="w-6 h-6" aria-hidden="true" />
          <span className="ml-4">{t(route.name)}</span>
        </span>
        <span className="ml-2 opacity-70">
          {open ? <IoChevronDownOutline className="w-4 h-4" /> : <IoChevronForwardOutline className="w-4 h-4" />}
        </span>
      </button>
      {open && route.routes && (
        <ul
          className="mt-1 mb-2 ml-4 mr-2 space-y-0.5 overflow-hidden text-sm font-medium border-l-2 border-store-500/20 pl-3"
          aria-label="submenu"
        >
          {route.routes.map((child, index) => (
            <li key={index}>
              {child.outside ? (
                <a
                  href={child.path}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center py-2.5 px-3 rounded-lg text-sm transition-colors duration-150 text-store-600/80 dark:text-store-200/70 hover:text-store-600 hover:bg-store-50/80 dark:hover:bg-store-800/30"
                >
                  {t(child.name)}
                </a>
              ) : (
                <NavLink
                  to={child.path}
                  className="flex items-center py-2.5 px-3 rounded-lg text-sm transition-colors duration-150 text-store-600/80 dark:text-store-200/70 hover:text-store-600 hover:bg-store-50/80 dark:hover:bg-store-800/30"
                  activeClassName="text-store-600 dark:text-store-300 bg-store-50 dark:bg-store-800/40 font-semibold"
                  rel="noreferrer"
                >
                  {t(child.name)}
                </NavLink>
              )}
            </li>
          ))}
        </ul>
      )}
    </li>
  );
};

export default SidebarSubMenu;
