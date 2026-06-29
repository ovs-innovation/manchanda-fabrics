const fs = require("fs");
const path = require("path");

const createPath = path.join(__dirname, "../lib/email-sender/create.js");
if (fs.existsSync(createPath)) {
  let content = fs.readFileSync(createPath, "utf8");

  // 1. Inject companyInfo definition at the start of handleCreateInvoice
  const targetStart = "const handleCreateInvoice = async (invoice, pathName) => {\n  let logoBuffer;";
  const replacementStart = `const handleCreateInvoice = async (invoice, pathName) => {
  let logoBuffer;
  const companyInfo = invoice?.company_info || {
    company: "Manchanda Fabrics",
    address: "Ludhiana, Punjab, India",
    phone: "+91 98765 43210",
    email: "support@manchandafabrics.com",
    website: "www.manchandafabrics.com",
    currency: "₹",
    vat_number: ""
  };`;
  content = content.replace(targetStart, replacementStart);

  // Also replace generateHeader, generateInvoiceTable calls to pass companyInfo
  content = content.replace(
    "generateHeader(doc, invoice, logoBuffer);",
    "generateHeader(doc, invoice, logoBuffer, companyInfo);"
  );
  content = content.replace(
    "generateInvoiceTable(doc, invoice);",
    "generateInvoiceTable(doc, invoice, companyInfo);"
  );

  // Update generateHeader definition
  content = content.replace(
    "const generateHeader = (doc, invoice, logoBuffer) => {",
    "const generateHeader = (doc, invoice, logoBuffer, companyInfo) => {"
  );

  // Update generateInvoiceTable definition
  content = content.replace(
    "function generateInvoiceTable(doc, invoice) {",
    "function generateInvoiceTable(doc, invoice, companyInfo) {"
  );

  // 2. Replace company_info accesses in generateHeader
  content = content.replace(
    "if (!logoBuffer && invoice?.company_info?.logo) {",
    "if (!logoBuffer && companyInfo?.logo) {"
  );
  content = content.replace(
    "invoice.company_info.logo",
    "companyInfo.logo"
  );
  content = content.replace(
    "invoice?.company_info?.vat_number",
    "companyInfo?.vat_number"
  );
  content = content.replace(
    "invoice.company_info.vat_number",
    "companyInfo.vat_number"
  );
  content = content.replace(
    "invoice?.company_info?.company",
    "companyInfo?.company"
  );
  content = content.replace(
    "invoice?.company_info?.address",
    "companyInfo?.address"
  );
  content = content.replace(
    "invoice?.company_info?.phone",
    "companyInfo?.phone"
  );
  content = content.replace(
    "invoice?.company_info?.email",
    "companyInfo?.email"
  );
  content = content.replace(
    "invoice?.company_info?.website",
    "companyInfo?.website"
  );

  // 3. Replace company_info accesses in generateInvoiceTable
  // We want to replace invoice.company_info.currency with companyInfo.currency
  content = content.replace(/invoice\.company_info\.currency/g, "companyInfo.currency");

  fs.writeFileSync(createPath, content, "utf8");
  console.log("Successfully fixed companyInfo inside create.js!");
} else {
  console.log("create.js not found!");
}
