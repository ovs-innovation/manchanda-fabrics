import React, { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import JsBarcode from "jsbarcode";
import QRCode from "qrcode";
import { FiPhone, FiAlertTriangle } from "react-icons/fi";

import { getStoreAddress, getStoreCompanyName } from "@/utils/storeBrand";
import { ADMIN_BRAND_LOGO, resolveCloudinaryUrl } from "@/utils/cloudinaryUrl";

/**
 * 4" x 6" Thermal Courier Delivery Label Component
 * Dimensions: exactly 4in x 6in (288 pt x 432 pt / 101.6 mm x 152.4 mm)
 * Uses flexible auto-height content sections and a single flexible spacer to eliminate
 * vertical text clipping and unnecessary middle gaps.
 */
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

  const brandLogo =
    resolveCloudinaryUrl(globalSetting?.logo) || ADMIN_BRAND_LOGO;

  const isReseller =
    data?.orderType === "RESELLER" ||
    String(data?.orderType).toUpperCase() === "RESELLER" ||
    Boolean(data?.reseller_info?.name);

  const isCod =
    !isReseller &&
    (data?.paymentMethod?.toLowerCase()?.includes("cod") ||
      data?.paymentMethod?.toLowerCase()?.includes("cash"));

  const defaultCompanyName = getStoreCompanyName(globalSetting);
  const defaultCompanyAddress = getStoreAddress({
    storeCustomizationSetting,
    globalSetting,
    showingTranslateValue,
  });

  // Sender Details (FROM)
  const senderName = isReseller
    ? (data?.reseller_info?.name || "Authorized Merchant")
    : defaultCompanyName;

  const cleanAddressParts = (...parts) =>
    parts
      .map((p) => String(p || "").replace(/^[,\s]+|[,\s]+$/g, "").trim())
      .filter((p) => p.length > 0 && p.replace(/[,\s]/g, "").length > 0)
      .join(", ");

  const senderSubtext = isReseller
    ? [
        cleanAddressParts(
          data?.reseller_info?.city,
          data?.reseller_info?.state,
          data?.reseller_info?.zipCode
        ),
        data?.reseller_info?.contact ? `Phone: ${data.reseller_info.contact}` : "",
      ]
        .filter(Boolean)
        .join(" • ")
    : "Chandni Chowk, Delhi - 110006";

  const senderFullAddress = isReseller
    ? cleanAddressParts(
        data?.reseller_info?.address,
        data?.reseller_info?.city,
        data?.reseller_info?.state,
        data?.reseller_info?.zipCode
      )
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

  const formatAddressString = (addr, addr2, landmark, city, state, country) => {
    const parts = [];
    const a1 = String(addr || "").trim();
    const a2 = String(addr2 || "").trim();
    const lm = String(landmark || "").trim();
    if (a1) parts.push(a1);
    if (a2 && !a1.toLowerCase().includes(a2.toLowerCase())) {
      parts.push(a2);
    }
    if (
      lm &&
      !a1.toLowerCase().includes(lm.toLowerCase()) &&
      !a2.toLowerCase().includes(lm.toLowerCase())
    ) {
      parts.push(lm);
    }
    if (city && !parts.some((p) => p.toLowerCase().includes(String(city).toLowerCase()))) {
      parts.push(city);
    }
    if (state && !parts.some((p) => p.toLowerCase().includes(String(state).toLowerCase()))) {
      parts.push(state);
    }
    if (country && !parts.some((p) => p.toLowerCase().includes(String(country).toLowerCase()))) {
      parts.push(country);
    }
    return parts.filter(Boolean).join(", ");
  };

  const recipientAddress = isReseller
    ? formatAddressString(
        data?.final_customer_info?.address,
        data?.final_customer_info?.address2,
        data?.final_customer_info?.landmark,
        data?.final_customer_info?.city,
        data?.final_customer_info?.state,
        data?.final_customer_info?.country
      )
    : formatAddressString(
        data?.user_info?.address,
        data?.user_info?.address2,
        data?.user_info?.landmark,
        data?.user_info?.city,
        data?.user_info?.state,
        data?.user_info?.country
      );

  const recipientZip = isReseller
    ? (data?.final_customer_info?.zipCode || "-")
    : (data?.user_info?.zipCode || "-");

  const recipientCityState = isReseller
    ? [data?.final_customer_info?.city, data?.final_customer_info?.state]
        .filter(Boolean)
        .join(", ")
        .toUpperCase()
    : [data?.user_info?.city, data?.user_info?.state || data?.user_info?.country]
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

  const itemsSubtotal =
    data?.cart?.reduce(
      (sum, item) =>
        sum + (Number(item?.price) || 0) * (Number(item?.quantity) || 1),
      0
    ) || 0;

  // Generate Barcode on Canvas
  useEffect(() => {
    if (barcodeRef.current && barcodeValue) {
      try {
        JsBarcode(barcodeRef.current, barcodeValue, {
          format: "CODE128",
          width: 1.8,
          height: 36,
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

  const orderTrackingUrl = isReseller
    ? `PACKAGE-TRACK-${data?._id || orderIdShort}`
    : `${storeDomain}/order/${data?._id || orderIdShort}`;

  useEffect(() => {
    if (!orderTrackingUrl) return;

    QRCode.toDataURL(orderTrackingUrl, {
      width: 120,
      margin: 0,
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
        minWidth: "4in",
        maxWidth: "4in",
        minHeight: "6in",
        maxHeight: "6in",
        boxSizing: "border-box",
        fontFamily: "'Arial', 'Helvetica Neue', Helvetica, sans-serif",
        color: "#000000",
        backgroundColor: "#ffffff",
        margin: "0 auto",
        padding: "6px",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          boxSizing: "border-box",
          border: "2px solid #000000",
          backgroundColor: "#ffffff",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* 1. HEADER (flex: 0 0 auto) */}
        <div
          style={{
            flex: "0 0 auto",
            borderBottom: "2px solid #000000",
            display: "flex",
            alignItems: "stretch",
            justifyContent: "space-between",
            backgroundColor: "#ffffff",
          }}
        >
          {/* Left: Brand info */}
          <div
            style={{
              padding: "5px 6px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flex: 1,
              minWidth: 0,
            }}
          >
            {!isReseller && brandLogo && (
              <img
                src={brandLogo}
                alt={senderName}
                crossOrigin="anonymous"
                style={{
                  height: "36px",
                  width: "auto",
                  maxWidth: "48px",
                  objectFit: "contain",
                  flexShrink: 0,
                }}
              />
            )}
            <div style={{ minWidth: 0, flex: 1 }}>
              <h1
                style={{
                  fontSize: "11px",
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: "0.02em",
                  lineHeight: 1.25,
                  color: "#000000",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  margin: 0,
                }}
              >
                {senderName}
              </h1>
              <p
                style={{
                  fontSize: "8px",
                  fontWeight: 600,
                  color: "#374151",
                  lineHeight: 1.25,
                  marginTop: "2px",
                  marginBottom: 0,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {senderSubtext}
              </p>
              <div
                style={{
                  display: "inline-block",
                  marginTop: "3px",
                  backgroundColor: "#000000",
                  color: "#ffffff",
                  fontSize: "6.5px",
                  fontWeight: 900,
                  letterSpacing: "0.05em",
                  padding: "1.5px 5px",
                  borderRadius: "2px",
                  textTransform: "uppercase",
                  lineHeight: 1.2,
                }}
              >
                STANDARD EXPRESS DELIVERY SLIP
              </div>
            </div>
          </div>

          {/* Right: PREPAID / COD Box */}
          <div
            style={{
              width: "115px",
              borderLeft: "2px solid #000000",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
              padding: "4px",
              flexShrink: 0,
              backgroundColor: isCod ? "#000000" : "#ffffff",
              color: isCod ? "#ffffff" : "#000000",
            }}
          >
            <div
              style={{
                fontSize: "12px",
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                lineHeight: 1.2,
              }}
            >
              {isCod ? "COD" : "PREPAID"}
            </div>
            <div
              style={{
                fontSize: "8px",
                fontWeight: 800,
                marginTop: "2px",
                lineHeight: 1.2,
                color: isCod ? "#ffffff" : "#111827",
                whiteSpace: "nowrap",
              }}
            >
              {isCod ? `COLLECT: ${currency}${payableAmount}` : "DO NOT COLLECT CASH"}
            </div>
          </div>
        </div>

        {/* 2. BARCODE & ORDER META (flex: 0 0 auto) */}
        <div
          style={{
            flex: "0 0 auto",
            borderBottom: "2px solid #000000",
            backgroundColor: "#ffffff",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              padding: "5px 8px 3px 8px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <canvas
              ref={barcodeRef}
              style={{
                display: "block",
                maxWidth: "100%",
                height: "34px",
                margin: "0 auto",
              }}
            />
            <div
              style={{
                fontSize: "8.5px",
                fontFamily: "'Courier New', Courier, monospace",
                fontWeight: 800,
                letterSpacing: "0.06em",
                color: "#000000",
                marginTop: "2px",
                textAlign: "center",
              }}
            >
              {barcodeValue}
            </div>
          </div>

          <div
            style={{
              borderTop: "1px dotted #9ca3af",
              padding: "3px 8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: "8.5px",
              fontFamily: "'Courier New', Courier, monospace",
              fontWeight: 700,
              color: "#000000",
              letterSpacing: "0.02em",
              lineHeight: 1.25,
            }}
          >
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

        {/* 3. SHIP TO & DESTINATION PIN (flex: 0 0 auto) */}
        <div
          style={{
            flex: "0 0 auto",
            borderBottom: "2px solid #000000",
            display: "flex",
            alignItems: "stretch",
            backgroundColor: "#ffffff",
          }}
        >
          {/* Left: Customer Info */}
          <div
            style={{
              flex: 1,
              minWidth: 0,
              padding: "6px 8px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span
                style={{
                  fontSize: "8px",
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  backgroundColor: "#000000",
                  color: "#ffffff",
                  padding: "2px 4px",
                  borderRadius: "2px",
                  lineHeight: 1.2,
                  flexShrink: 0,
                }}
              >
                SHIP TO:
              </span>
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 900,
                  textTransform: "uppercase",
                  color: "#000000",
                  lineHeight: 1.25,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {recipientName}
              </span>
            </div>

            <div
              style={{
                fontSize: "11px",
                fontWeight: 700,
                lineHeight: 1.35,
                color: "#000000",
                marginTop: "4px",
                wordBreak: "break-word",
              }}
            >
              {recipientAddress}
            </div>

            <div
              style={{
                fontSize: "11px",
                fontWeight: 900,
                color: "#000000",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                marginTop: "4px",
                lineHeight: 1.2,
              }}
            >
              <FiPhone style={{ width: "12px", height: "12px", color: "#000000", flexShrink: 0 }} />
              <span style={{ fontWeight: 900 }}>Mobile:</span>
              <span style={{ letterSpacing: "0.03em", fontWeight: 900 }}>{recipientPhone}</span>
            </div>
          </div>

          {/* Right: Destination PIN Box */}
          <div
            style={{
              width: "115px",
              borderLeft: "2px solid #000000",
              backgroundColor: "#f9fafb",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
              padding: "6px 4px",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontSize: "8px",
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "#4b5563",
                lineHeight: 1.2,
              }}
            >
              DESTINATION PIN
            </span>
            <span
              style={{
                fontSize: "22px",
                fontWeight: 900,
                letterSpacing: "0.08em",
                lineHeight: 1.1,
                margin: "2px 0",
                color: "#000000",
              }}
            >
              {recipientZip}
            </span>
            <span
              style={{
                fontSize: "8px",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                color: "#4b5563",
                lineHeight: 1.2,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "105px",
              }}
            >
              {recipientCityState || "EXPRESS HUB"}
            </span>
            <span
              style={{
                display: "inline-block",
                marginTop: "3px",
                backgroundColor: "#000000",
                color: "#ffffff",
                fontSize: "6.5px",
                fontWeight: 900,
                letterSpacing: "0.05em",
                padding: "1px 5px",
                borderRadius: "2px",
                textTransform: "uppercase",
              }}
            >
              SURFACE EXP
            </span>
          </div>
        </div>

        {/* 4. RETURN ADDRESS & PACKAGE DETAILS (flex: 0 0 auto) */}
        <div
          style={{
            flex: "0 0 auto",
            borderBottom: "2px solid #000000",
            display: "flex",
            alignItems: "stretch",
            backgroundColor: "#ffffff",
          }}
        >
          {/* Left: Sender Return Details (Hidden for reseller orders: "reseller shipping label se yeh hatao that if undelivered return to") */}
          {!isReseller ? (
            <div
              style={{
                width: "50%",
                borderRight: "1px solid #000000",
                padding: "5px 6px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  fontSize: "7.5px",
                  fontWeight: 900,
                  textTransform: "uppercase",
                  color: "#4b5563",
                  display: "block",
                  lineHeight: 1.2,
                }}
              >
                If undelivered, return to:
              </span>
              <div
                style={{
                  fontSize: "9px",
                  fontWeight: 900,
                  color: "#000000",
                  marginTop: "2px",
                  lineHeight: 1.2,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {senderName}
              </div>
              <div
                style={{
                  fontSize: "8px",
                  color: "#374151",
                  lineHeight: 1.25,
                  marginTop: "2px",
                }}
              >
                {senderFullAddress}
              </div>
              {(globalSetting?.gstin || "07ADKPM4552G1ZG") && (
                <div
                  style={{
                    fontSize: "7.5px",
                    fontWeight: 700,
                    color: "#111827",
                    lineHeight: 1.2,
                    marginTop: "2px",
                    whiteSpace: "nowrap",
                  }}
                >
                  GSTIN: {globalSetting?.gstin || "07ADKPM4552G1ZG"}
                </div>
              )}
            </div>
          ) : (
            <div
              style={{
                width: "50%",
                borderRight: "1px solid #000000",
                padding: "5px 6px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  fontSize: "7.5px",
                  fontWeight: 900,
                  textTransform: "uppercase",
                  color: "#4b5563",
                  display: "block",
                  lineHeight: 1.2,
                }}
              >
                Dispatch &amp; Routing:
              </span>
              <div
                style={{
                  fontSize: "9px",
                  fontWeight: 900,
                  color: "#000000",
                  marginTop: "2px",
                  lineHeight: 1.2,
                }}
              >
                Direct Fulfillment
              </div>
              <div
                style={{
                  fontSize: "8px",
                  color: "#374151",
                  lineHeight: 1.25,
                  marginTop: "2px",
                }}
              >
                Standard Logistics • Fast Dispatch
              </div>
              <div
                style={{
                  marginTop: "4px",
                  display: "inline-block",
                  backgroundColor: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  borderRadius: "2px",
                  padding: "1px 6px",
                  fontSize: "6.5px",
                  fontWeight: 800,
                  color: "#166534",
                  lineHeight: 1.2,
                  width: "fit-content",
                  textTransform: "uppercase",
                }}
              >
                VERIFIED &amp; TAMPER-SEALED
              </div>
            </div>
          )}

          {/* Right: Package specifics */}
          <div
            style={{
              width: "50%",
              padding: "5px 6px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              fontSize: "8px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", lineHeight: 1.25 }}>
              <span style={{ color: "#4b5563" }}>Total Items:</span>
              <span style={{ fontWeight: 700, color: "#000000" }}>{totalItemsCount} Unit(s)</span>
            </div>
            {!isReseller ? (
              <div style={{ display: "flex", justifyContent: "space-between", lineHeight: 1.25, marginTop: "2px" }}>
                <span style={{ color: "#4b5563" }}>Shipping:</span>
                <span style={{ fontWeight: 700, color: "#000000" }}>
                  {data?.shippingCost > 0 ? `${currency}${data.shippingCost}` : "FREE"}
                </span>
              </div>
            ) : (
              <div style={{ display: "flex", justifyContent: "space-between", lineHeight: 1.25, marginTop: "2px" }}>
                <span style={{ color: "#4b5563" }}>Order Type:</span>
                <span style={{ fontWeight: 700, color: "#000000" }}>Direct Fulfillment</span>
              </div>
            )}
            <div
              style={{
                borderTop: "1px dotted #9ca3af",
                marginTop: isReseller ? "5px" : "3px",
                paddingTop: isReseller ? "4px" : "3px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                lineHeight: 1.25,
              }}
            >
              <span style={{ fontWeight: 700 }}>Payment Mode:</span>
              <span style={{ textTransform: "uppercase", color: "#000000", fontWeight: 900 }}>
                {data?.paymentMethod || (isCod ? "COD" : "PREPAID")}
              </span>
            </div>
          </div>
        </div>

        {/* 5. PRODUCT CONTENTS TABLE (flex: 0 0 auto) */}
        <div
          style={{
            flex: "0 0 auto",
            backgroundColor: "#ffffff",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Table Header */}
          <div
            style={{
              backgroundColor: "#f3f4f6",
              borderBottom: "1px solid #000000",
              fontSize: "8px",
              fontWeight: 900,
              textTransform: "uppercase",
              color: "#1f2937",
              display: "flex",
              alignItems: "center",
              padding: "4px 0",
            }}
          >
            <div
              style={{
                width: "24px",
                textAlign: "center",
                borderRight: "1px solid #d1d5db",
                flexShrink: 0,
                padding: "0 2px",
              }}
            >
              #
            </div>
            <div
              style={{
                flex: 1,
                padding: "0 6px",
                borderRight: "1px solid #d1d5db",
                minWidth: 0,
              }}
            >
              Product Description
            </div>
            <div
              style={{
                width: "36px",
                textAlign: "center",
                borderRight: "1px solid #d1d5db",
                flexShrink: 0,
              }}
            >
              Qty
            </div>
            <div
              style={{
                width: "85px",
                textAlign: "right",
                paddingRight: "8px",
                flexShrink: 0,
              }}
            >
              {isReseller ? "Status" : "Amount"}
            </div>
          </div>

          {/* Table Rows (Natural height, no vertical clipping) */}
          {data?.cart?.slice(0, 4)?.map((item, idx) => {
            const title =
              typeof item?.title === "object"
                ? showingTranslateValue(item?.title)
                : item?.title || "Fabric Suit Set";
            const itemTotal = (item?.price || 0) * (item?.quantity || 1);
            return (
              <div
                key={idx}
                style={{
                  borderBottom: "1px solid #e5e7eb",
                  fontSize: "8.5px",
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "#ffffff",
                  padding: "4px 0",
                }}
              >
                <div
                  style={{
                    width: "24px",
                    textAlign: "center",
                    fontWeight: 700,
                    borderRight: "1px solid #e5e7eb",
                    flexShrink: 0,
                    padding: "0 2px",
                  }}
                >
                  {idx + 1}
                </div>
                <div
                  style={{
                    flex: 1,
                    padding: "0 6px",
                    borderRight: "1px solid #e5e7eb",
                    fontWeight: 600,
                    color: "#111827",
                    minWidth: 0,
                    whiteSpace: "normal",
                    lineHeight: 1.25,
                  }}
                  title={title}
                >
                  {title}
                </div>
                <div
                  style={{
                    width: "36px",
                    textAlign: "center",
                    fontWeight: 700,
                    borderRight: "1px solid #e5e7eb",
                    flexShrink: 0,
                  }}
                >
                  {item?.quantity || 1}
                </div>
                <div
                  style={{
                    width: "85px",
                    textAlign: "right",
                    paddingRight: "8px",
                    fontWeight: 700,
                    color: "#000000",
                    flexShrink: 0,
                  }}
                >
                  {isReseller
                    ? "PREPAID"
                    : `${currency}${itemTotal.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`}
                </div>
              </div>
            );
          })}

          {data?.cart?.length > 4 && (
            <div
              style={{
                padding: "3px 8px",
                textAlign: "center",
                fontStyle: "italic",
                color: "#4b5563",
                backgroundColor: "#f9fafb",
                fontSize: "7.5px",
                borderBottom: "1px solid #e5e7eb",
                lineHeight: 1.2,
              }}
            >
              + {data.cart.length - 4} more item(s) packed in this parcel
            </div>
          )}

          {/* Order Summary Strip */}
          <div
            style={{
              backgroundColor: "#f9fafb",
              borderBottom: "1px solid #d1d5db",
              padding: "3px 8px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "7.5px",
              color: "#4b5563",
            }}
          >
            <span>
              {isReseller
                ? "Direct Fulfillment Package"
                : `Subtotal: ${currency}${itemsSubtotal.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })} • Shipping: ${
                    data?.shippingCost > 0
                      ? `${currency}${data.shippingCost}`
                      : "FREE"
                  }`}
            </span>
            {!isReseller && (
              <span style={{ fontWeight: 800, color: "#111827" }}>
                Net Value: {currency}{payableAmount}
              </span>
            )}
          </div>

          {/* Logistics Handling & Transit Declaration Box */}
          <div
            style={{
              backgroundColor: "#ffffff",
              borderBottom: "1px solid #000000",
              padding: "4px 8px",
              fontSize: "6.8px",
              color: "#374151",
              lineHeight: 1.35,
            }}
          >
            <div
              style={{
                fontWeight: 900,
                color: "#4b5563",
                fontSize: "7px",
                textTransform: "uppercase",
                marginBottom: "2px",
                letterSpacing: "0.03em",
              }}
            >
              LOGISTICS HANDLING &amp; TRANSIT DECLARATION
            </div>
            <div>• Handle with Care: Packed with premium ethnic apparel &amp; textiles.</div>
            <div>• Security Note: Tamper-evident packaging. Do not accept if seal is damaged.</div>
            <div>• Statutory: Goods are for direct retail customer use. No commercial resale in transit.</div>
          </div>
        </div>

        {/* 6. FLEXIBLE SPACER (Absorbs remaining vertical space cleanly) */}
        <div
          style={{
            flex: "1 1 auto",
            minHeight: "0px",
            backgroundColor: "#ffffff",
          }}
        />

        {/* 7. FOOTER (flex: 0 0 auto, border-top: 2px solid #000) */}
        <div
          style={{
            flex: "0 0 auto",
            borderTop: "2px solid #000000",
            backgroundColor: "#ffffff",
            display: "flex",
            alignItems: "stretch",
          }}
        >
          {/* Left: QR Code & Tamper Seal */}
          <div
            style={{
              flex: 1,
              minWidth: 0,
              padding: "6px 8px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <div
              style={{
                width: "52px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                flexShrink: 0,
              }}
            >
              {qrCodeUrl ? (
                <img
                  src={qrCodeUrl}
                  alt="Package QR"
                  style={{
                    width: "50px",
                    height: "50px",
                    border: "1.5px solid #000000",
                    padding: "1px",
                    backgroundColor: "#ffffff",
                    display: "block",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "50px",
                    height: "50px",
                    border: "1.5px solid #000000",
                    backgroundColor: "#f3f4f6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "8px",
                    fontWeight: 700,
                  }}
                >
                  QR
                </div>
              )}
              <span
                style={{
                  fontSize: "6.5px",
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "#000000",
                  marginTop: "2px",
                  lineHeight: 1.2,
                }}
              >
                PACKAGE QR
              </span>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                minWidth: 0,
              }}
            >
              <span
                style={{
                  fontSize: "7.5px",
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  color: "#b91c1c",
                  display: "flex",
                  alignItems: "center",
                  gap: "3px",
                  lineHeight: 1.2,
                }}
              >
                <FiAlertTriangle style={{ width: "10px", height: "10px", color: "#b91c1c", flexShrink: 0 }} />
                TAMPER-EVIDENT BOX SEAL:
              </span>
              <span
                style={{
                  fontSize: "7.5px",
                  color: "#1f2937",
                  fontWeight: 500,
                  lineHeight: 1.3,
                  marginTop: "2px",
                  maxWidth: "140px",
                }}
              >
                Do not accept if outer package seal is broken or tampered with.
              </span>
              <span
                style={{
                  fontSize: "7px",
                  fontFamily: "'Courier New', Courier, monospace",
                  color: "#374151",
                  fontWeight: 700,
                  marginTop: "3px",
                  lineHeight: 1.2,
                }}
              >
                {isReseller
                  ? (data?.reseller_info?.contact ? `Help: ${data?.reseller_info?.contact}` : "Standard Express Delivery")
                  : `Support: ${globalSetting?.email || "manchandafabrics@gmail.com"}`}
              </span>
              <span
                style={{
                  fontSize: "6.5px",
                  color: "#6b7280",
                  marginTop: "1px",
                  lineHeight: 1.2,
                }}
              >
                Helpline: +91 88824 00949
              </span>
            </div>
          </div>

          {/* Right: Total Amount / Package Status box */}
          <div
            style={{
              width: "115px",
              borderLeft: "2px solid #000000",
              backgroundColor: "#ffffff",
              padding: "6px 8px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              textAlign: "right",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontSize: "7.5px",
                fontWeight: 700,
                textTransform: "uppercase",
                color: "#4b5563",
                lineHeight: 1.2,
              }}
            >
              {isReseller ? "PACKAGE STATUS" : "TOTAL AMOUNT"}
            </span>
            <div
              style={{
                fontSize: isReseller ? "14px" : "15px",
                fontWeight: 900,
                color: "#000000",
                lineHeight: 1.1,
                margin: "2px 0",
                letterSpacing: "-0.02em",
              }}
            >
              {isReseller ? "PREPAID" : `${currency}${payableAmount}`}
            </div>
            <span
              style={{
                fontSize: "7px",
                fontWeight: 800,
                textTransform: "uppercase",
                color: "#111827",
                lineHeight: 1.2,
              }}
            >
              {isReseller
                ? "DO NOT COLLECT CASH"
                : isCod
                ? "Cash Due on Delivery"
                : "Prepaid (₹0 to Pay)"}
            </span>
            <span
              style={{
                fontSize: "6.5px",
                fontWeight: 600,
                textTransform: "uppercase",
                color: "#9ca3af",
                marginTop: "3px",
                lineHeight: 1.2,
              }}
            >
              {isReseller ? "AUTHORIZED DISPATCH" : "Authorized Signatory"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingLabel4x6;
