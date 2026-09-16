import dayjs from "dayjs";
import React from "react";

import InvoiceOrderTable from "@/components/invoice/InvoiceOrderTable";
import { getStoreAddress, getStoreCompanyName } from "@/utils/storeBrand";
import { calculateInvoiceTotals } from "@/utils/invoicePricing";

const InvoiceLayout = ({
  data,
  printRef,
  globalSetting,
  currency,
  getNumberTwo,
  storeCustomizationSetting,
  showingTranslateValue,
}) => {
  const isReseller = data?.orderType === "RESELLER";

  const { mrpTotal, totalDiscount, totalGst } = calculateInvoiceTotals(
    data?.cart,
    data?.taxSummary
  );

  const shippingCharge = data?.shippingCost || 0;
  const payableAmount = data?.total || 0;

  const formatInvoiceNumber = (invoice, createdAt) => {
    if (!invoice) return "-";
    const invStr = String(invoice).trim();
    if (invStr.includes("/")) return invStr;
    const year = createdAt
      ? dayjs(createdAt).format("YYYY")
      : dayjs().format("YYYY");
    return isReseller ? `PKG/${year}/${invStr}` : `MF/${year}/${invStr}`;
  };

  const defaultCompanyName = getStoreCompanyName();
  const defaultCompanyAddress = getStoreAddress({
    storeCustomizationSetting,
    globalSetting,
    showingTranslateValue,
  });

  // Seller Details (Sold By)
  const sellerName = isReseller
    ? (data?.reseller_info?.name || data?.user_info?.name || "Authorized Reseller")
    : defaultCompanyName;

  const sellerAddress = isReseller
    ? ([
        data?.reseller_info?.address,
        data?.reseller_info?.city,
        data?.reseller_info?.state,
        data?.reseller_info?.zipCode,
      ].filter(Boolean).join(", ") || [
        data?.user_info?.address,
        data?.user_info?.city,
        data?.user_info?.country,
        data?.user_info?.zipCode,
      ].filter(Boolean).join(", "))
    : defaultCompanyAddress;

  const sellerPhone = isReseller
    ? (data?.reseller_info?.contact || data?.user_info?.contact)
    : globalSetting?.contact;

  const sellerEmail = isReseller
    ? (data?.reseller_info?.email || data?.user_info?.email)
    : globalSetting?.email;

  const sellerGstin = isReseller ? null : globalSetting?.gstin;

  // Recipient Details (Bill To / Ship To)
  const recipientName = isReseller
    ? (data?.final_customer_info?.name || "-")
    : (data?.user_info?.name || "-");

  const recipientEmail = isReseller
    ? data?.final_customer_info?.email
    : data?.user_info?.email;

  const recipientPhone = isReseller
    ? data?.final_customer_info?.contact
    : data?.user_info?.contact;

  const recipientAddress = isReseller
    ? [
        data?.final_customer_info?.address,
        data?.final_customer_info?.landmark,
        data?.final_customer_info?.city,
        data?.final_customer_info?.state,
        data?.final_customer_info?.zipCode,
      ].filter(Boolean).join(", ")
    : [
        data?.user_info?.address,
        data?.user_info?.city,
        data?.user_info?.country,
        data?.user_info?.zipCode,
      ].filter(Boolean).join(", ");

  const totalQuantity = (data?.cart || []).reduce(
    (acc, item) => acc + (Number(item?.quantity) || 1),
    0
  );

  return (
    <div
      ref={printRef}
      className="text-[#111] bg-white print:text-black"
      style={{ fontFamily: "Arial, sans-serif", backgroundColor: "#ffffff" }}
    >
      <div className="border-2 border-[#222] max-w-4xl mx-auto bg-white">
        <div className="border-b border-[#222] py-2 text-center">
          <h1 className="text-base font-bold" style={{ fontFamily: "Arial, sans-serif" }}>
            {isReseller ? "Packaging Slip & Delivery Challan" : "Invoice"}
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 border-b border-[#222] text-sm">
          <div className="p-4 border-b md:border-b-0 md:border-r border-[#222]">
            <p className="text-xs font-semibold text-[#333] mb-1">
              {isReseller ? "Dispatched / Sold By" : "Sold By"}
            </p>
            <p className="font-bold text-base">{sellerName}</p>
            {sellerAddress && (
              <p className="text-[#444] mt-1 leading-relaxed">{sellerAddress}</p>
            )}
            {sellerGstin && (
              <p className="mt-2 text-[#444]">
                <span className="font-semibold">GSTIN:</span> {sellerGstin}
              </p>
            )}
            {sellerPhone && (
              <p className="text-[#444]">
                <span className="font-semibold">Phone:</span> {sellerPhone}
              </p>
            )}
            {sellerEmail && (
              <p className="text-[#444]">
                <span className="font-semibold">Email:</span> {sellerEmail}
              </p>
            )}
          </div>
          <div className="p-4 text-sm space-y-1.5">
            <p className="text-xs font-semibold text-[#333] mb-1">Invoice Details</p>
            <p>
              <span className="text-[#555]">Invoice No:</span>{" "}
              <span className="font-semibold">
                {formatInvoiceNumber(data?.invoice, data?.createdAt)}
              </span>
            </p>
            <p>
              <span className="text-[#555]">Date:</span>{" "}
              <span className="font-semibold">
                {data?.createdAt
                  ? dayjs(data.createdAt).format("DD MMM YYYY, hh:mm A")
                  : "-"}
              </span>
            </p>
            <p>
              <span className="text-[#555]">Payment:</span>{" "}
              <span className="font-semibold">
                {isReseller ? "PREPAID" : (data?.paymentMethod || "-")}
              </span>
            </p>
            <p>
              <span className="text-[#555]">Status:</span>{" "}
              <span className="font-semibold">{data?.status || "Processing"}</span>
            </p>
          </div>
        </div>

        <div className="p-4 border-b border-[#222] text-sm">
          <p className="text-xs font-semibold text-[#333] mb-1">
            {isReseller ? "Ship & Bill To (Customer)" : "Bill To"}
          </p>
          <p className="font-bold">{recipientName}</p>
          {recipientEmail && (
            <p className="text-[#444]">Email: {recipientEmail}</p>
          )}
          {recipientPhone && (
            <p className="text-[#444]">Phone: {recipientPhone}</p>
          )}
          {recipientAddress && (
            <p className="text-[#444]">Address: {recipientAddress}</p>
          )}
        </div>

        <div className="overflow-x-auto">
          <table
            className="w-full text-xs border-collapse"
            style={{ fontFamily: "Arial, sans-serif" }}
          >
            <thead>
              {isReseller ? (
                <tr className="bg-[#f3f4f6] border-b border-[#222]">
                  <th className="border-r border-[#ccc] px-3 py-2 text-left w-12">#</th>
                  <th className="border-r border-[#ccc] px-3 py-2 text-left">Description</th>
                  <th className="border-r border-[#ccc] px-3 py-2 text-center w-24">HSN</th>
                  <th className="px-3 py-2 text-center w-20">Qty</th>
                </tr>
              ) : (
                <tr className="bg-[#f3f4f6] border-b border-[#222]">
                  <th className="border-r border-[#ccc] px-2 py-2 text-left w-10">#</th>
                  <th className="border-r border-[#ccc] px-2 py-2 text-left">Description</th>
                  <th className="border-r border-[#ccc] px-2 py-2 text-center w-16">HSN</th>
                  <th className="border-r border-[#ccc] px-2 py-2 text-center w-12">Qty</th>
                  <th className="border-r border-[#ccc] px-2 py-2 text-center w-20">Rate</th>
                  <th className="border-r border-[#ccc] px-2 py-2 text-center w-20">Disc.</th>
                  <th className="border-r border-[#ccc] px-2 py-2 text-center w-14">GST%</th>
                  <th className="border-r border-[#ccc] px-2 py-2 text-center w-20">GST Amt</th>
                  <th className="px-2 py-2 text-right w-24">Amount</th>
                </tr>
              )}
            </thead>
            <InvoiceOrderTable
              data={data}
              currency={currency}
              getNumberTwo={getNumberTwo}
            />
          </table>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-t border-[#222]">
          <div className="p-4 text-xs text-[#444] border-b md:border-b-0 md:border-r border-[#222] leading-relaxed">
            <p className="font-semibold text-[#333] mb-1">Terms &amp; Conditions</p>
            <p>
              This is a computer-generated document. Goods once sold are not returnable
              except as per store policy.
            </p>
          </div>
          <div className="p-4 text-sm">
            {isReseller ? (
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#555]">Total Line Items</span>
                  <span className="font-semibold">{data?.cart?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#555]">Total Quantity</span>
                  <span className="font-semibold">{totalQuantity}</span>
                </div>
                <div className="flex justify-between border-t border-[#222] pt-2 mt-2 font-semibold">
                  <span>Payment Type</span>
                  <span className="text-emerald-700 uppercase tracking-wide">Prepaid</span>
                </div>
              </div>
            ) : (
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#555]">MRP Total</span>
                  <span>
                    {currency}
                    {getNumberTwo(mrpTotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#555]">Discount</span>
                  <span>
                    -{currency}
                    {getNumberTwo(totalDiscount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#555]">GST</span>
                  <span>
                    {currency}
                    {getNumberTwo(totalGst)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#555]">Shipping</span>
                  <span>
                    {shippingCharge > 0
                      ? `${currency}${getNumberTwo(shippingCharge)}`
                      : "FREE"}
                  </span>
                </div>
                <div className="flex justify-between border-t border-[#222] pt-2 mt-2 font-semibold">
                  <span>Grand Total</span>
                  <span>
                    {currency}
                    {getNumberTwo(payableAmount)}
                  </span>
                </div>
              </div>
            )}
            <div className="mt-8 text-right text-xs">
              <p className="font-bold">For {sellerName}</p>
              <p className="text-[#555] mt-6">Authorised Signatory</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceLayout;
