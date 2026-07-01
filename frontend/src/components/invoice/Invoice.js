import dayjs from "dayjs";
import React from "react";

import OrderTable from "@components/order/OrderTable";
import useUtilsFunction from "@hooks/useUtilsFunction";
import { getStoreAddress, getStoreCompanyName } from "@utils/storeBrand";
import { calculateInvoiceTotals } from "@utils/invoicePricing";

const Invoice = ({ data, printRef, globalSetting, currency, storeCustomizationSetting }) => {
  const { getNumberTwo, showingTranslateValue } = useUtilsFunction();

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
    return `MF/${year}/${invStr}`;
  };

  const companyName = getStoreCompanyName();
  const companyAddress = getStoreAddress({
    storeCustomizationSetting,
    globalSetting,
    showingTranslateValue,
  });

  const customerAddress = [
    data?.user_info?.address,
    data?.user_info?.city,
    data?.user_info?.country,
    data?.user_info?.zipCode,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div
      ref={printRef}
      className="font-invoice text-[#111] bg-white print:text-black"
      style={{ fontFamily: "Arial, sans-serif", backgroundColor: "#ffffff" }}
    >
      <div className="border-2 border-[#222] max-w-4xl mx-auto bg-white">
        {/* Title */}
        <div className="border-b border-[#222] py-2 text-center">
          <h1 className="text-base font-bold">Invoice</h1>
        </div>

        {/* Seller + Invoice meta */}
        <div className="grid grid-cols-1 md:grid-cols-2 border-b border-[#222] text-sm">
          <div className="p-4 border-b md:border-b-0 md:border-r border-[#222]">
            <p className="text-xs font-semibold text-[#333] mb-1">Sold By</p>
            <p className="font-bold text-base">{companyName}</p>
            <p className="text-[#444] mt-1 leading-relaxed">{companyAddress}</p>
            {globalSetting?.gstin && (
              <p className="mt-2 text-[#444]">
                <span className="font-semibold">GSTIN:</span> {globalSetting.gstin}
              </p>
            )}
            {globalSetting?.contact && (
              <p className="text-[#444]">
                <span className="font-semibold">Phone:</span> {globalSetting.contact}
              </p>
            )}
            {globalSetting?.email && (
              <p className="text-[#444]">
                <span className="font-semibold">Email:</span> {globalSetting.email}
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
              <span className="font-semibold">{data?.paymentMethod || "-"}</span>
            </p>
            <p>
              <span className="text-[#555]">Status:</span>{" "}
              <span className="font-semibold">{data?.status || "Processing"}</span>
            </p>
          </div>
        </div>

        {/* Bill To */}
        <div className="p-4 border-b border-[#222] text-sm">
          <p className="text-xs font-semibold text-[#333] mb-1">Bill To</p>
          <p className="font-bold">{data?.user_info?.name || "-"}</p>
          {data?.user_info?.email && (
            <p className="text-[#444]">Email: {data.user_info.email}</p>
          )}
          {data?.user_info?.contact && (
            <p className="text-[#444]">Phone: {data.user_info.contact}</p>
          )}
          {customerAddress && (
            <p className="text-[#444]">Address: {customerAddress}</p>
          )}
        </div>

        {/* Line items */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse font-invoice" style={{ fontFamily: "Arial, sans-serif" }}>
            <thead>
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
            </thead>
            <OrderTable data={data} currency={currency} />
          </table>
        </div>

        {/* Totals + footer */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-t border-[#222]">
          <div className="p-4 text-xs text-[#444] border-b md:border-b-0 md:border-r border-[#222] leading-relaxed">
            <p className="font-semibold text-[#333] mb-1">Terms &amp; Conditions</p>
            <p>
              This is a computer-generated invoice. Goods once sold are not returnable
              except as per store policy.
            </p>
          </div>
          <div className="p-4 text-sm">
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
            <div className="mt-8 text-right text-xs">
              <p className="font-bold">For {companyName}</p>
              <p className="text-[#555] mt-6">Authorised Signatory</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
