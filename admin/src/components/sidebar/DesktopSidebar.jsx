import React, { useContext } from "react";
import SidebarContent from "@/components/sidebar/SidebarContent";
import { SidebarContext } from "@/context/SidebarContext";

const DesktopSidebar = () => {
  const { sidebarCollapsed, toggleSidebarCollapse } = useContext(SidebarContext);

  return (
    <aside
      className={`z-30 flex-shrink-0 hidden overflow-y-auto bg-white dark:bg-store-900 border-r border-store-200 dark:border-store-700/40 lg:block transition-all duration-300 ease-in-out ${
        sidebarCollapsed ? "w-[76px]" : "w-64"
      }`}
    >
      <SidebarContent
        collapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
      />
    </aside>
  );
};

export default DesktopSidebar;
