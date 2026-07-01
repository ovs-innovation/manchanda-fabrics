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
    email: fromOrder.email || gs.email || "support@manchandafabrics.com",
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
  const company = await resolveCompanyInfo(order);
  const fonts = await ensureArialFonts();

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
      .text("Invoice", margin, titleY, { width: contentW, align: "center" });

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

    doc.font(`${FONT_BOLD}`).fontSize(8).fillColor(MUTED).text("Sold By", margin + 10, boxY + 8);
    doc.font(`${FONT_BOLD}`).fontSize(10).fillColor(INK).text(company.company, margin + 10, boxY + 20, { width: leftW - 20 });
    doc.font(FONT).fontSize(8).fillColor(MUTED);
    let sy = boxY + 34;
    doc.text(company.address, margin + 10, sy, { width: leftW - 20 });
    sy += 28;
    if (company.gstin) {
      doc.text(`GSTIN: ${company.gstin}`, margin + 10, sy);
      sy += 12;
    }
    if (company.phone) doc.text(`Phone: ${company.phone}`, margin + 10, sy);
    doc.text(`Email: ${company.email}`, margin + 10, sy + 12, { width: leftW - 20 });

    const invDate =
      order?.date ||
      new Date(order.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

    doc.font(`${FONT_BOLD}`).fontSize(8).fillColor(MUTED).text("Invoice Details", margin + leftW + 10, boxY + 8);
    const metaRows = [
      ["Invoice No.", formatInvoiceNo(order.invoice, order.createdAt)],
      ["Invoice Date", invDate],
      ["Order ID", `#${order.invoice}`],
      ["Payment Mode", order?.paymentMethod || "Cash On Delivery"],
      ["Order Status", order?.status || "Processing"],
    ];
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
    doc.font(`${FONT_BOLD}`).fontSize(8).fillColor(MUTED).text("Bill To", margin + 10, billY + 8);
    doc.font(`${FONT_BOLD}`).fontSize(10).fillColor(INK).text(order?.user_info?.name || "-", margin + 10, billY + 22);
    doc.font(FONT).fontSize(8).fillColor(MUTED);
    let by = billY + 36;
    if (order?.user_info?.email) {
      doc.text(`Email: ${order.user_info.email}`, margin + 10, by);
      by += 12;
    }
    if (order?.user_info?.contact) {
      doc.text(`Phone: ${order.user_info.contact}`, margin + 10, by);
      by += 12;
    }
    const shipAddr = [
      order?.user_info?.address,
      order?.user_info?.city,
      order?.user_info?.country,
      order?.user_info?.zipCode,
    ]
      .filter(Boolean)
      .join(", ");
    if (shipAddr) doc.text(`Address: ${shipAddr}`, margin + 10, by, { width: contentW - 24 });

    // Items table
    const tableY = billY + billH + 10;
    const cols = [
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
      doc.text(String(item.title || "Product").slice(0, 48), cols[1].x, rowY + 6, { width: cols[1].w });
      doc.text(String(item.hsn || "-"), cols[2].x, rowY + 6, { width: cols[2].w });
      doc.text(String(qty), cols[3].x, rowY + 6, { width: cols[3].w });
      doc.text(formatMoney(company.currency, rate), cols[4].x, rowY + 6, { width: cols[4].w });
      doc.text(String(gstRate), cols[5].x, rowY + 6, { width: cols[5].w });
      doc.text(formatMoney(company.currency, lineTotal), cols[6].x, rowY + 6, {
        width: cols[6].w,
        align: "right",
      });

      rowY += h;
    });

    // Totals
    const sumX = margin + contentW - 210;
    let ty = rowY + 14;
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

    // Footer
    const footY = Math.min(ty + 40, doc.page.height - margin - 70);
    doc.font(FONT).fontSize(8).fillColor(MUTED);
    doc.text(
      "Terms: Goods once sold will not be taken back or exchanged except as per store policy. This is a computer-generated invoice and does not require a physical signature.",
      margin + 12,
      footY,
      { width: contentW - 24, align: "left" }
    );
    doc
      .font(`${FONT_BOLD}`)
      .fontSize(9)
      .fillColor(INK)
      .text(`For ${company.company}`, margin + 12, footY + 36, { width: contentW - 24, align: "right" });
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
