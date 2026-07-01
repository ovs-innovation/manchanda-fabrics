import React, { useContext } from "react";
import SidebarContent from "@/components/sidebar/SidebarContent";
import { SidebarContext } from "@/context/SidebarContext";

const DesktopSidebar = () => {
  const { sidebarCollapsed, toggleSidebarCollapse } = useContext(SidebarContext);

  return (
    <aside
      className={`z-30 flex-shrink-0 hidden h-full overflow-hidden bg-[#FFFCFA] dark:bg-store-900 border-r border-store-200/80 dark:border-store-700/40 lg:block transition-all duration-300 ease-in-out ${
        sidebarCollapsed ? "w-[72px]" : "w-60"
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
