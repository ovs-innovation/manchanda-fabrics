import { jsPDF } from "jspdf";
import JsBarcode from "jsbarcode";
import QRCode from "qrcode";
import dayjs from "dayjs";

import { ADMIN_BRAND_LOGO, resolveCloudinaryUrl } from "@/utils/cloudinaryUrl";
import { getStoreAddress, getStoreCompanyName } from "@/utils/storeBrand";

/**
 * Helper to truncate a text string to fit within a maximum point width in jsPDF
 */
function truncateToWidth(doc, text, maxWidth) {
  if (!text) return "";
  const strText = String(text).trim();
  if (doc.getTextWidth(strText) <= maxWidth) return strText;
  let str = strText;
  while (doc.getTextWidth(str + "...") > maxWidth && str.length > 0) {
    str = str.slice(0, -1);
  }
  return str + "...";
}

/**
 * Loads an image from URL into an HTMLImageElement and converts to PNG Base64 Data URL
 */
async function getBase64Image(url) {
  if (!url || typeof window === "undefined") return null;
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth || img.width || 120;
        canvas.height = img.naturalHeight || img.height || 120;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      } catch (e) {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

/**
 * Generates and downloads a 100% native vector 4" x 6" PDF shipping label.
 * Exact dimensions: 288 pt x 432 pt (4.00 in x 6.00 in / 101.6 mm x 152.4 mm).
 * Uses exact fixed point coordinates for all lines, boxes, and typography to eliminate
 * any browser font-metric differences, CSS clipping, or viewport shifting.
 */
const downloadShippingLabelPdf = async (params) => {
  const options = params && !params.nodeType ? params : {};
  const data = options.data || {};
  const globalSetting = options.globalSetting || {};
  const storeCustomizationSetting = options.storeCustomizationSetting || {};
  const showingTranslateValue = options.showingTranslateValue;

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

  // Sender Details
  const senderName = isReseller
    ? data?.reseller_info?.name || "Authorized Merchant"
    : defaultCompanyName || "MANCHANDA FAB";

  const senderSubtext = isReseller
    ? [
        data?.reseller_info?.city,
        data?.reseller_info?.state,
        data?.reseller_info?.zipCode,
      ]
        .filter(Boolean)
        .join(", ")
    : "Chandni Chowk, Delhi - 110006";

  const senderFullAddress = isReseller
    ? [
        data?.reseller_info?.address,
        data?.reseller_info?.city,
        data?.reseller_info?.state,
        data?.reseller_info?.zipCode,
      ]
        .filter(Boolean)
        .join(", ")
    : defaultCompanyAddress || "12-A, Krishna Cloth Market, Chandni Chowk - 110006";

  // Recipient Details
  const recipientName = isReseller
    ? data?.final_customer_info?.name || "Valued Customer"
    : data?.user_info?.name || "Valued Customer";

  const recipientPhone = isReseller
    ? data?.final_customer_info?.contact || "-"
    : data?.user_info?.contact || "-";

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
    ? data?.final_customer_info?.zipCode || "110006"
    : data?.user_info?.zipCode || "110006";

  const recipientCityState = isReseller
    ? [data?.final_customer_info?.city, data?.final_customer_info?.state]
        .filter(Boolean)
        .join(", ")
        .toUpperCase()
    : [data?.user_info?.city, data?.user_info?.state || data?.user_info?.country]
        .filter(Boolean)
        .join(", ")
        .toUpperCase();

  // Identifiers
  const invoiceNo = isReseller
    ? `PKG/${dayjs(data?.createdAt || new Date()).format("YYYY")}/${
        data?.invoice || data?._id?.slice(-6)?.toUpperCase()
      }`
    : data?.invoice
    ? String(data.invoice).includes("/")
      ? data.invoice
      : `MF/${dayjs(data?.createdAt || new Date()).format("YYYY")}/${data.invoice}`
    : `MF-${data?._id?.slice(-6)?.toUpperCase() || "ORD"}`;

  const orderIdShort = data?._id?.slice(-8)?.toUpperCase() || "ORD";

  const trackingAwb =
    data?.shippingTrackingId ||
    data?.trackingNumber ||
    data?.shiprocket?.awb_code;

  const barcodeValue = String(
    trackingAwb || data?.invoice || data?._id?.slice(-8) || "ORD10066"
  )
    .replace(/[^a-zA-Z0-9-]/g, "-")
    .toUpperCase();

  const payableAmount = Number(data?.total || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });

  const totalItemsCount =
    data?.cart?.reduce(
      (sum, item) => sum + (Number(item?.quantity) || 1),
      0
    ) || 1;

  // 1. Generate High-Density Barcode Image (Code128)
  let barcodeDataUrl = null;
  if (typeof document !== "undefined") {
    try {
      const barcodeCanvas = document.createElement("canvas");
      JsBarcode(barcodeCanvas, barcodeValue, {
        format: "CODE128",
        width: 2.2,
        height: 56,
        displayValue: false,
        margin: 0,
        background: "#ffffff",
        lineColor: "#000000",
      });
      barcodeDataUrl = barcodeCanvas.toDataURL("image/png");
    } catch (err) {
      console.warn("Barcode rendering note:", err);
    }
  }

  // 2. Generate QR Code Image
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

  let qrDataUrl = null;
  try {
    qrDataUrl = await QRCode.toDataURL(orderTrackingUrl, {
      width: 160,
      margin: 0,
      errorCorrectionLevel: "M",
      color: { dark: "#000000", light: "#ffffff" },
    });
  } catch (err) {
    console.warn("QR rendering note:", err);
  }

  // 3. Brand Logo
  let brandLogoDataUrl = null;
  if (!isReseller) {
    const rawLogo =
      resolveCloudinaryUrl(globalSetting?.logo) || ADMIN_BRAND_LOGO;
    brandLogoDataUrl = await getBase64Image(rawLogo);
  }

  // 4. Initialize Native jsPDF (Exact 288 pt x 432 pt = 4" x 6")
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: [288, 432],
    compress: true,
  });

  // ==========================================
  // SECTION 0: OUTER BOUNDARY & MARGINS
  // ==========================================
  // Page: 288 pt x 432 pt. Margin: 6 pt.
  // Inner frame: x = 6, y = 6, w = 276, h = 420.
  doc.setLineWidth(1.5);
  doc.setDrawColor(0, 0, 0);
  doc.rect(6, 6, 276, 420);

  // ==========================================
  // SECTION 1: HEADER (y = 6 to y = 56, h = 50 pt)
  // ==========================================
  doc.line(6, 56, 282, 56);
  doc.line(194, 6, 194, 56);

  // Left: Brand Details (x = 6 to 194)
  let textStartX = 14;
  if (brandLogoDataUrl) {
    doc.addImage(brandLogoDataUrl, "PNG", 12, 11, 28, 34);
    textStartX = 44;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(0, 0, 0);
  doc.text(truncateToWidth(doc, senderName.toUpperCase(), 144), textStartX, 21);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(55, 65, 81);
  doc.text(truncateToWidth(doc, senderSubtext, 144), textStartX, 32);

  // Badge: STANDARD EXPRESS DELIVERY SLIP
  doc.setFillColor(0, 0, 0);
  doc.rect(textStartX, 37.5, 126, 12, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(255, 255, 255);
  doc.text("STANDARD EXPRESS DELIVERY SLIP", textStartX + 63, 46, {
    align: "center",
  });

  // Right: PREPAID / COD Box (x = 194 to 282, center: 238)
  if (isCod) {
    doc.setFillColor(0, 0, 0);
    doc.rect(194.5, 6.5, 87, 49, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("COD", 238, 23, { align: "center" });
    doc.setFontSize(7.5);
    doc.text("COLLECT CASH", 238, 35, { align: "center" });
    doc.setFontSize(9);
    doc.text(`Rs. ${payableAmount}`, 238, 48, { align: "center" });
  } else {
    doc.setFillColor(248, 249, 250);
    doc.rect(194.5, 6.5, 87, 49, "F");
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("PREPAID", 238, 24, { align: "center" });
    doc.setFontSize(7.5);
    doc.text("DO NOT COLLECT", 238, 37, { align: "center" });
    doc.text("CASH", 238, 48, { align: "center" });
  }

  // ==========================================
  // SECTION 2: BARCODE AREA (y = 56 to y = 108, h = 52 pt)
  // ==========================================
  if (barcodeDataUrl) {
    doc.addImage(barcodeDataUrl, "PNG", 39, 60, 210, 34);
  }
  doc.setFont("courier", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(0, 0, 0);
  doc.text(trackingAwb ? `AWB: ${barcodeValue}` : barcodeValue, 144, 103, { align: "center" });

  // ==========================================
  // SECTION 3: ORDER META STRIP (y = 108 to y = 126, h = 18 pt)
  // ==========================================
  doc.setFillColor(249, 250, 251);
  doc.rect(6.5, 108.5, 275, 17, "F");
  doc.setDrawColor(156, 163, 175);
  doc.line(6, 108, 282, 108);
  doc.setDrawColor(0, 0, 0);
  doc.line(6, 126, 282, 126);

  doc.setFont("courier", "bold");
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);
  doc.text(`${isReseller ? "REF:" : "INV:"} ${invoiceNo}`, 10, 120);
  doc.text(`ORD: #${orderIdShort}`, 144, 120, { align: "center" });
  doc.text(
    `DATE: ${dayjs(data?.createdAt || new Date()).format("DD/MM/YYYY")}`,
    278,
    120,
    { align: "right" }
  );

  // ==========================================
  // SECTION 4: SHIP TO & DESTINATION PIN (y = 126 to y = 196, h = 70 pt)
  // ==========================================
  doc.line(6, 196, 282, 196);
  doc.line(194, 126, 194, 196);

  // Right: Destination PIN Box (x = 194 to 282, center: 238)
  doc.setFillColor(249, 250, 251);
  doc.rect(194.5, 126.5, 87, 69, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(75, 85, 99);
  doc.text("DESTINATION PIN", 238, 140, { align: "center" });

  doc.setFontSize(22);
  doc.setTextColor(0, 0, 0);
  doc.text(String(recipientZip), 238, 163, { align: "center" });

  doc.setFontSize(7.5);
  doc.setTextColor(75, 85, 99);
  doc.text(truncateToWidth(doc, recipientCityState || "EXPRESS HUB", 80), 238, 177, {
    align: "center",
  });

  const carrierName = (
    data?.courierName ||
    data?.shiprocket?.courier_name ||
    "SURFACE EXP"
  ).toUpperCase();
  doc.setFillColor(0, 0, 0);
  doc.rect(206, 183, 64, 9, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6);
  doc.setTextColor(255, 255, 255);
  doc.text(truncateToWidth(doc, carrierName, 60), 238, 189.5, { align: "center" });

  // Left: Customer Details (x = 6 to 194)
  doc.setFillColor(0, 0, 0);
  doc.rect(10, 131, 40, 11, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text("SHIP TO:", 30, 139, { align: "center" });

  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(truncateToWidth(doc, String(recipientName).toUpperCase(), 134), 54, 140.5);

  // Prominent bold customer address (requested by client: "Address ka size jo customer ka h woh thoda prominent kro")
  doc.setFont("helvetica", "bold");
  const fullAddrLines = doc.splitTextToSize(recipientAddress || "-", 176);
  let addrLines = fullAddrLines;
  let startAddrY = 152;
  let lineStep = 11;
  if (fullAddrLines.length <= 1) {
    doc.setFontSize(10);
    startAddrY = 157;
  } else if (fullAddrLines.length === 2) {
    doc.setFontSize(10);
    startAddrY = 154;
    lineStep = 13;
  } else if (fullAddrLines.length === 3) {
    doc.setFontSize(9.2);
    startAddrY = 151;
    lineStep = 10.5;
  } else {
    doc.setFontSize(8.2);
    startAddrY = 149;
    lineStep = 9.2;
    addrLines = fullAddrLines.slice(0, 4);
  }
  doc.setTextColor(0, 0, 0);
  addrLines.forEach((line, idx) => {
    doc.text(line, 10, startAddrY + idx * lineStep);
  });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(0, 0, 0);
  doc.text(`Mobile: ${recipientPhone}`, 10, 189);

  // ==========================================
  // SECTION 5: RETURN ADDRESS & SPECS (y = 196 to y = 254, h = 58 pt)
  // ==========================================
  doc.line(6, 254, 282, 254);
  doc.line(144, 196, 144, 254);

  // Left: Return Address (x = 6 to 144)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(75, 85, 99);
  doc.text("IF UNDELIVERED, RETURN TO:", 10, 206);

  doc.setFontSize(8.5);
  doc.setTextColor(0, 0, 0);
  doc.text(truncateToWidth(doc, senderName, 128), 10, 217);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(31, 41, 55);
  const returnLines = doc.splitTextToSize(senderFullAddress || "-", 128).slice(0, 2);
  if (returnLines[0]) doc.text(returnLines[0], 10, 227);
  if (returnLines[1]) doc.text(returnLines[1], 10, 236);

  const effectiveGstin = globalSetting?.gstin || "07ADKPM4552G1ZG";
  if (effectiveGstin && !isReseller) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(17, 24, 39);
    doc.text(`GSTIN: ${effectiveGstin}`, 10, 247);
  }

  // Right: Package Specs & Payment Mode (x = 144 to 282)
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(75, 85, 99);
  doc.text("Total Items:", 148, 208);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text(`${totalItemsCount} Unit(s)`, 278, 208, { align: "right" });

  if (!isReseller) {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(75, 85, 99);
    doc.text("Shipping:", 148, 220);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    const shipCostText =
      data?.shippingCost > 0 ? `Rs. ${data.shippingCost}` : "FREE";
    doc.text(shipCostText, 278, 220, { align: "right" });

    doc.setDrawColor(156, 163, 175);
    doc.line(144, 229, 282, 229);

    doc.setDrawColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    doc.text("Payment Mode:", 148, 244);
    doc.setFontSize(8.5);
    const payModeText = String(
      data?.paymentMethod || (isCod ? "COD" : "PREPAID")
    ).toUpperCase();
    doc.text(payModeText, 278, 244, { align: "right" });
  } else {
    // For reseller order: do NOT mention shipping cost
    doc.setDrawColor(156, 163, 175);
    doc.line(144, 223, 282, 223);

    doc.setDrawColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    doc.text("Payment Mode:", 148, 239);
    doc.setFontSize(8.5);
    const payModeText = String(
      data?.paymentMethod || (isCod ? "COD" : "PREPAID")
    ).toUpperCase();
    doc.text(payModeText, 278, 239, { align: "right" });
  }

  // ==========================================
  // SECTION 6: PRODUCT MANIFEST & TRANSIT DECLARATION (y = 254 to y = 352, h = 98 pt)
  // ==========================================
  // Table Header (16 pt: y = 254 to 270)
  doc.setFillColor(243, 244, 246);
  doc.rect(6, 254, 276, 16, "F");
  doc.line(6, 270, 282, 270);

  // Column vertical lines in header
  doc.setDrawColor(209, 213, 219);
  doc.line(24, 254, 24, 270);
  doc.line(194, 254, 194, 270);
  doc.line(224, 254, 224, 270);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(31, 41, 55);
  doc.text("#", 15, 265, { align: "center" });
  doc.text("Product Description", 28, 265);
  doc.text("Qty", 209, 265, { align: "center" });
  doc.text(isReseller ? "Status" : "Amount", 278, 265, { align: "right" });

  // Dynamic layout based on cart items count
  const cartItems = (data?.cart || []).slice(0, 3);
  let currentY = 270;

  if (cartItems.length <= 1) {
    // Single Item: 26 pt row with 2-line title support to avoid truncation
    const item = cartItems[0];
    const itemY = currentY;
    currentY += 26;

    if (item) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(17, 24, 39);
      doc.text("1", 15, itemY + 16, { align: "center" });

      const rawTitle =
        typeof item?.title === "object"
          ? showingTranslateValue
            ? showingTranslateValue(item.title)
            : item.title?.en || item.title?.name || ""
          : item?.title || "Fabric Suit Set";

      const titleLines = doc.splitTextToSize(rawTitle, 164).slice(0, 2);
      doc.setFont("helvetica", "normal");
      if (titleLines.length === 1) {
        doc.text(titleLines[0], 28, itemY + 16);
      } else {
        doc.text(titleLines[0], 28, itemY + 11);
        doc.text(titleLines[1], 28, itemY + 21);
      }

      doc.setFont("helvetica", "bold");
      doc.text(String(item?.quantity || 1), 209, itemY + 16, {
        align: "center",
      });

      const itemTotal =
        (Number(item?.price) || 0) * (Number(item?.quantity) || 1);
      const itemAmountStr = isReseller
        ? "PREPAID"
        : `Rs. ${itemTotal.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`;
      doc.text(itemAmountStr, 278, itemY + 16, { align: "right" });
    }

    doc.setDrawColor(229, 231, 235);
    doc.line(6, currentY, 282, currentY);

    // Order Summary Strip (16 pt: y = 296 to 312)
    doc.setFillColor(249, 250, 251);
    doc.rect(6, currentY, 276, 16, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(75, 85, 99);
    const subtotalNum =
      (Number(cartItems[0]?.price) || 0) * (Number(cartItems[0]?.quantity) || 1);
    const subtotalText = isReseller
      ? "Direct Fulfillment Package"
      : `Subtotal: Rs. ${subtotalNum.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
        })}  •  Shipping: ${shipCostText}`;
    doc.text(subtotalText, 12, currentY + 11);

    if (!isReseller) {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(17, 24, 39);
      doc.text(`Net Invoice Value: Rs. ${payableAmount}`, 278, currentY + 11, {
        align: "right",
      });
    }

    currentY += 16;
    doc.setDrawColor(209, 213, 219);
    doc.line(6, currentY, 282, currentY);

    // Logistics & Transit Declaration Box (40 pt: y = 312 to 352)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(75, 85, 99);
    doc.text("LOGISTICS HANDLING & TRANSIT DECLARATION", 12, currentY + 10);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(55, 65, 81);
    doc.text(
      "• Handle with Care: Packed with premium ethnic apparel & fabric textiles.",
      12,
      currentY + 19
    );
    doc.text(
      "• Security Note: Tamper-evident packaging. Do not accept if seal is damaged.",
      12,
      currentY + 28
    );
    doc.text(
      "• Statutory: Goods are for direct retail customer use. No commercial resale in transit.",
      12,
      currentY + 36
    );
  } else {
    // 2 or 3 Items Layout
    const rowHeight = cartItems.length === 2 ? 22 : 19;
    for (let i = 0; i < cartItems.length; i++) {
      const item = cartItems[i];
      const itemY = currentY;
      currentY += rowHeight;

      if (i > 0) {
        doc.setDrawColor(229, 231, 235);
        doc.line(6, itemY, 282, itemY);
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(17, 24, 39);
      doc.text(String(i + 1), 15, itemY + 13, { align: "center" });

      const rawTitle =
        typeof item?.title === "object"
          ? showingTranslateValue
            ? showingTranslateValue(item.title)
            : item.title?.en || item.title?.name || ""
          : item?.title || "Fabric Suit Set";

      doc.setFont("helvetica", "normal");
      doc.text(truncateToWidth(doc, rawTitle, 164), 28, itemY + 13);

      doc.setFont("helvetica", "bold");
      doc.text(String(item?.quantity || 1), 209, itemY + 13, {
        align: "center",
      });

      const itemTotal =
        (Number(item?.price) || 0) * (Number(item?.quantity) || 1);
      const itemAmountStr = isReseller
        ? "PREPAID"
        : `Rs. ${itemTotal.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`;
      doc.text(itemAmountStr, 278, itemY + 13, { align: "right" });
    }

    doc.setDrawColor(209, 213, 219);
    doc.line(6, currentY, 282, currentY);

    // Summary & Declaration for multi-item
    const remainingH = 352 - currentY;
    if (remainingH >= 24) {
      doc.setFillColor(249, 250, 251);
      doc.rect(6, currentY, 276, 13, "F");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.5);
      doc.setTextColor(75, 85, 99);
      if (isReseller) {
        doc.text(
          `Total Packed Items: ${totalItemsCount} Unit(s)  •  Direct Fulfillment Package`,
          12,
          currentY + 9
        );
      } else {
        doc.text(
          `Total Packed Items: ${totalItemsCount} Unit(s)  •  Shipping: ${shipCostText}`,
          12,
          currentY + 9
        );
        doc.setFont("helvetica", "bold");
        doc.setTextColor(17, 24, 39);
        doc.text(`Total: Rs. ${payableAmount}`, 278, currentY + 9, {
          align: "right",
        });
      }

      currentY += 13;
      doc.setDrawColor(229, 231, 235);
      doc.line(6, currentY, 282, currentY);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.5);
      doc.setTextColor(75, 85, 99);
      doc.text(
        "• Handle with Care  •  Tamper Evident Package  •  Standard Courier Transit",
        12,
        currentY + 10
      );
    }
  }

  // Section 6 Bottom border at y = 352
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(1.5);
  doc.line(6, 352, 282, 352);

  // ==========================================
  // SECTION 7: FOOTER (y = 352 to y = 426, h = 74 pt)
  // ==========================================
  doc.line(188, 352, 188, 426);

  // Left: QR Code & Tamper Seal (x = 6 to 188, width = 182 pt)
  if (qrDataUrl) {
    doc.addImage(qrDataUrl, "PNG", 9, 357, 46, 46);
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(0, 0, 0);
  doc.text("PACKAGE QR", 32, 413, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(185, 28, 28);
  doc.text("TAMPER-EVIDENT BOX SEAL:", 59, 368);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(31, 41, 55);
  doc.text("Do not accept if outer package seal", 59, 379);
  doc.text("is broken or tampered with.", 59, 389);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.8);
  doc.setTextColor(55, 65, 81);
  const supportEmail = isReseller
    ? data?.reseller_info?.contact
      ? `Help: ${data.reseller_info.contact}`
      : "Standard Express Delivery"
    : `Support: ${globalSetting?.email || "manchandafabrics@gmail.com"}`;
  doc.text(supportEmail, 59, 402);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(107, 114, 128);
  doc.text("Helpline: +91 88824 00949", 59, 413);

  // Right: Total Amount Block (x = 188 to 282, width = 94 pt, right: 278)
  doc.setFillColor(249, 250, 251);
  doc.rect(188.5, 352.5, 93, 73, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(75, 85, 99);
  doc.text(isReseller ? "PACKAGE STATUS" : "TOTAL AMOUNT", 278, 368, {
    align: "right",
  });

  doc.setFontSize(15);
  doc.setTextColor(0, 0, 0);
  const totalDisplay = isReseller ? "PREPAID" : `Rs. ${payableAmount}`;
  doc.text(totalDisplay, 278, 386, { align: "right" });

  doc.setFontSize(7);
  doc.setTextColor(17, 24, 39);
  const subStatus = isReseller
    ? "DO NOT COLLECT CASH"
    : isCod
    ? "CASH DUE ON DELIVERY"
    : "PREPAID (Rs.0 TO PAY)";
  doc.text(subStatus, 278, 399, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(107, 114, 128);
  doc.text(
    isReseller ? "AUTHORIZED DISPATCH" : "AUTHORIZED SIGNATORY",
    278,
    414,
    {
      align: "right",
    }
  );

  // Save the PDF
  const filename = options.filename || `Shipping-Label-${orderIdShort}.pdf`;
  const safeFilename = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
  doc.save(safeFilename);
};

export default downloadShippingLabelPdf;
