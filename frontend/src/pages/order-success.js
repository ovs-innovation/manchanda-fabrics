import { useEffect, useState } from "react";
import Link from "next/link";
import Layout from "@layout/Layout";
import { IoCheckmarkCircleOutline } from "react-icons/io5";

const OrderSuccess = () => {
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedOrder = sessionStorage.getItem("lastOrder");
      if (savedOrder) {
        try {
          setOrder(JSON.parse(savedOrder));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  return (
    <Layout title="Order Confirmed" description="Thank you for your order">
      <div className="bg-[#FCF9F5] min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto bg-white rounded-[24px] shadow-sm border border-[#E6D1CB]/40 overflow-hidden">
          <div className="p-8 text-center border-b border-[#E6D1CB]/40 bg-[#FAF7F5]">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 mb-4">
              <IoCheckmarkCircleOutline className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-serif text-[#3B2A25] font-light mb-2">
              Order Confirmed!
            </h1>
            <p className="text-sm text-[#3B2A25]/70 max-w-md mx-auto">
              Thank you for shopping with Manchanda Fabrics. Your payment was successful, and we are preparing your order.
            </p>
          </div>

          <div className="p-8 space-y-8">
            {order ? (
              <>
                {/* Order Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                  <div>
                    <h3 className="font-bold text-[#3B2A25] uppercase tracking-wider text-xs mb-3">Order Details</h3>
                    <p className="text-[#3B2A25]/70 mb-1"><span className="font-semibold text-[#3B2A25]">Invoice No:</span> #{order.invoice || order._id}</p>
                    <p className="text-[#3B2A25]/70 mb-1"><span className="font-semibold text-[#3B2A25]">Date:</span> {new Date(order.createdAt || Date.now()).toLocaleDateString()}</p>
                    <p className="text-[#3B2A25]/70"><span className="font-semibold text-[#3B2A25]">Payment:</span> {order.paymentMethod || "Online Payment"}</p>
                  </div>
                  <div>
                    <h3 className="font-bold text-[#3B2A25] uppercase tracking-wider text-xs mb-3">Shipping Address</h3>
                    <p className="text-[#3B2A25] font-semibold">{order.user_info?.name}</p>
                    <p className="text-[#3B2A25]/70">{order.user_info?.address}</p>
                    <p className="text-[#3B2A25]/70">{order.user_info?.city}, {order.user_info?.country} {order.user_info?.zipCode}</p>
                    <p className="text-[#3B2A25]/70 mt-1">Phone: {order.user_info?.contact}</p>
                  </div>
                </div>

                {/* Items Summary */}
                <div>
                  <h3 className="font-bold text-[#3B2A25] uppercase tracking-wider text-xs mb-4">Items Ordered</h3>
                  <div className="divide-y divide-[#E6D1CB]/20 border-t border-b border-[#E6D1CB]/20">
                    {order.cart?.map((item, idx) => (
                      <div key={idx} className="py-4 flex justify-between items-center text-sm">
                        <div className="flex-1 min-w-0 pr-4">
                          <p className="font-bold text-[#3B2A25] truncate">{item.title}</p>
                          <p className="text-xs text-[#3B2A25]/60 mt-0.5">Quantity: {item.quantity}</p>
                        </div>
                        <span className="font-semibold text-[#3B2A25] shrink-0">
                          ₹{parseFloat(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div className="bg-[#FAF7F5] rounded-[18px] p-6 space-y-3 text-sm">
                  <div className="flex justify-between text-[#3B2A25]/70">
                    <span>Subtotal</span>
                    <span>₹{parseFloat(order.subTotal || 0).toFixed(2)}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount</span>
                      <span>-₹{parseFloat(order.discount || 0).toFixed(2)}</span>
                    </div>
                  )}
                  {order.shippingCost > 0 && (
                    <div className="flex justify-between text-[#3B2A25]/70">
                      <span>Shipping</span>
                      <span>₹{parseFloat(order.shippingCost || 0).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[#3B2A25] font-serif font-bold text-lg pt-3 border-t border-[#E6D1CB]/40">
                    <span>Total Paid</span>
                    <span className="text-[#6D3D2E]">₹{parseFloat(order.total || 0).toFixed(2)}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-[#3B2A25]/70 mb-4">No order details found in session. But don&apos;t worry, your order is being processed.</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link
                href="/"
                className="h-[58px] px-8 rounded-[18px] text-base font-bold text-white bg-[#8B5E4B] hover:bg-[#724D3D] transition-all flex items-center justify-center shadow-lg"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OrderSuccess;
