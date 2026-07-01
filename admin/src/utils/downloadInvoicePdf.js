const downloadInvoicePdf = async (element, filename = "Invoice.pdf") => {
  if (!element || typeof window === "undefined") return;

  const html2pdf = (await import("html2pdf.js")).default;

  await html2pdf()
    .set({
      margin: [8, 8, 8, 8],
      filename,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["css", "legacy"] },
    })
    .from(element)
    .save();
};

export default downloadInvoicePdf;
