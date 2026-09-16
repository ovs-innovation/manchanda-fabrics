import { useParams, useHistory, useLocation } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import React, { useContext, useRef, useState, useEffect } from "react";
import { FiPrinter, FiMail, FiArrowLeft, FiPackage, FiFileText } from "react-icons/fi";
import { IoCloudDownloadOutline } from "react-icons/io5";
import { Button } from "@windmill/react-ui";
import { WindmillContext } from "@windmill/react-ui";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";

//internal import
import useAsync from "@/hooks/useAsync";
import useError from "@/hooks/useError";
import { notifyError, notifySuccess } from "@/utils/toast";
import { AdminContext } from "@/context/AdminContext";
import { SidebarContext } from "@/context/SidebarContext";
import OrderServices from "@/services/OrderServices";
import SettingServices from "@/services/SettingServices";
import InvoiceLayout from "@/components/invoice/InvoiceLayout";
import ShippingLabel4x6 from "@/components/invoice/ShippingLabel4x6";
import Loading from "@/components/preloader/Loading";
import PageTitle from "@/components/Typography/PageTitle";
import spinnerLoadingImage from "@/assets/img/spinner.gif";
import useUtilsFunction from "@/hooks/useUtilsFunction";
import useDisableForDemo from "@/hooks/useDisableForDemo";
import downloadInvoicePdf from "@/utils/downloadInvoicePdf";
import downloadShippingLabelPdf from "@/utils/downloadShippingLabelPdf";
import SelectStatus from "@/components/form/selectOption/SelectStatus";

const labelPrintPageStyle = `
  @media print {
    @page {
      size: 4in 6in !important;
      margin: 0 !important;
    }
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      background: #ffffff !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .shipping-label-wrapper {
      width: 4in !important;
      height: 6in !important;
      max-height: 6in !important;
      margin: 0 auto !important;
      box-sizing: border-box !important;
      page-break-inside: avoid !important;
      page-break-after: avoid !important;
    }
  }
`;

const OrderInvoice = () => {
  const { t } = useTranslation();
  const { mode } = useContext(WindmillContext);
  const { state } = useContext(AdminContext);
  const { adminInfo } = state;
  const { id } = useParams();
  const history = useHistory();
  const location = useLocation();

  const printRef = useRef();
  const labelPrintRef = useRef();

  const queryParams = new URLSearchParams(location.search);
  const [activeTab, setActiveTab] = useState(
    queryParams.get("view") === "label" ? "label" : "invoice"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pdfDownloading, setPdfDownloading] = useState(false);
  const [labelPdfDownloading, setLabelPdfDownloading] = useState(false);

  useEffect(() => {
    const view = new URLSearchParams(location.search).get("view");
    if (view === "label") {
      setActiveTab("label");
    }
  }, [location.search]);

  const { data, loading, error } = useAsync(() =>
    OrderServices.getOrderById(id)
  );

  const { handleErrorNotification } = useError();
  const { handleDisableForDemo } = useDisableForDemo();

  const { currency, globalSetting, showDateFormat, getNumberTwo, showingTranslateValue } =
    useUtilsFunction();

  const { data: storeCustomizationSetting } = useQuery({
    queryKey: ["storeCustomizationSetting"],
    queryFn: async () => await SettingServices.getStoreCustomizationSetting(),
    staleTime: 20 * 60 * 1000,
  });

  const handlePrintInvoice = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Invoice-${data?.invoice || id}`,
    onPrintError: (errorLocation, error) => {
      console.error("Print error:", errorLocation, error);
      notifyError("Failed to open print dialog");
    },
  });

  const handlePrintShippingLabel = useReactToPrint({
    content: () =>
      labelPrintRef.current || document.getElementById("shipping-label-to-print"),
    pageStyle: labelPrintPageStyle,
    documentTitle: `Shipping-Label-${data?.invoice || id}`,
    onPrintError: (errorLocation, error) => {
      console.error("Print error:", errorLocation, error);
      notifyError("Failed to open print dialog");
    },
  });

  const handleEmailInvoice = async (inv) => {
    if (handleDisableForDemo()) {
      return;
    }
    setIsSubmitting(true);
    try {
      const updatedData = {
        ...inv,
        date: showDateFormat(inv.createdAt),
        company_info: {
          currency: currency,
          vat_number: globalSetting?.vat_number,
          company: globalSetting?.company_name,
          address: globalSetting?.address,
          phone: globalSetting?.contact,
          email: globalSetting?.email,
          website: globalSetting?.website,
          from_email: globalSetting?.from_email,
        },
      };
      const res = await OrderServices.sendEmailInvoiceToCustomer(updatedData);
      notifySuccess(res.message);
      setIsSubmitting(false);
    } catch (err) {
      setIsSubmitting(false);
      handleErrorNotification(err, "handleEmailInvoice");
    }
  };

  const handleDownloadInvoice = async () => {
    if (!printRef.current) return;
    try {
      setPdfDownloading(true);
      await downloadInvoicePdf(
        printRef.current,
        `Invoice-${data?.invoice || id}.pdf`
      );
    } catch (err) {
      notifyError(err?.message || "Could not download invoice");
    } finally {
      setPdfDownloading(false);
    }
  };

  const handleDownloadShippingLabel = async () => {
    const el =
      labelPrintRef.current || document.getElementById("shipping-label-to-print");
    if (!el) {
      notifyError("Shipping label element not found");
      return;
    }
    try {
      setLabelPdfDownloading(true);
      await downloadShippingLabelPdf(
        el,
        `Shipping-Label-${data?.invoice || id}.pdf`
      );
      notifySuccess("Shipping label downloaded successfully!");
    } catch (err) {
      console.error("PDF download error:", err);
      notifyError(err?.message || "Could not download shipping label");
    } finally {
      setLabelPdfDownloading(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2 mb-4 mt-2">
        <Button
          layout="link"
          onClick={() => history.goBack()}
          className="p-0 text-store-500 hover:text-store-600 h-auto"
        >
          <FiArrowLeft className="w-5 h-5 mr-1" />
          <span className="text-sm font-bold uppercase tracking-wider">{t("Back")}</span>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <PageTitle>{activeTab === "label" ? "Delivery Box Label (4x6\")" : t("InvoicePageTittle")}</PageTitle>

        {/* VIEW SWITCHER TABS */}
        <div className="inline-flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg self-start sm:self-auto border border-gray-200 dark:border-gray-600">
          <button
            type="button"
            onClick={() => setActiveTab("invoice")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeTab === "invoice"
                ? "bg-white dark:bg-gray-800 text-store-600 dark:text-white shadow-sm"
                : "text-gray-600 dark:text-gray-300 hover:text-gray-900"
            }`}
          >
            <FiFileText className="w-4 h-4" />
            <span>Tax Invoice (A4)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("label")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeTab === "label"
                ? "bg-white dark:bg-gray-800 text-store-600 dark:text-white shadow-sm"
                : "text-gray-600 dark:text-gray-300 hover:text-gray-900"
            }`}
          >
            <FiPackage className="w-4 h-4" />
            <span>Shipping Label (4"×6")</span>
            <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.2 rounded font-extrabold">
              Thermal
            </span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 mb-4 p-6 lg:p-8 rounded-xl shadow-sm overflow-hidden">
        {!loading && !error && (
          <div className="mb-8 flex md:flex-row flex-col items-center justify-between border-b pb-4 border-gray-100 dark:border-gray-700 gap-4">
            {/* ACTION BUTTONS (CONTEXT AWARE) */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {activeTab === "invoice" ? (
                <button
                  type="button"
                  disabled={pdfDownloading}
                  onClick={handleDownloadInvoice}
                  className="flex items-center text-sm leading-5 transition-colors duration-150 font-medium focus:outline-none px-5 py-2 rounded-md text-white bg-store-500 border border-transparent active:bg-store-600 hover:bg-store-600 cursor-pointer disabled:opacity-60"
                >
                  {pdfDownloading ? "Preparing PDF..." : "Download Invoice"}
                  <span className="ml-2 text-base">
                    <IoCloudDownloadOutline />
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled={labelPdfDownloading}
                  onClick={handleDownloadShippingLabel}
                  className="flex items-center text-sm leading-5 transition-colors duration-150 font-medium focus:outline-none px-5 py-2 rounded-md text-white bg-amber-600 border border-transparent active:bg-amber-700 hover:bg-amber-700 cursor-pointer disabled:opacity-60 shadow-sm"
                >
                  {labelPdfDownloading ? "Preparing Label..." : "Download 4x6 Label PDF"}
                  <span className="ml-2 text-base">
                    <IoCloudDownloadOutline />
                  </span>
                </button>
              )}
            </div>

            <div className="flex flex-wrap md:mt-0 mt-3 items-center gap-3 md:w-auto w-full justify-end">
              {activeTab === "invoice" && globalSetting?.email_to_customer && (
                <div>
                  {isSubmitting ? (
                    <Button
                      disabled={true}
                      type="button"
                      className="text-sm h-10 leading-4 inline-flex items-center cursor-pointer transition ease-in-out duration-300 font-semibold font-serif text-center justify-center border-0 border-transparent rounded-md focus-visible:outline-none text-white px-2 md:px-4 py-4 md:py-3.5 hover:text-white bg-store-400 hover:bg-store-500"
                    >
                      <img
                        src={spinnerLoadingImage}
                        alt="Loading"
                        width={20}
                        height={10}
                      />{" "}
                      <span className="font-serif ml-2 font-light">Processing</span>
                    </Button>
                  ) : (
                    <button
                      onClick={() => handleEmailInvoice(data)}
                      className="flex items-center text-sm leading-5 transition-colors duration-150 font-medium focus:outline-none px-4 py-2 rounded-md text-white bg-teal-500 border border-transparent active:bg-teal-600 hover:bg-teal-600 h-10 justify-center"
                    >
                      Email Invoice
                      <span className="ml-2">
                        <FiMail />
                      </span>
                    </button>
                  )}
                </div>
              )}

              {/* DIRECT PRINT BUTTON VIA HOOK */}
              {activeTab === "invoice" ? (
                <button
                  type="button"
                  onClick={handlePrintInvoice}
                  className="flex items-center text-sm leading-5 transition-colors duration-150 font-medium focus:outline-none px-5 py-2 rounded-md text-white bg-indigo-500 border border-transparent active:bg-indigo-600 hover:bg-indigo-600 h-10 justify-center cursor-pointer"
                >
                  Print Invoice
                  <span className="ml-2">
                    <FiPrinter />
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePrintShippingLabel}
                  className="flex items-center text-sm leading-5 transition-colors duration-150 font-medium focus:outline-none px-5 py-2 rounded-md text-white bg-emerald-600 border border-transparent active:bg-emerald-700 hover:bg-emerald-700 h-10 justify-center shadow-sm cursor-pointer"
                >
                  Print Shipping Label (4"×6")
                  <span className="ml-2">
                    <FiPrinter />
                  </span>
                </button>
              )}

              <div className="flex items-center gap-2">
                <div className="text-xs font-extrabold uppercase tracking-[0.1em] text-gray-500">
                  Status:
                </div>
                <div className="w-44">
                  <SelectStatus id={id} order={data} />
                </div>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <Loading loading={loading} />
        ) : error ? (
          <span className="text-center mx-auto text-red-500">{error}</span>
        ) : (
          <>
            {data?.refund?.reason && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
                <h3 className="text-red-800 font-bold text-lg mb-1">Refund Requested</h3>
                <p className="text-red-700"><strong>Reason:</strong> {data.refund.reason}</p>
                {data.refund.note && <p className="text-red-700"><strong>Note:</strong> {data.refund.note}</p>}
              </div>
            )}

            {/* TAB 1: TAX INVOICE (A4) */}
            <div style={{ display: activeTab === "invoice" ? "block" : "none" }}>
              <InvoiceLayout
                data={data}
                currency={currency}
                globalSetting={globalSetting}
                getNumberTwo={getNumberTwo}
                storeCustomizationSetting={storeCustomizationSetting}
                showingTranslateValue={showingTranslateValue}
                printRef={printRef}
              />
            </div>

            {/* TAB 2: SHIPPING LABEL (4x6" THERMAL DELIVERY BOX SLIP) */}
            <div style={{ display: activeTab === "label" ? "block" : "none" }}>
              <div className="bg-gray-100 dark:bg-gray-900 py-8 px-4 rounded-xl flex flex-col items-center justify-center border border-gray-200 dark:border-gray-700">
                <div className="text-center mb-4">
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest bg-white dark:bg-gray-800 px-3 py-1 rounded-full shadow-sm border border-gray-200 dark:border-gray-700">
                    📦 Standard 4" × 6" Thermal Delivery Box Slip
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Paste this adhesive label on the outer delivery package for courier sorting and delivery.
                  </p>
                </div>

                <div className="shadow-2xl rounded-sm border border-gray-300 bg-white">
                  <ShippingLabel4x6
                    data={data}
                    currency={currency}
                    globalSetting={globalSetting}
                    storeCustomizationSetting={storeCustomizationSetting}
                    showingTranslateValue={showingTranslateValue}
                    printRef={labelPrintRef}
                  />
                </div>

                <div className="mt-6 flex flex-wrap justify-center items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    ✅ <strong>100% Thermal Printer Ready</strong> (TVS, TSC, Zebra, Rollo, Xprinter)
                  </span>
                  <span>•</span>
                  <span>
                    📏 <strong>Exact Dimensions:</strong> 4.0 in × 6.0 in (101.6 mm × 152.4 mm)
                  </span>
                  <span>•</span>
                  <span>
                    📱 <strong>Live Scannable:</strong> High-Density Code128 Barcode &amp; QR Code
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default OrderInvoice;
