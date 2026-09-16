import React, { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import JsBarcode from "jsbarcode";
import QRCode from "qrcode";
import { FiPhone, FiAlertTriangle } from "react-icons/fi";

import { getStoreAddress, getStoreCompanyName } from "@/utils/storeBrand";

const ShippingLabel4x6 = ({
  data,
  printRef,
  globalSetting,
  currency = "₹",
  storeCustomizationSetting,
  showingTranslateValue,
}) => {
  const barcodeRef = useRef(null);
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  const isReseller = data?.orderType === "RESELLER";

  const isCod =
    !isReseller &&
    (data?.paymentMethod?.toLowerCase()?.includes("cod") ||
      data?.paymentMethod?.toLowerCase()?.includes("cash"));

  const defaultCompanyName = getStoreCompanyName();
  const defaultCompanyAddress = getStoreAddress({
    storeCustomizationSetting,
    globalSetting,
    showingTranslateValue,
  });

  // Sender Details (FROM)
  const senderName = isReseller
    ? (data?.reseller_info?.name || "Authorized Merchant")
    : defaultCompanyName;

  const senderSubtext = isReseller
    ? [
        data?.reseller_info?.city,
        data?.reseller_info?.state,
        data?.reseller_info?.zipCode,
      ].filter(Boolean).join(", ") +
      (data?.reseller_info?.contact ? ` • Phone: ${data?.reseller_info?.contact}` : "")
    : `Chandni Chowk, Delhi - 110006 • ${globalSetting?.contact || "Luxury Indian Fabrics"}`;

  const senderFullAddress = isReseller
    ? [
        data?.reseller_info?.address,
        data?.reseller_info?.city,
        data?.reseller_info?.state,
        data?.reseller_info?.zipCode,
      ].filter(Boolean).join(", ")
    : defaultCompanyAddress;

  const invoiceNo = isReseller
    ? `PKG/${dayjs(data?.createdAt || new Date()).format("YYYY")}/${data?.invoice || data?._id?.slice(-6)?.toUpperCase()}`
    : data?.invoice
    ? String(data.invoice).includes("/")
      ? data.invoice
      : `MF/${dayjs(data?.createdAt || new Date()).format("YYYY")}/${data.invoice}`
    : `MF-${data?._id?.slice(-6)?.toUpperCase() || "ORD"}`;

  const orderIdShort = data?._id?.slice(-8)?.toUpperCase() || "ORD";

  const barcodeValue = String(data?.invoice || data?._id?.slice(-8) || "ORD10066")
    .replace(/[^a-zA-Z0-9-]/g, "-")
    .toUpperCase();

  // Recipient Details (TO)
  const recipientName = isReseller
    ? (data?.final_customer_info?.name || "Valued Customer")
    : (data?.user_info?.name || "Valued Customer");

  const recipientPhone = isReseller
    ? (data?.final_customer_info?.contact || "-")
    : (data?.user_info?.contact || "-");

  const recipientAddress = isReseller
    ? [
        data?.final_customer_info?.address,
        data?.final_customer_info?.landmark,
        data?.final_customer_info?.city,
        data?.final_customer_info?.state,
      ]
        .filter(Boolean)
        .join(", ")
    : [
        data?.user_info?.address,
        data?.user_info?.city,
        data?.user_info?.country,
      ]
        .filter(Boolean)
        .join(", ");

  const recipientZip = isReseller
    ? (data?.final_customer_info?.zipCode || "-")
    : (data?.user_info?.zipCode || "-");

  const recipientCityState = isReseller
    ? [data?.final_customer_info?.city, data?.final_customer_info?.state]
        .filter(Boolean)
        .join(", ")
        .toUpperCase()
    : [data?.user_info?.city, data?.user_info?.country]
        .filter(Boolean)
        .join(", ")
        .toUpperCase();

  const payableAmount = (data?.total || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });

  const totalItemsCount =
    data?.cart?.reduce(
      (sum, item) => sum + (Number(item?.quantity) || 1),
      0
    ) || 1;

  // Generate Barcode on Canvas
  useEffect(() => {
    if (barcodeRef.current && barcodeValue) {
      try {
        JsBarcode(barcodeRef.current, barcodeValue, {
          format: "CODE128",
          width: 1.8,
          height: 38,
          displayValue: false,
          margin: 0,
          background: "#ffffff",
          lineColor: "#000000",
        });
      } catch (err) {
        console.error("Barcode generation error:", err);
      }
    }
  }, [barcodeValue]);

  // Determine store base domain or generic tracking for QR code
  const storeDomain =
    globalSetting?.website && globalSetting.website.trim() !== ""
      ? globalSetting.website.startsWith("http")
        ? globalSetting.website.replace(/\/+$/, "")
        : `https://${globalSetting.website.replace(/\/+$/, "")}`
      : typeof window !== "undefined" && window.location.hostname === "localhost"
      ? "http://localhost:3000"
      : "https://manchandafabrics.com";

  // For Reseller: encode generic package code without revealing Manchanda domain
  const orderTrackingUrl = isReseller
    ? `PACKAGE-TRACK-${data?._id || orderIdShort}`
    : `${storeDomain}/order/${data?._id || orderIdShort}`;

  useEffect(() => {
    if (!orderTrackingUrl) return;

    QRCode.toDataURL(orderTrackingUrl, {
      width: 140,
      margin: 1,
      errorCorrectionLevel: "M",
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    })
      .then((url) => setQrCodeUrl(url))
      .catch((err) => console.error("QR Code error:", err));
  }, [orderTrackingUrl]);

  return (
    <div
      id="shipping-label-to-print"
      ref={printRef}
      className="shipping-label-wrapper bg-white text-black"
      style={{
        width: "4in",
        height: "6in",
        minHeight: "6in",
        maxHeight: "6in",
        boxSizing: "border-box",
        fontFamily: "'Arial', 'Helvetica Neue', sans-serif",
        color: "#000000",
        backgroundColor: "#ffffff",
        margin: "0 auto",
        padding: "0.06in",
        overflow: "hidden",
      }}
    >
      <div
        className="h-full flex flex-col justify-between border-2 border-black bg-white"
        style={{
          boxSizing: "border-box",
          height: "100%",
        }}
      >
        {/* 1. HEADER: SENDER & ROUTING BADGE */}
        <div className="border-b-2 border-black p-2 flex items-center justify-between bg-white">
          <div className="flex-1 pr-2">
            <h1 className="text-[13px] font-black tracking-wider uppercase leading-none text-black truncate">
              {senderName}
            </h1>
            <p className="text-[8.5px] font-semibold text-gray-700 leading-tight mt-0.5 truncate">
              {senderSubtext}
            </p>
            <div className="inline-block mt-1 bg-black text-white text-[7.5px] font-black tracking-widest px-1.5 py-0.5 rounded-sm uppercase">
              STANDARD EXPRESS DELIVERY SLIP
            </div>
          </div>

          <div
            className={`px-2 py-1.5 text-center border-2 border-black flex flex-col justify-center ${
              isCod ? "bg-black text-white" : "bg-white text-black"
            }`}
            style={{ minWidth: "1.3in" }}
          >
            <div className="text-[12px] font-black uppercase tracking-wider leading-tight">
              {isCod ? "COD" : "PREPAID"}
            </div>
            <div
              className={`text-[8.5px] font-extrabold mt-0.5 leading-none ${
                isCod ? "text-white" : "text-gray-900"
              }`}
            >
              {isCod ? `COLLECT: ${currency}${payableAmount}` : "DO NOT COLLECT CASH"}
            </div>
          </div>
        </div>

        {/* 2. BARCODE SECTION */}
        <div className="border-b-2 border-black py-1 px-2 flex flex-col items-center justify-center bg-white">
          <canvas
            ref={barcodeRef}
            style={{
              display: "block",
              maxWidth: "100%",
              height: "36px",
              margin: "0 auto",
            }}
          />
          <div className="flex justify-between w-full text-[9px] font-mono font-bold mt-1 tracking-wider px-1 text-black border-t border-dotted border-gray-400 pt-0.5">
            <span>
              <strong>{isReseller ? "REF:" : "INV:"}</strong> {invoiceNo}
            </span>
            <span>
              <strong>ORD:</strong> #{orderIdShort}
            </span>
            <span>
              <strong>DATE:</strong> {dayjs(data?.createdAt || new Date()).format("DD/MM/YYYY")}
            </span>
          </div>
        </div>

        {/* 3. DELIVER TO (MAIN COURIER ROUTING SECTION) */}
        <div className="border-b-2 border-black p-2 bg-white">
          <div className="flex justify-between items-stretch gap-2">
            {/* Left: Customer Info */}
            <div className="flex-1">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[8px] font-black uppercase tracking-widest bg-black text-white px-1.5 py-0.5 rounded-sm">
                  SHIP TO:
                </span>
                <span className="text-[14px] font-black uppercase text-black leading-none">
                  {recipientName}
                </span>
              </div>
              <div className="text-[9.5px] font-semibold leading-snug text-gray-900 mt-0.5 break-words">
                {recipientAddress}
              </div>
              <div className="text-[9.5px] font-black mt-1 text-black flex items-center gap-1.5">
                <FiPhone className="w-3 h-3 text-black inline-block flex-shrink-0" />
                <span className="font-extrabold">Mobile:</span>
                <span className="tracking-wide">{recipientPhone}</span>
              </div>
            </div>

            {/* Right: Huge Destination PIN Box */}
            <div className="border-2 border-black p-1 text-center bg-gray-50 flex flex-col justify-center items-center min-w-[1.15in]">
              <span className="text-[8px] font-black uppercase tracking-widest text-gray-700 leading-none">
                DESTINATION PIN
              </span>
              <span className="text-[20px] font-black tracking-widest leading-none my-1 text-black">
                {recipientZip}
              </span>
              <span className="text-[8px] font-extrabold text-gray-700 uppercase tracking-wider text-center leading-tight">
                {recipientCityState || "EXPRESS HUB"}
              </span>
            </div>
          </div>
        </div>

        {/* 4. RETURN TO & PACKAGE DETAILS */}
        <div className="border-b border-black grid grid-cols-2 text-[8.5px] leading-tight bg-white">
          <div className="p-1.5 border-r border-black">
            <span className="font-extrabold uppercase text-gray-600 block text-[7.5px]">
              If undelivered, return to:
            </span>
            <div className="font-black text-[9px] text-black mt-0.5">{senderName}</div>
            <div className="text-gray-800 leading-tight mt-0.5 text-[8px] break-words">
              {senderFullAddress}
            </div>
            {!isReseller && globalSetting?.gstin && (
              <div className="font-bold text-gray-900 mt-0.5 text-[8px]">
                GSTIN: {globalSetting.gstin}
              </div>
            )}
          </div>

          <div className="p-1.5 flex flex-col justify-between">
            <div className="space-y-0.5">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Items:</span>
                <span className="font-bold text-black">{totalItemsCount} Unit(s)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping:</span>
                <span className="font-bold text-black">
                  {isReseller
                    ? "EXPRESS"
                    : data?.shippingCost > 0
                    ? `${currency}${data.shippingCost}`
                    : "FREE"}
                </span>
              </div>
            </div>
            <div className="border-t border-dotted border-gray-400 pt-0.5 flex justify-between font-bold text-[8.5px]">
              <span>Payment Mode:</span>
              <span className="uppercase text-black">
                {isReseller ? "PREPAID" : (data?.paymentMethod || (isCod ? "COD" : "PREPAID"))}
              </span>
            </div>
          </div>
        </div>

        {/* 5. ITEM CONTENTS SUMMARY */}
        <div className="border-b-2 border-black bg-white">
          {/* Header */}
          <div className="bg-gray-100 border-b border-black text-[8px] uppercase font-black text-gray-800 flex items-stretch">
            <div className="w-7 py-1 px-1 text-center border-r border-gray-300 flex-shrink-0">#</div>
            <div className="flex-1 py-1 px-2 border-r border-gray-300">Product Description</div>
            <div className="w-10 py-1 px-1 text-center border-r border-gray-300 flex-shrink-0">Qty</div>
            <div className="w-20 py-1 pr-2 text-right flex-shrink-0">
              {isReseller ? "Status" : "Amount"}
            </div>
          </div>

          {/* Rows */}
          {data?.cart?.slice(0, 3)?.map((item, idx) => {
            const title =
              typeof item?.title === "object"
                ? showingTranslateValue(item?.title)
                : item?.title || "Fabric Suit Set";
            return (
              <div
                key={idx}
                className="flex items-stretch border-b border-gray-200 text-[8.5px] bg-white"
                style={{ minHeight: "22px" }}
              >
                <div className="w-7 py-1 px-1 text-center font-mono font-bold border-r border-gray-200 flex items-center justify-center flex-shrink-0">
                  {idx + 1}
                </div>
                <div className="flex-1 py-1 px-2 border-r border-gray-200 font-semibold text-gray-900 leading-snug flex items-center">
                  <span className="block truncate">{title}</span>
                </div>
                <div className="w-10 py-1 px-1 text-center font-bold border-r border-gray-200 flex items-center justify-center flex-shrink-0">
                  {item?.quantity || 1}
                </div>
                <div className="w-20 py-1 pr-2 text-right font-mono font-bold text-black flex items-center justify-end flex-shrink-0">
                  {isReseller
                    ? "PREPAID"
                    : `${currency}${((item?.price || 0) * (item?.quantity || 1)).toFixed(2)}`}
                </div>
              </div>
            );
          })}

          {data?.cart?.length > 3 && (
            <div className="py-1 px-2 text-center italic text-gray-600 bg-gray-50 text-[7.5px]">
              + {data.cart.length - 3} more item(s) packed in this parcel
            </div>
          )}
        </div>

        {/* 6. FOOTER: QR CODE, TAMPER SEAL & TOTAL */}
        <div className="p-1.5 flex items-center justify-between bg-white text-[8px]">
          <div className="flex items-center gap-2">
            {qrCodeUrl ? (
              <div className="flex flex-col items-center flex-shrink-0">
                <img
                  src={qrCodeUrl}
                  alt="Package Tracking QR"
                  className="w-[50px] h-[50px] border-2 border-black p-0.5 bg-white"
                />
                <span className="text-[6.5px] font-black uppercase tracking-wider text-black mt-0.5 leading-none">
                  PACKAGE QR
                </span>
              </div>
            ) : (
              <div className="w-[50px] h-[50px] border-2 border-black bg-gray-100 flex items-center justify-center text-[8px] font-bold flex-shrink-0">
                QR
              </div>
            )}
            <div className="flex flex-col justify-center leading-tight">
              <span className="font-black text-[7.5px] uppercase tracking-wider text-red-700 flex items-center gap-1">
                <FiAlertTriangle className="w-2.5 h-2.5 inline-block text-red-700 flex-shrink-0" />
                TAMPER-EVIDENT BOX SEAL:
              </span>
              <span className="text-[7.5px] text-gray-800 leading-snug mt-0.5 max-w-[1.4in] font-medium">
                Do not accept if outer package seal is broken or tampered with.
              </span>
              <span className="text-[7px] text-gray-600 font-mono mt-0.5">
                {isReseller
                  ? (data?.reseller_info?.contact ? `Help: ${data?.reseller_info?.contact}` : "Standard Express Delivery")
                  : `Support: ${globalSetting?.email || "manchandafabrics@gmail.com"}`}
              </span>
            </div>
          </div>

          <div className="text-right border-l-2 border-black pl-2 min-w-[1.15in] flex flex-col justify-center">
            {isReseller ? (
              <>
                <span className="text-[8px] uppercase font-bold text-gray-600 block">
                  Package Status
                </span>
                <div className="text-[12px] font-black text-emerald-800 leading-none my-0.5">
                  PREPAID
                </div>
                <span className="text-[7px] font-bold uppercase text-gray-700 block">
                  Do Not Collect Cash
                </span>
                <span className="text-[6.5px] font-semibold uppercase text-gray-400 block mt-0.5">
                  Authorized Dispatch
                </span>
              </>
            ) : (
              <>
                <span className="text-[8px] uppercase font-bold text-gray-600 block">
                  Total Amount
                </span>
                <div className="text-[14px] font-black text-black leading-none my-0.5">
                  {currency}
                  {payableAmount}
                </div>
                <span className="text-[7px] font-bold uppercase text-gray-700 block">
                  {isCod ? "Cash Due on Delivery" : "Prepaid (₹0 to Pay)"}
                </span>
                <span className="text-[6.5px] font-semibold uppercase text-gray-400 block mt-0.5">
                  Authorized Signatory
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingLabel4x6;
