import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  FiMoreVertical,
  FiTrash2,
  FiDownload,
  FiEye,
  FiTag,
  FiXCircle,
} from "react-icons/fi";
import { Link } from "react-router-dom";

import { notifyError, notifySuccess } from "@/utils/toast";
import ShiprocketServices from "@/services/ShiprocketServices";
import OrderServices from "@/services/OrderServices";

const getDropdownPlacement = (btnEl) => {
  if (!btnEl) return { top: 0, left: 0 };
  const rect = btnEl.getBoundingClientRect();
  const menuWidth = 192; // w-48 = 192px
  const menuHeight = 215; // approximate total height of 5 items + divider

  // Right-align with the 3-dots button
  let left = rect.right - menuWidth;
  if (left < 10) left = 10;
  if (left + menuWidth > window.innerWidth - 10) {
    left = window.innerWidth - menuWidth - 10;
  }

  // Open below button by default; only flip above if bottom space is genuinely insufficient
  const spaceBelow = window.innerHeight - rect.bottom;
  let top;

  if (spaceBelow >= menuHeight + 10) {
    top = rect.bottom + 4;
  } else if (rect.top >= menuHeight + 10) {
    top = rect.top - menuHeight - 4;
  } else {
    top = Math.max(10, window.innerHeight - menuHeight - 10);
  }

  return { top, left };
};

const OrderActions = ({ order, handleModalOpen }) => {
  const [open, setOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  const toggleMenu = (e) => {
    e.stopPropagation();
    if (open) {
      setOpen(false);
    } else if (btnRef.current) {
      const pos = getDropdownPlacement(btnRef.current);
      setDropdownPos(pos);
      setOpen(true);
    }
  };

  // Close immediately on scroll, click outside, or Escape
  useEffect(() => {
    if (!open) return;

    // Immediately close when user scrolls anywhere (main container, table, or window)
    const handleScroll = () => {
      setOpen(false);
    };

    const handleClickOutside = (event) => {
      if (
        btnRef.current &&
        !btnRef.current.contains(event.target) &&
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    // capture: true intercepts scroll on <main> and horizontal table scrollbars
    window.addEventListener("scroll", handleScroll, { capture: true, passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("scroll", handleScroll, { capture: true });
      window.removeEventListener("resize", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const handleCancelOrder = async () => {
    try {
      if (!window.confirm("Are you sure you want to cancel this order?")) {
        return;
      }

      // Try to cancel shipment in Shiprocket (if exists)
      if (order?.shiprocket?.shipment_id) {
        await ShiprocketServices.cancelShipment({
          orderId: order._id,
          shipment_id: order.shiprocket.shipment_id,
        }).catch(() => {});
      }

      await OrderServices.updateOrder(order._id, { status: "Cancel" });
      notifySuccess("Order cancelled.");
    } catch (err) {
      notifyError(err?.response?.data?.error || err.message);
    } finally {
      setOpen(false);
    }
  };

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        ref={btnRef}
        onClick={toggleMenu}
        className={`p-2 rounded-lg transition-colors focus:outline-none ${
          open
            ? "text-teal-600 bg-teal-50 dark:bg-teal-900/30"
            : "text-gray-500 hover:text-teal-600 hover:bg-gray-100 dark:hover:bg-gray-700"
        }`}
        title="More Actions"
      >
        <FiMoreVertical size={16} />
      </button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position: "fixed",
              top: `${dropdownPos.top}px`,
              left: `${dropdownPos.left}px`,
              zIndex: 9999,
            }}
            className="w-48 bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700 rounded-xl shadow-2xl py-1 text-xs font-medium text-gray-700 dark:text-gray-200 ring-1 ring-black/5 animate-in fade-in duration-100 select-none overflow-hidden"
          >
            <Link
              to={`/order/${order._id}`}
              className="w-full text-left px-3.5 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2.5 text-gray-700 dark:text-gray-200 transition-colors no-underline"
              style={{ textDecoration: "none" }}
              onClick={() => setOpen(false)}
            >
              <FiDownload className="text-sm text-gray-400 dark:text-gray-400 shrink-0" />
              <span>Download Invoice</span>
            </Link>

            <Link
              to={`/order/${order._id}?view=label`}
              className="w-full text-left px-3.5 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between transition-colors no-underline"
              style={{ textDecoration: "none" }}
              onClick={() => setOpen(false)}
            >
              <div className="flex items-center gap-2.5 text-gray-700 dark:text-gray-200">
                <FiTag className="text-sm text-gray-400 dark:text-gray-400 shrink-0" />
                <span>Box Label (4x6)</span>
              </div>
              <span className="text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 px-1.5 py-0.5 rounded">
                Thermal
              </span>
            </Link>

            <Link
              to={`/order/${order._id}`}
              className="w-full text-left px-3.5 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2.5 text-gray-700 dark:text-gray-200 transition-colors no-underline"
              style={{ textDecoration: "none" }}
              onClick={() => setOpen(false)}
            >
              <FiEye className="text-sm text-gray-400 dark:text-gray-400 shrink-0" />
              <span>View Invoice</span>
            </Link>

            <div className="border-t border-gray-100 dark:border-gray-700 my-1" />

            <button
              type="button"
              className="w-full text-left px-3.5 py-2.5 hover:bg-amber-50 dark:hover:bg-amber-900/20 text-amber-600 dark:text-amber-400 flex items-center gap-2.5 font-medium transition-colors"
              onClick={handleCancelOrder}
            >
              <FiXCircle className="text-sm shrink-0" />
              <span>Cancel Order</span>
            </button>

            <button
              type="button"
              className="w-full text-left px-3.5 py-2.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center gap-2.5 font-medium transition-colors"
              onClick={() => {
                setOpen(false);
                if (handleModalOpen) {
                  handleModalOpen(order._id, `Order #${order.invoice}`);
                }
              }}
            >
              <FiTrash2 className="text-sm shrink-0" />
              <span>Delete Order</span>
            </button>
          </div>,
          document.body
        )}
    </div>
  );
};

export default OrderActions;


