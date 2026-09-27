import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

const downloadShippingLabelPdf = async (
  element,
  filename = "Shipping-Label.pdf"
) => {
  if (!element || typeof window === "undefined") {
    throw new Error("Shipping label element not found");
  }

  // Exact 4" × 6" dimensions in millimeters
  const pdfWidth = 101.6;
  const pdfHeight = 152.4;

  // Ultra-high 4x density render (~384 DPI) for razor-sharp barcodes and text
  const canvas = await html2canvas(element, {
    scale: 4,
    useCORS: true,
    logging: false,
    backgroundColor: "#ffffff",
    scrollX: 0,
    scrollY: 0,
  });

  // Lossless PNG: Zero compression artifacts, perfect crisp borders and typography
  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [pdfWidth, pdfHeight],
    compress: true,
  });

  // Exact full-bleed 4" x 6" fit with zero shrinking margins
  pdf.addImage(
    imgData,
    "PNG",
    0,
    0,
    pdfWidth,
    pdfHeight,
    undefined,
    "SLOW"
  );

  pdf.save(filename);
};

export default downloadShippingLabelPdf;
