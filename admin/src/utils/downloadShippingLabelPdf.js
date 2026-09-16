import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

const downloadShippingLabelPdf = async (
  element,
  filename = "Shipping-Label.pdf"
) => {
  if (!element || typeof window === "undefined") {
    throw new Error("Shipping label element not found");
  }

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: "#ffffff",
    scrollX: 0,
    scrollY: 0,
  });

  const imgData = canvas.toDataURL("image/jpeg", 0.98);

  // Exact 4" × 6" dimensions in millimeters
  const pdfWidth = 101.6;
  const pdfHeight = 152.4;

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [pdfWidth, pdfHeight],
    compress: true,
  });

  // Calculate strict aspect-ratio preserving dimensions
  const imgWidth = canvas.width;
  const imgHeight = canvas.height;
  const ratio = Math.min((pdfWidth - 2) / imgWidth, (pdfHeight - 2) / imgHeight);
  const renderWidth = imgWidth * ratio;
  const renderHeight = imgHeight * ratio;
  const x = (pdfWidth - renderWidth) / 2;
  const y = (pdfHeight - renderHeight) / 2;

  pdf.addImage(
    imgData,
    "JPEG",
    x,
    y,
    renderWidth,
    renderHeight,
    undefined,
    "FAST"
  );

  pdf.save(filename);
};

export default downloadShippingLabelPdf;
