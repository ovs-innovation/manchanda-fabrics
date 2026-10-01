import React, { useContext, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";

// internal import
import Cart from "@components/cart/Cart";
import { SidebarContext } from "@context/SidebarContext";

const CartDrawer = () => {
  const { cartDrawerOpen, closeCartDrawer } = useContext(SidebarContext);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Responsive check for mobile screen (< 768px)
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Reset maximize whenever drawer closes
  useEffect(() => {
    if (!cartDrawerOpen) {
      setIsMaximized(false);
    }
  }, [cartDrawerOpen]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (cartDrawerOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [cartDrawerOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && cartDrawerOpen) {
        closeCartDrawer();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cartDrawerOpen, closeCartDrawer]);

  const toggleMaximize = () => setIsMaximized((prev) => !prev);

  return (
    <AnimatePresence>
      {cartDrawerOpen && (
        <div className="fixed inset-0 z-[99999]">
          {/* Backdrop Overlay */}
          <motion.div
            key="cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.55 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={closeCartDrawer}
            className="fixed inset-0 bg-black backdrop-blur-[2px] z-[99998]"
            aria-hidden="true"
          />

          {/* Bottom Sheet on Mobile / Slide-over on Desktop */}
          {isMobile ? (
            <motion.div
              key="cart-sheet-mobile"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 320 }}
              className={`fixed bottom-0 left-0 right-0 w-full z-[99999] bg-white rounded-t-[26px] shadow-[0_-12px_40px_rgba(0,0,0,0.35)] flex flex-col overflow-hidden transition-[height] duration-300 ease-in-out ${
                isMaximized ? "h-[94vh]" : "h-[62vh]"
              }`}
            >
              {/* Top Handle / Grab Bar */}
              <div
                onClick={toggleMaximize}
                className="w-full flex items-center justify-center pt-2.5 pb-1 cursor-pointer select-none bg-white hover:bg-neutral-50 active:bg-neutral-100 transition-colors shrink-0"
                title={isMaximized ? "Click to restore half screen" : "Click to maximize"}
              >
                <div className="w-12 h-1.5 bg-neutral-300 hover:bg-neutral-400 rounded-full transition-colors" />
              </div>

              <div className="flex-1 overflow-hidden flex flex-col">
                <Cart
                  isMaximized={isMaximized}
                  onToggleMaximize={toggleMaximize}
                  isMobile={true}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="cart-drawer-desktop"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 320 }}
              className={`fixed top-0 right-0 bottom-0 h-full z-[99999] bg-white rounded-l-2xl shadow-2xl flex flex-col overflow-hidden transition-[width] duration-300 ease-in-out ${
                isMaximized ? "w-[620px]" : "w-[440px]"
              } max-w-full`}
            >
              <Cart
                isMaximized={isMaximized}
                onToggleMaximize={toggleMaximize}
                isMobile={false}
              />
            </motion.div>
          )}
        </div>
      )}
    </AnimatePresence>
  );
};

export default dynamic(() => Promise.resolve(CartDrawer), { ssr: false });
