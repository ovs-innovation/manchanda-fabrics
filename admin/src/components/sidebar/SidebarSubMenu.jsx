import React, { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { IoChevronDownOutline, IoChevronForwardOutline } from "react-icons/io5";

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
          className={`admin-nav-item px-2 py-2.5 flex items-center justify-center ${
            isChildActive ? "is-active" : "text-store-700/80 dark:text-store-200/80"
          }`}
          title={t(route.name)}
        >
          <route.icon className="w-5 h-5" aria-hidden="true" />
        </div>
        <div className="absolute left-full top-0 ml-2 hidden group-hover:block z-50">
          <div className="min-w-[210px] py-2 admin-card">
            <p className="px-3 py-2 text-xs font-semibold text-store-500/70">{t(route.name)}</p>
            {route.routes?.map((child, index) => (
              <NavLink
                key={index}
                to={child.path}
                className="block px-3 py-2 text-sm text-store-700 dark:text-store-200 hover:bg-store-50 dark:hover:bg-store-800/40 rounded-lg mx-1"
                activeClassName="bg-store-100 dark:bg-store-800/50 font-semibold text-store-700"
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
        className={`admin-nav-item inline-flex items-center justify-between w-full text-sm font-medium px-3 py-2.5 ${
          isChildActive
            ? "text-store-700 dark:text-store-200"
            : "text-store-700/80 dark:text-store-200/80 hover:bg-store-100/70 dark:hover:bg-white/5"
        }`}
        onClick={() => setOpen(!open)}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <span className="inline-flex items-center">
          <route.icon className="w-5 h-5" aria-hidden="true" />
          <span className="ml-3">{t(route.name)}</span>
        </span>
        {open ? <IoChevronDownOutline className="w-4 h-4 opacity-60" /> : <IoChevronForwardOutline className="w-4 h-4 opacity-60" />}
      </button>
      {open && route.routes && (
        <ul className="mt-1 mb-1 ml-3 mr-1 space-y-0.5 border-l border-store-200/80 pl-2" aria-label="submenu">
          {route.routes.map((child, index) => (
            <li key={index}>
              {child.outside ? (
                <a
                  href={child.path}
                  target="_blank"
                  rel="noreferrer"
                  className="block py-2 px-2 rounded-lg text-sm text-store-600/80 dark:text-store-200/70 hover:bg-store-50 dark:hover:bg-store-800/30"
                >
                  {t(child.name)}
                </a>
              ) : (
                <NavLink
                  to={child.path}
                  className="block py-2 px-2 rounded-lg text-sm text-store-600/80 dark:text-store-200/70 hover:bg-store-50 dark:hover:bg-store-800/30"
                  activeClassName="bg-store-100 dark:bg-store-800/40 font-semibold text-store-700 dark:text-store-200"
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
