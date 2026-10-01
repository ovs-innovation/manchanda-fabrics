import dynamic from "next/dynamic";
import useTranslation from "next-translate/useTranslation";
import { useRouter } from "next/router";
import { useRef, useEffect, useState } from "react";
import {
  IoCloudDownloadOutline,
  IoPrintOutline,
  IoCopyOutline,
  IoMailOutline,
  IoCheckmarkCircleOutline,
} from "react-icons/io5";
import { FiTruck, FiExternalLink } from "react-icons/fi";
import { notifySuccess, notifyError } from "@utils/toast";
import ReactToPrint from "react-to-print";
import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";

//internal import

import Layout from "@layout/Layout";
import useGetSetting from "@hooks/useGetSetting";
import Invoice from "@components/invoice/Invoice";
import Loading from "@components/preloader/Loading";
import OrderServices from "@services/OrderServices";
import RefundServices from "@services/RefundServices";
import useUtilsFunction from "@hooks/useUtilsFunction";
import useCartDB from "@hooks/useCartDB";
import downloadInvoicePdf from "@utils/downloadInvoicePdf";
import OrderTracking from "@components/order/OrderTracking";
import { setToken } from "@services/httpServices";
const Order = ({ params }) => {
  const router = useRouter();
  const { t } = useTranslation("common");
  const printRef = useRef();
  const orderId = params.id;

  // Set auth token before fetching order
  useEffect(() => {
    const userInfo = Cookies.get("userInfo");
    if (userInfo) {
      const parsedUser = JSON.parse(userInfo);
      if (parsedUser?.token) {
        setToken(parsedUser.token);
      }
    }
  }, []);

  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [refundReasons, setRefundReasons] = useState([]);
  const [refundMode, setRefundMode] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [refundNote, setRefundNote] = useState("");
  const [pdfDownloading, setPdfDownloading] = useState(false);

  // Email linking states
  const [emailInput, setEmailInput] = useState("");
  const [isLinkingEmail, setIsLinkingEmail] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);

  useEffect(() => {
    RefundServices.getRefundData().then((res) => {
      if (res && res.reasons) {
        setRefundReasons(res.reasons.filter((r) => r.status?.toLowerCase() === "show"));
      }
      if (res && res.refundMode !== undefined) {
        setRefundMode(res.refundMode);
      }
    });
  }, []);

  const handleRefundSubmit = async () => {
    if (!selectedReason) return notifyError("Please select a reason");
    try {
      const res = await OrderServices.requestRefund(orderId, {
        reason: selectedReason,
        note: refundNote,
      });
      notifySuccess(res.message);
      setIsRefundModalOpen(false);
      window.location.reload();
    } catch (err) {
      notifyError(err?.response?.data?.message || err.message);
    }
  };

  const { clearCartWithDB } = useCartDB();

  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => await OrderServices.getOrderById(orderId),
    enabled: !!orderId,
  });

  const currentEmail = data?.user_info?.email;
  const isPlaceholderEmail = (email) => {
    if (!email) return true;
    const str = String(email).toLowerCase().trim();
    return str.includes("@placeholder.") || str.includes(".internal") || str.startsWith("guest_");
  };
  const hasRealEmail = Boolean(currentEmail && !isPlaceholderEmail(currentEmail));

  useEffect(() => {
    if (hasRealEmail && !emailInput) {
      setEmailInput(currentEmail);
    }
  }, [hasRealEmail, currentEmail]);

  const handleLinkEmail = async (e) => {
    e.preventDefault();
    const clean = String(emailInput).trim().toLowerCase();
    if (!clean) {
      notifyError("Please enter your email address.");
      return;
    }
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(clean)) {
      notifyError("Please enter a valid email address.");
      return;
    }

    try {
      setIsLinkingEmail(true);
      const res = await OrderServices.linkEmailToOrder(orderId, { email: clean });
      notifySuccess(res.message || "Email linked successfully! Invoice & tracking updates sent.");
      setIsEditingEmail(false);
      await refetch();
    } catch (err) {
      notifyError(err?.response?.data?.message || err?.message || "Failed to link email.");
    } finally {
      setIsLinkingEmail(false);
    }
  };

  // Empty cart and clear checkout draft once order details are successfully retrieved and order is valid
  useEffect(() => {
    if (data && data._id && data.status !== "Cancel") {
      clearCartWithDB();
      Cookies.remove("couponInfo");
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("checkout_form_draft");
        sessionStorage.removeItem("checkout_pending_order_id");
      }
    }
  }, [data, clearCartWithDB]);

  const { showingTranslateValue, currency } = useUtilsFunction();
  const { storeCustomizationSetting, globalSetting } = useGetSetting();

  const handleCopyTracking = (num) => {
    navigator.clipboard.writeText(num);
    notifySuccess("Tracking number copied!");
  };

  const handleDownloadInvoice = async () => {
    if (!printRef.current) return;
    try {
      setPdfDownloading(true);
      await downloadInvoicePdf(
        printRef.current,
        `Invoice-${data?.invoice || orderId}.pdf`
      );
    } catch (err) {
      notifyError(err?.message || "Could not download invoice");
    } finally {
      setPdfDownloading(false);
    }
  };

  return (
    <Layout title="Invoice" description="order confirmation page">
      {isLoading ? (
        <Loading loading={isLoading} />
      ) : error ? (
        <h2 className="text-xl text-center my-10 mx-auto w-11/12 text-red-400">
          {error?.response?.data?.message || error?.message || String(error)}
        </h2>
      ) : (
        <div className="max-w-screen-2xl mx-auto py-10 px-3 sm:px-6">
          <div className="bg-store-100 rounded-md mb-5 px-4 py-3">
            <label>
              {showingTranslateValue(
                storeCustomizationSetting?.dashboard?.invoice_message_first
              )}{" "}
              <span className="font-bold text-store-600">
                {data?.user_info?.name},
              </span>{" "}
              {showingTranslateValue(
                storeCustomizationSetting?.dashboard?.invoice_message_last
              )}
            </label>
          </div>

          {/* Email Linking & Tracking Updates Card */}
          {(!hasRealEmail || isEditingEmail) ? (
            <div className="bg-gradient-to-r from-[#FAF7F5] via-white to-[#F7F2EE] border-2 border-[#E6D1CB] rounded-2xl p-5 sm:p-6 mb-6 shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#9C6A5A]/10 text-[#9C6A5A] flex items-center justify-center shrink-0 mt-0.5 border border-[#9C6A5A]/20">
                    <IoMailOutline size={26} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base sm:text-lg font-bold text-[#3B2A25]">
                        Want live tracking & order details sent to your inbox?
                      </h3>
                      <span className="text-[11px] font-semibold text-[#9C6A5A] bg-[#9C6A5A]/10 px-2.5 py-0.5 rounded-full border border-[#9C6A5A]/20">
                        Official Updates
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#3B2A25]/75 mt-1 leading-relaxed max-w-xl">
                      Enter your email ID to receive your invoice PDF, dispatch confirmation, and real-time courier tracking alerts directly.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleLinkEmail} className="flex flex-col sm:flex-row gap-2.5 w-full lg:w-auto shrink-0">
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="Enter your email address"
                    disabled={isLinkingEmail}
                    className="w-full sm:w-72 px-4 py-2.5 rounded-xl border border-[#E6D1CB] text-sm bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9C6A5A]/30 focus:border-[#9C6A5A] shadow-inner"
                  />
                  <button
                    type="submit"
                    disabled={isLinkingEmail || !emailInput.trim()}
                    className="px-6 py-2.5 bg-[#9C6A5A] hover:bg-[#855546] text-white text-sm font-semibold rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex items-center justify-center gap-2"
                  >
                    {isLinkingEmail ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <span>Get Updates on Email</span>
                    )}
                  </button>
                  {isEditingEmail && (
                    <button
                      type="button"
                      onClick={() => setIsEditingEmail(false)}
                      className="px-3 py-2 text-xs text-gray-500 hover:text-gray-800 self-center"
                    >
                      Cancel
                    </button>
                  )}
                </form>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50/90 border border-emerald-200 rounded-2xl p-4 sm:p-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
                  <IoCheckmarkCircleOutline size={24} />
                </div>
                <div>
                  <p className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                    <span>Order Linked with Email</span>
                    <span className="text-[10px] uppercase font-extrabold bg-emerald-200/70 text-emerald-800 px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  </p>
                  <p className="text-xs text-emerald-800/90 mt-0.5">
                    Invoice PDF and live courier tracking alerts are sent to <strong>{currentEmail}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEmailInput(currentEmail);
                  setIsEditingEmail(true);
                }}
                className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 underline self-start sm:self-center"
              >
                Change Email
              </button>
            </div>
          )}

          {data?.orderType === "RESELLER" && (
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-5 flex items-start gap-3 text-purple-900 shadow-sm">
              <span className="text-xl leading-none mt-0.5">📦</span>
              <div>
                <p className="font-bold text-sm">Reseller Dispatch Order</p>
                <p className="text-xs text-purple-800 mt-0.5 leading-relaxed">
                  This parcel is addressed to <strong>{data?.final_customer_info?.name}</strong> with your sender details. Supplier identity and wholesale prices are completely hidden on the package label and invoice slip.
                </p>
              </div>
            </div>
          )}
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-8">
            <div className="flex flex-wrap gap-3 mb-8">
              <button
                type="button"
                disabled={pdfDownloading}
                onClick={handleDownloadInvoice}
                className="flex items-center justify-center bg-store-500 text-white transition-all text-sm font-semibold h-10 py-2 px-5 rounded-md hover:bg-store-600 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ fontFamily: "Arial, sans-serif" }}
              >
                {pdfDownloading ? "Preparing..." : t("downloadInvoice")}
                <IoCloudDownloadOutline className="ml-2 text-lg" />
              </button>

              <ReactToPrint
                trigger={() => (
                  <button
                    type="button"
                    className="flex items-center justify-center bg-gray-800 text-white transition-all text-sm font-semibold h-10 py-2 px-5 rounded-md hover:bg-gray-900 shadow-sm"
                    style={{ fontFamily: "Arial, sans-serif" }}
                  >
                    {t("printInvoice")}
                    <IoPrintOutline className="ml-2 text-lg" />
                  </button>
                )}
                content={() => printRef.current}
              />
               {(data.trackingNumber || data.shippingTrackingId) && (
                 <>
                   <button 
                     onClick={() => handleCopyTracking(data.trackingNumber || data.shippingTrackingId)}
                     className="flex items-center justify-center bg-gray-100 text-gray-700 transition-all font-serif text-sm font-semibold h-10 py-2 px-5 rounded-md hover:bg-gray-200 shadow-sm"
                   >
                     Copy AWB <IoCopyOutline className="ml-2" />
                   </button>

                   {data.trackingUrl && (
                     <a 
                       href={data.trackingUrl}
                       target="_blank"
                       rel="noopener noreferrer"
                       className="flex items-center justify-center bg-indigo-50 text-indigo-700 transition-all font-serif text-sm font-semibold h-10 py-2 px-5 rounded-md hover:bg-indigo-100 shadow-sm"
                     >
                       Courier Tracking <FiExternalLink className="ml-2" />
                     </a>
                   )}
                 </>
               )}

               {data?.status === "Delivered" && refundMode && (
                 <button
                   onClick={() => setIsRefundModalOpen(true)}
                   className="flex items-center justify-center bg-red-500 text-white transition-all font-serif text-sm font-semibold h-10 py-2 px-5 rounded-md hover:bg-red-600 shadow-sm"
                 >
                   Request Refund
                 </button>
               )}
            </div>

            {/* Live Tracking Section */}
            {(data.trackingNumber || data.shippingTrackingId || data.courierName || data.status === "Shipped" || data.status === "OutForDelivery") && (
               <div className="mb-10">
                  <OrderTracking order={data} />
               </div>
            )}

            <Invoice
              data={data}
              printRef={printRef}
              currency={currency}
              globalSetting={globalSetting}
              storeCustomizationSetting={storeCustomizationSetting}
            />
          </div>

          {/* Refund Modal */}
          {isRefundModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <h2 className="text-xl font-bold mb-4">Request Refund</h2>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Reason</label>
                  <select
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-store-500 focus:ring-store-500 p-2 border"
                    value={selectedReason}
                    onChange={(e) => setSelectedReason(e.target.value)}
                  >
                    <option value="" disabled>Select a reason...</option>
                    {refundReasons.map((r) => (
                      <option key={r._id} value={r.title}>{r.title}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Additional Note (Optional)</label>
                  <textarea
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-store-500 focus:ring-store-500 p-2 border"
                    rows="3"
                    value={refundNote}
                    onChange={(e) => setRefundNote(e.target.value)}
                  ></textarea>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setIsRefundModalOpen(false)}
                    className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRefundSubmit}
                    className="px-4 py-2 bg-store-500 text-white rounded-md hover:bg-store-600"
                  >
                    Submit Request
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
};

export const getServerSideProps = ({ params }) => {
  return {
    props: { params },
  };
};

export default dynamic(() => Promise.resolve(Order), { ssr: false });
