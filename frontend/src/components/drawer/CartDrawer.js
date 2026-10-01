import React, { useContext, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Drawer from "rc-drawer";

// internal import
import Cart from "@components/cart/Cart";
import { SidebarContext } from "@context/SidebarContext";

const CartDrawer = () => {
  const { cartDrawerOpen, closeCartDrawer } = useContext(SidebarContext);
  const [isMaximized, setIsMaximized] = useState(false);

  // Reset maximize state whenever drawer closes
  useEffect(() => {
    if (!cartDrawerOpen) {
      setIsMaximized(false);
    }
  }, [cartDrawerOpen]);

  const toggleMaximize = () => setIsMaximized((prev) => !prev);

  return (
    <Drawer
      open={cartDrawerOpen}
      onClose={closeCartDrawer}
      parent={null}
      level={null}
      placement={"right"}
      width={isMaximized ? "100%" : undefined}
      className={isMaximized ? "drawer-maximized" : ""}
    >
      {cartDrawerOpen && (
        <Cart
          isMaximized={isMaximized}
          onToggleMaximize={toggleMaximize}
        />
      )}
    </Drawer>
  );
};

export default dynamic(() => Promise.resolve(CartDrawer), { ssr: false });

