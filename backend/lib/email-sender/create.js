const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const fetch = require("node-fetch");

const handleCreateInvoice = async (invoice, pathName) => {
  let logoBuffer;

  // Attempt to load the logo locally first for sub-millisecond response
  const possibleLogoPaths = [
    path.join(__dirname, "../../../frontend/public/logo/logo.png"),
    path.join(__dirname, "../../../frontend/public/logo.png"),
    path.join(__dirname, "../../public/logo/logo.png")
  ];
  for (const p of possibleLogoPaths) {
    if (fs.existsSync(p)) {
      try {
        logoBuffer = fs.readFileSync(p);
        break;
      } catch (e) {
        console.error("Error reading local logo:", e);
      }
    }
  }

  // Fallback to fetching via URL if local read failed
  if (!logoBuffer && companyInfo?.logo) {
    try {
      const res = await fetch(companyInfo.logo);
      logoBuffer = await res.buffer();
    } catch (err) {
      console.error("Error fetching logo:", err);
    }
  }

  const pdfBuffer = await new Promise((resolve) => {
    let doc = new PDFDocument({ size: "A4", margin: 50 });

    generateHeader(doc, invoice, logoBuffer, companyInfo);
    generateCustomerInformation(doc, invoice);
    generateInvoiceTable(doc, invoice, companyInfo);
    generateFooter(doc);

    doc.end();

    let buffers = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
      let pdfData = new Uint8Array(Buffer.concat(buffers));
      resolve(pdfData);
    });
  });

  return pdfBuffer;
};

const generateHeader = (doc, invoice, logoBuffer, companyInfo) => {
  // Top Accent Colored Bar
  doc.rect(0, 0, doc.page.width, 15).fill("#9C6A5A");

  // Reset text color to dark brown
  doc.fillColor("#3B2A25");

  // Title
  doc
    .fontSize(22)
    .font("Helvetica-Bold")
    .fillColor("#9C6A5A")
    .text("INVOICE", 50, 45)
    .fillColor("#3B2A25");

  // Status and Details
  doc
    .fontSize(10)
    .font("Helvetica-Bold")
    .text("Status : ", 50, 75)
    .font("Helvetica")
    .text(invoice.status || "Order Placed", 95, 75);

  if (companyInfo?.vat_number) {
    doc
      .font("Helvetica-Bold")
      .text("GSTIN : ", 50, 90)
      .font("Helvetica")
      .text(companyInfo.vat_number, 95, 90);
  }

  // Draw Logo
  if (logoBuffer) {
    try {
      doc.image(logoBuffer, doc.page.width - 120, 35, {
        width: 70,
      });
    } catch (err) {
      console.error("Error rendering logo image in PDF:", err);
    }
  }

  // Company Details (Right aligned)
  const companyName = companyInfo?.company || "Manchanda Fabrics";
  const companyAddress = companyInfo?.address || "Ludhiana, Punjab, India";
  const companyPhone = companyInfo?.phone || "";
  const companyEmail = companyInfo?.email || "support@manchandafabrics.com";
  const companyWebsite = companyInfo?.website || "www.manchandafabrics.com";

  doc
    .fontSize(11)
    .font("Helvetica-Bold")
    .fillColor("#9C6A5A")
    .text(companyName, 200, 45, { align: "right" })
    .fillColor("#3B2A25")
    .fontSize(9)
    .font("Helvetica")
    .text(companyAddress, 200, 60, { align: "right" });

  if (companyPhone) {
    doc.text(`Phone: ${companyPhone}`, 200, 72, { align: "right" });
  }
  doc
    .text(companyEmail, 200, 84, { align: "right" })
    .text(companyWebsite, 200, 96, { align: "right" })
    .moveDown();
};

function generateCustomerInformation(doc, invoice) {
  const customerInformationTop = 135;
  
  // Section separator line
  doc.strokeColor("#E6D1CB").lineWidth(1).moveTo(50, 120).lineTo(doc.page.width - 50, 120).stroke();

  // Invoice Details Table Headers
  doc.font("Helvetica-Bold").fontSize(10).fillColor("#9C6A5A");
  generateTableRow(doc, customerInformationTop, "Date", "Invoice No.", "Payment Method");
  
  const customerInformationTopDetail = customerInformationTop + 18;
  doc.font("Helvetica").fontSize(10).fillColor("#3B2A25");
  generateTableRow(
    doc,
    customerInformationTopDetail,
    invoice?.date || new Date(invoice.createdAt).toLocaleDateString(),
    "#" + invoice.invoice,
    invoice?.paymentMethod || "Cash On Delivery"
  );

  // Customer Info Box (Right aligned)
  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .fillColor("#9C6A5A")
    .text("Billed To :", 200, customerInformationTop, { align: "right" })
    .font("Helvetica")
    .fontSize(9.5)
    .fillColor("#3B2A25")
    .text(invoice.user_info.name, 200, customerInformationTop + 15, { align: "right" })
    .text(invoice.user_info.email, 200, customerInformationTop + 28, { align: "right" });

  if (invoice?.user_info?.phone) {
    doc.text(invoice.user_info.phone, 200, customerInformationTop + 41, { align: "right" });
  }
  if (invoice?.user_info?.address) {
    doc.text(invoice.user_info.address, 200, customerInformationTop + 54, { align: "right", width: 250 });
  }

  // Divider before items table
  doc.strokeColor("#E6D1CB").lineWidth(1).moveTo(50, 220).lineTo(doc.page.width - 50, 220).stroke();
}

function generateInvoiceTable(doc, invoice, companyInfo) {
  let i;
  const invoiceTableTop = 250;

  doc.font("Helvetica-Bold");

  generateTableRow(
    doc,
    invoiceTableTop,
    "Name",
    "",
    "Quantity",
    "Item Price",
    "Total Price"
  );
  generateHr(doc, invoiceTableTop + 18);
  doc.font("Helvetica");

  for (i = 0; i < invoice.cart.length; i++) {
    const item = invoice.cart[i];
    const position = invoiceTableTop + (i + 1) * 30;
    total = item.price * item.quantity;
    generateTableRow(
      doc,
      position,
      item.title.substring(0, 25),
      "",
      item.quantity,
      formatCurrency(companyInfo.currency, item.price),
      formatCurrency(companyInfo.currency, total)
    );

    generateHr(doc, position + 20);
  }

  const subtotalPosition = invoiceTableTop + (i + 1) * 31;
  doc.font("Helvetica-Bold");
  generateTableRow(
    doc,
    subtotalPosition,
    "SubTotal",
    "VAT",
    "Shipping Cost",
    "Discount",
    "Total"
  );
  const paymentOptionPosition = subtotalPosition + 20;
  generateTableRow(
    doc,
    paymentOptionPosition,

    formatCurrency(companyInfo.currency, invoice.subTotal),
    formatCurrency(companyInfo.currency, invoice.vat),
    formatCurrency(companyInfo.currency, invoice.shippingCost),
    formatCurrency(companyInfo.currency, invoice.discount),
    formatCurrency(companyInfo.currency, invoice.total)
  );

  // const vatPosition = subtotalPosition + 20;
  // generateTableRow(
  //   doc,
  //   vatPosition,
  //   '',
  //   '',
  //   'VAT',
  //   '',
  //   formatCurrency(companyInfo.currency, invoice.vat)
  // );
  // const shippingPosition = vatPosition + 20;
  // generateTableRow(
  //   doc,
  //   shippingPosition,
  //   '',
  //   '',
  //   'Shipping Cost',
  //   '',
  //   formatCurrency(companyInfo.currency, invoice.shippingCost)
  // );
  // const discountPosition = shippingPosition + 20;
  // generateTableRow(
  //   doc,
  //   discountPosition,
  //   '',
  //   '',
  //   'Discount',
  //   '',
  //   formatCurrency(companyInfo.currency, invoice.discount)
  // );

  // doc
  //   .strokeColor('#aaaaaa')
  //   .lineWidth(1)
  //   .moveTo(250, discountPosition + 20)
  //   .lineTo(550, discountPosition + 20)
  //   .stroke();

  // const TotalPosition = discountPosition + 25;
  // doc.font('Helvetica-Bold');
  // generateTableRow(
  //   doc,
  //   TotalPosition,
  //   '',
  //   '',
  //   'Total',
  //   '',
  //   formatCurrency(companyInfo.currency, invoice.total)
  // );
  // doc.font('Helvetica');
}

function generateFooter(doc) {
  doc
    .fontSize(15)
    .text("Thanks for your order", 50, 750, { align: "center", width: 500 });
}

function generateTableRow(
  doc,
  y,
  item,
  description,
  unitCost,
  quantity,
  lineTotal
) {
  doc
    .fontSize(10)
    .text(item, 50, y)
    .text(description, 150, y)
    .text(unitCost, 280, y, { width: 90, align: "right" })
    .text(quantity, 370, y, { width: 90, align: "right" })
    .text(lineTotal, 0, y, { align: "right" });
}

function generateHr(doc, y) {
  doc.strokeColor("#aaaaaa").lineWidth(1).moveTo(50, y).lineTo(550, y).stroke();
}

function formatCurrency(curr, cents) {
  // console.log('formatCurrency', curr + '' + cents);
  return curr + "" + Number(cents).toFixed(2);
}

function formatDate(date) {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return year + "/" + month + "/" + day;
}

module.exports = {
  handleCreateInvoice,
};
