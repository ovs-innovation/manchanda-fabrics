const PDFDocument = require("pdfkit");
const https = require("https");
const fs = require("fs");
const os = require("os");
const path = require("path");
const Setting = require("../../models/Setting");
const {
  getStoreCompanyName,
  getContactUsAddressFromDb,
} = require("../../utils/storeBrand");

const FONT = "Arial";
const FONT_BOLD = "Arial-Bold";
const INK = "#111111";
const MUTED = "#444444";
const BORDER = "#222222";
const HEAD_BG = "#f3f4f6";

const ARIAL_REGULAR_URL =
  "https://cdn.jsdelivr.net/npm/@canvas-fonts/arial@1.0.4/Arial.ttf";
const ARIAL_BOLD_URL =
  "https://cdn.jsdelivr.net/npm/@canvas-fonts/arial-bold@1.0.4/Arial-Bold.ttf";

let arialFontsPromise = null;

const downloadFont = (url) =>
  new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`Failed to download font: ${url}`));
          return;
        }
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => resolve(Buffer.concat(chunks)));
        res.on("error", reject);
      })
      .on("error", reject);
  });

const ensureArialFonts = async () => {
  if (!arialFontsPromise) {
    arialFontsPromise = Promise.all([
      downloadFont(ARIAL_REGULAR_URL),
      downloadFont(ARIAL_BOLD_URL),
    ]).then(([regular, bold]) => {
      const dir = path.join(os.tmpdir(), "manchanda-invoice-fonts");
      fs.mkdirSync(dir, { recursive: true });
      const regularPath = path.join(dir, "arial.ttf");
      const boldPath = path.join(dir, "arial-bold.ttf");
      fs.writeFileSync(regularPath, regular);
      fs.writeFileSync(boldPath, bold);
      return { regularPath, boldPath };
    });
  }
  return arialFontsPromise;
};

const formatMoney = (currency, amount) => {
  const num = Number(amount) || 0;
  const formatted = num.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${currency || "₹"}${formatted}`;
};

const resolveCompanyInfo = async (order) => {
  const globalSetting = await Setting.findOne({ name: "globalSetting" });
  const gs = globalSetting?.setting || {};
  const fromOrder = order?.company_info || {};
  const contactAddress = await getContactUsAddressFromDb();

  return {
    company: getStoreCompanyName(),
    address: fromOrder.address || contactAddress,
    phone: fromOrder.phone || gs.contact || "",
    email: fromOrder.email || gs.email || "manchandafabrics@gmail.com",
    website: fromOrder.website || gs.website || "",
    currency: fromOrder.currency || gs.default_currency || "₹",
    gstin: fromOrder.vat_number || gs.gstin || gs.vat_number || "",
  };
};

const formatInvoiceNo = (invoice, createdAt) => {
  if (!invoice) return "-";
  const inv = String(invoice).trim();
  if (inv.includes("/")) return inv;
  const year = createdAt
    ? new Date(createdAt).getFullYear()
    : new Date().getFullYear();
  return `MF/${year}/${inv}`;
};

const handleCreateInvoice = async (order) => {
  const isReseller = order?.orderType === "RESELLER";
  const company = await resolveCompanyInfo(order);
  const fonts = await ensureArialFonts();

  // Reseller seller and recipient resolution
  const sellerName = isReseller
    ? order?.reseller_info?.name || order?.user_info?.name || "Authorized Partner"
    : company.company;
  const sellerAddress = isReseller
    ? [
        order?.reseller_info?.address || order?.user_info?.address,
        order?.reseller_info?.city || order?.user_info?.city,
        order?.reseller_info?.state || order?.user_info?.country,
        order?.reseller_info?.zipCode || order?.user_info?.zipCode,
      ]
        .filter(Boolean)
        .join(", ") || "Direct Dispatch Partner"
    : company.address;
  const sellerPhone = isReseller
    ? order?.reseller_info?.contact || order?.user_info?.contact || ""
    : company.phone;
  const sellerEmail = isReseller
    ? order?.reseller_info?.email || order?.user_info?.email || ""
    : company.email;

  const recipientName = isReseller
    ? order?.final_customer_info?.name || "Valued Customer"
    : order?.user_info?.name || "-";
  const recipientEmail = isReseller
    ? order?.final_customer_info?.email || ""
    : order?.user_info?.email || "";
  const recipientPhone = isReseller
    ? order?.final_customer_info?.contact || ""
    : order?.user_info?.contact || "";
  const recipientAddress = isReseller
    ? [
        order?.final_customer_info?.address,
        order?.final_customer_info?.address2,
        order?.final_customer_info?.city,
        order?.final_customer_info?.state,
        order?.final_customer_info?.country,
        order?.final_customer_info?.zipCode,
      ]
        .filter(Boolean)
        .join(", ")
    : [
        order?.user_info?.address,
        order?.user_info?.city,
        order?.user_info?.country,
        order?.user_info?.zipCode,
      ]
        .filter(Boolean)
        .join(", ");

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 40 });
    doc.registerFont(FONT, fonts.regularPath);
    doc.registerFont(FONT_BOLD, fonts.boldPath);
    const buffers = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    const pageW = doc.page.width;
    const margin = 40;
    const contentW = pageW - margin * 2;

    // Outer border
    doc.rect(margin, margin, contentW, doc.page.height - margin * 2).stroke(BORDER);

    // Title bar
    const titleY = margin + 12;
    doc
      .font(`${FONT_BOLD}`)
      .fontSize(14)
      .fillColor(INK)
      .text(isReseller ? "Delivery Slip / Invoice" : "Invoice", margin, titleY, { width: contentW, align: "center" });

    doc
      .moveTo(margin + 12, titleY + 22)
      .lineTo(margin + contentW - 12, titleY + 22)
      .strokeColor(BORDER)
      .stroke();

    // Seller | Invoice meta
    const boxY = titleY + 30;
    const boxH = 88;
    const leftW = contentW * 0.55;
    const rightW = contentW - leftW;

    doc.rect(margin, boxY, leftW, boxH).stroke(BORDER);
    doc.rect(margin + leftW, boxY, rightW, boxH).stroke(BORDER);

    doc.font(`${FONT_BOLD}`).fontSize(8).fillColor(MUTED).text("Sold By / Seller", margin + 10, boxY + 8);
    doc.font(`${FONT_BOLD}`).fontSize(10).fillColor(INK).text(sellerName, margin + 10, boxY + 20, { width: leftW - 20 });
    doc.font(FONT).fontSize(8).fillColor(MUTED);
    let sy = boxY + 34;
    doc.text(sellerAddress, margin + 10, sy, { width: leftW - 20 });
    sy += 28;
    if (!isReseller && company.gstin) {
      doc.text(`GSTIN: ${company.gstin}`, margin + 10, sy);
      sy += 12;
    }
    if (sellerPhone) doc.text(`Phone: ${sellerPhone}`, margin + 10, sy);
    if (sellerEmail) doc.text(`Email: ${sellerEmail}`, margin + 10, sy + 12, { width: leftW - 20 });

    const invDate =
      order?.date ||
      new Date(order.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

    doc.font(`${FONT_BOLD}`).fontSize(8).fillColor(MUTED).text("Order Details", margin + leftW + 10, boxY + 8);
    const metaRows = [
      ["Invoice No.", formatInvoiceNo(order.invoice, order.createdAt)],
      ["Invoice Date", invDate],
      ["Order ID", `#${order.invoice}`],
      ["Order Status", order?.status || "Processing"],
    ];
    if (!isReseller) {
      metaRows.splice(3, 0, ["Payment Mode", order?.paymentMethod || "Cash On Delivery"]);
    } else {
      metaRows.push(["Order Type", "Reseller Dispatch"]);
    }

    let my = boxY + 22;
    metaRows.forEach(([label, value]) => {
      doc.font(FONT).fontSize(8).fillColor(MUTED).text(`${label}:`, margin + leftW + 10, my, { continued: false });
      doc.font(`${FONT_BOLD}`).fillColor(INK).text(` ${value}`, margin + leftW + 78, my, { width: rightW - 88 });
      my += 13;
    });

    // Bill to
    const billY = boxY + boxH;
    const billH = 72;
    doc.rect(margin, billY, contentW, billH).stroke(BORDER);
    doc.font(`${FONT_BOLD}`).fontSize(8).fillColor(MUTED).text("Bill To / Customer", margin + 10, billY + 8);
    doc.font(`${FONT_BOLD}`).fontSize(10).fillColor(INK).text(recipientName, margin + 10, billY + 22);
    doc.font(FONT).fontSize(8).fillColor(MUTED);
    let by = billY + 36;
    if (recipientEmail) {
      doc.text(`Email: ${recipientEmail}`, margin + 10, by);
      by += 12;
    }
    if (recipientPhone) {
      doc.text(`Phone: ${recipientPhone}`, margin + 10, by);
      by += 12;
    }
    if (recipientAddress) doc.text(`Address: ${recipientAddress}`, margin + 10, by, { width: contentW - 24 });

    // Items table
    const tableY = billY + billH + 10;
    const cols = isReseller
      ? [
          { label: "#", x: margin + 6, w: 28 },
          { label: "Product Description", x: margin + 40, w: contentW - 140 },
          { label: "HSN", x: margin + contentW - 95, w: 45 },
          { label: "Qty", x: margin + contentW - 45, w: 35 },
        ]
      : [
          { label: "#", x: margin + 6, w: 22 },
          { label: "Description", x: margin + 30, w: 175 },
          { label: "HSN", x: margin + 208, w: 42 },
          { label: "Qty", x: margin + 252, w: 32 },
          { label: "Rate", x: margin + 286, w: 58 },
          { label: "GST%", x: margin + 346, w: 36 },
          { label: "Amount", x: margin + 384, w: contentW - 394 },
        ];

    doc.rect(margin, tableY, contentW, 18).fill(HEAD_BG).stroke(BORDER);
    doc.font(`${FONT_BOLD}`).fontSize(7).fillColor(INK);
    cols.forEach((c) => {
      doc.text(c.label, c.x, tableY + 5, { width: c.w, align: c.label === "Amount" ? "right" : "left" });
    });

    let rowY = tableY + 18;
    const cart = order.cart || [];
    cart.forEach((item, index) => {
      if (rowY > doc.page.height - 160) {
        doc.addPage();
        rowY = margin + 20;
      }

      const h = 20;
      if (index % 2 === 0) {
        doc.rect(margin, rowY, contentW, h).fill("#fafafa");
      }
      doc.rect(margin, rowY, contentW, h).stroke("#dddddd");

      const qty = item.quantity || 1;
      const rate = Number(item.price) || 0;
      const lineTotal = rate * qty;
      const gstRate = item.taxRate || item.gstRate || item.gstPercentage || "-";

      doc.font(FONT).fontSize(8).fillColor(INK);
      doc.text(String(index + 1), cols[0].x, rowY + 6, { width: cols[0].w });
      doc.text(String(item.title || "Product").slice(0, isReseller ? 70 : 48), cols[1].x, rowY + 6, { width: cols[1].w });
      doc.text(String(item.hsn || "-"), cols[2].x, rowY + 6, { width: cols[2].w });
      doc.text(String(qty), cols[3].x, rowY + 6, { width: cols[3].w });

      if (!isReseller) {
        doc.text(formatMoney(company.currency, rate), cols[4].x, rowY + 6, { width: cols[4].w });
        doc.text(String(gstRate), cols[5].x, rowY + 6, { width: cols[5].w });
        doc.text(formatMoney(company.currency, lineTotal), cols[6].x, rowY + 6, {
          width: cols[6].w,
          align: "right",
        });
      }

      rowY += h;
    });

    // Totals / Summary
    let ty = rowY + 14;
    if (!isReseller) {
      const sumX = margin + contentW - 210;
      const sumRows = [
        ["Subtotal", formatMoney(company.currency, order.subTotal)],
        ["Shipping", formatMoney(company.currency, order.shippingCost || 0)],
        ["Discount", `- ${formatMoney(company.currency, order.discount || 0)}`],
      ];
      const gstVal = order?.taxSummary?.exclusiveTax || order?.vat || 0;
      if (gstVal > 0) sumRows.push(["GST", formatMoney(company.currency, gstVal)]);

      doc.font(FONT).fontSize(9).fillColor(MUTED);
      sumRows.forEach(([label, val]) => {
        doc.text(label, sumX, ty, { width: 90 });
        doc.text(val, sumX + 95, ty, { width: 100, align: "right" });
        ty += 14;
      });

      doc.moveTo(sumX, ty + 2).lineTo(margin + contentW - 12, ty + 2).stroke(BORDER);
      ty += 8;
      doc.font(`${FONT_BOLD}`).fontSize(11).fillColor(INK);
      doc.text("Grand Total", sumX, ty, { width: 90 });
      doc.text(formatMoney(company.currency, order.total), sumX + 95, ty, {
        width: 100,
        align: "right",
      });
    } else {
      // For Reseller: Suppress internal prices completely. Show total items count.
      const totalUnits = (order.cart || []).reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
      doc.font(`${FONT_BOLD}`).fontSize(10).fillColor(INK);
      doc.text(`Total Items Packaged: ${totalUnits} Unit(s)`, margin + 12, ty);
      ty += 16;
    }

    // Footer
    const footY = Math.min(ty + 30, doc.page.height - margin - 70);
    doc.font(FONT).fontSize(8).fillColor(MUTED);
    doc.text(
      "Terms: Goods once sold will not be taken back or exchanged except as per policy. This is a computer-generated document and does not require a physical signature.",
      margin + 12,
      footY,
      { width: contentW - 24, align: "left" }
    );
    doc
      .font(`${FONT_BOLD}`)
      .fontSize(9)
      .fillColor(INK)
      .text(`For ${sellerName}`, margin + 12, footY + 36, { width: contentW - 24, align: "right" });
    doc.font(FONT).fontSize(8).fillColor(MUTED).text("Authorised Signatory", margin + 12, footY + 50, {
      width: contentW - 24,
      align: "right",
    });

    doc.end();
  });
};

module.exports = {
  handleCreateInvoice,
};
