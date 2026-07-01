import {
  Document,
  Font,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import dayjs from "dayjs";
import { getStoreAddress, getStoreCompanyName } from "@/utils/storeBrand";

Font.register({
  family: "Arial",
  fonts: [
    {
      src: "https://cdn.jsdelivr.net/npm/@canvas-fonts/arial@1.0.4/Arial.ttf",
    },
    {
      src: "https://cdn.jsdelivr.net/npm/@canvas-fonts/arial-bold@1.0.4/Arial-Bold.ttf",
      fontWeight: "bold",
    },
  ],
});

const INVOICE_FONT = "Arial";

const BRAND = "#9C6A5A";
const INK = "#3B2A25";
const MUTED = "#6B5B55";
const LINE = "#E6D1CB";
const BG = "#FAF7F5";

const styles = StyleSheet.create({
  page: {
    margin: 36,
    paddingTop: 8,
    fontFamily: INVOICE_FONT,
    fontSize: 9,
    color: INK,
    lineHeight: 1.45,
  },
  table: {
    display: "table",
    width: "auto",
    color: "#4b5563",
    marginRight: 0,
    marginBottom: 10,
    marginLeft: 0,
    marginTop: 0,
    borderRadius: "8px",
    borderColor: "#e9e9e9",
    borderStyle: "solid",
    borderWidth: 0.5,
    padding: 0,
    textAlign: "left",
  },
  tableRow: {
    // margin: 'auto',
    flexDirection: "row",
    paddingBottom: 1,
    paddingTop: 1,
    textAlign: "left",
    borderWidth: 0.8,
    borderColor: "#E5E7EB",
    borderBottom: "0",
  },
  tableRowHeder: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    paddingBottom: 4,
    paddingTop: 4,
    paddingLeft: 6,
    borderBottomWidth: 1,
    borderColor: "#222222",
    borderStyle: "solid",
    textAlign: "left",
  },
  tableCol: {
    width: "11%",
    textAlign: "left",
  },
  tableColProduct: {
    width: "28%",
    textAlign: "left",
  },
  tableColMfg: {
    width: "15%",
    textAlign: "left",
  },
  tableColHsn: {
    width: "7%",
    textAlign: "left",
  },
  tableColSmall: {
    width: "8%",
    textAlign: "left",
  },
  tableColQty: {
    width: "5%",
    textAlign: "left",
  },
  tableColSr: {
    width: "5%",
    textAlign: "left",
  },
  tableCell: {
    margin: "auto",
    marginTop: 1,
    fontSize: 6,
    fontFamily: INVOICE_FONT,
    paddingLeft: "0",
    paddingRight: "0",
    marginLeft: "8",
    marginRight: "8",
  },

  tableCellNumeric: {
    margin: "auto",
    marginTop: 1,
    fontSize: 6,
    paddingLeft: "0",
    paddingRight: "0",
    marginLeft: "8",
    marginRight: "8",
    fontFamily: INVOICE_FONT,
    whiteSpace: "nowrap",
  },

  invoiceFirst: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 18,
    paddingLeft: 10,
    paddingRight: 10,
    borderBottom: 1,
    borderColor: "#f3f4f6",
    // backgroundColor:'#EEF2FF',
  },
  invoiceSecond: {
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingTop: 20,
    paddingBottom: 10,
    paddingLeft: 10,
    paddingRight: 10,
  },
  invoiceSecondLeft: {
    flex: 1,
  },
  invoiceSecondRight: {
    flex: 1,
    alignItems: "flex-end",
    textAlign: "right",
  },
  lightLine: {
    borderBottomWidth: 0.7,
    borderColor: "#e5e7eb",
    marginVertical: 4,
    width: "100%",
  },
  invoiceThird: {
    display: "flex",
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    paddingTop: 20,
    paddingBottom: 20,
    paddingLeft: 10,
    paddingRight: 10,
    borderTop: 1,
    borderColor: "#ffffff",
    backgroundColor: "#f4f5f7",
    borderRadius: 12,
    marginLeft: "13",
    marginRight: "13",

    // backgroundColor:'#F2FCF9',
  },
  logo: {
    width: 64,
    height: 25,
    bottom: 5,
    right: 10,
    marginBottom: 10,
    textAlign: "right",
    color: "#4b5563",
    fontFamily: INVOICE_FONT,
    fontWeight: "bold",
    fontSize: 10.3,

    marginRight: "39%",
    textTransform: "uppercase",
  },
  title: {
    color: "#2f3032",
    fontFamily: INVOICE_FONT,
    fontWeight: "bold",
    fontSize: 8.1,
    textTransform: "uppercase",
  },
  info: {
    fontSize: 9,
    color: "#6b7280",
  },
  infoCost: {
    fontSize: 10,
    color: "#6b7280",
    marginLeft: "4%",
    marginTop: "7px",
    textAlign: "left",
    width: "25%",
  },
  invoiceNum: {
    fontSize: 9,
    color: "#6b7280",
    marginLeft: "6%",
  },
  topAddress: {
    fontSize: 10,
    color: "#6b7280",
    width: "100%",
    marginLeft: "20%",

    // textAlign: "right",
    // whiteSapce: "nowrap",
  },
  amount: {
    fontSize: 10,
    color: "#1f2937",
  },
  totalAmount: {
    fontSize: 10,
    color: "#1f2937",
    fontFamily: INVOICE_FONT,
    fontWeight: "bold",
    textTransform: "uppercase",
    textAlign: "right",
  },
  status: {
    color: "#9C6A5A",
  },
  quantity: {
    color: "#1f2937",
    textAlign: "center",
  },
  itemPrice: {
    color: "#1f2937",
    textAlign: "left",
  },
  header: {
    color: "#6b7280",
    fontSize: 4,
    fontFamily: INVOICE_FONT,
    fontWeight: "bold",
    textTransform: "uppercase",
    textAlign: "left",
  },

  thanks: {
    color: "#9C6A5A",
  },
  infoRight: {
    textAlign: "right",
    fontSize: 9,
    color: "#6b7280",
    width: "25%",
    marginRight: "39%",
    fontFamily: INVOICE_FONT,
    fontWeight: "bold",
  },
  titleRight: {
    textAlign: "right",
    fontFamily: INVOICE_FONT,
    fontWeight: "bold",
    fontSize: 8.1,
    width: "25%",
    marginRight: "39%",
    textTransform: "uppercase",
    color: "#2f3032",
  },
  topBg: {
    // backgroundColor:'#EEF2FF',
  },
  invoiceDiv: {
    alignItems: "baseline",
  },
});

const InvoiceForDownload = ({
  data,
  currency,
  globalSetting,
  getNumberTwo,
  storeCustomizationSetting,
}) => {
  // Calculate discount same as Invoice.js
  const mrpTotal = data?.cart?.reduce((sum, item) => {
    const mrp = item.mrp ?? item.originalPrice ?? item.price ?? 0;
    const qty = item.quantity || 1;
    return sum + mrp * qty;
  }, 0) || 0;
  
  const totalDiscount = data?.cart?.reduce((sum, item) => {
    const mrp = item.mrp ?? item.originalPrice ?? item.price ?? 0;
    const salePrice = item.price ?? 0;
    const qty = item.quantity || 1;
    return sum + ((mrp - salePrice) * qty);
  }, 0) || 0;

  const totalGstRaw = data?.taxSummary?.exclusiveTax > 0 
    ? data.taxSummary.exclusiveTax 
    : data?.cart?.reduce((sum, item) => {
        const sellingPrice = Number(item.price) || (item.mrp ?? item.originalPrice ?? item.price ?? 0);
        const qty = item.quantity || 1;
        const gstRate = parseFloat(item.taxRate || item.gstRate || item.gstPercentage || 12);
        const gstAmount = (Math.abs(sellingPrice) * qty * gstRate) / 100;
        return sum + gstAmount;
      }, 0) || 0;
  
  // Ensure total GST is always positive
  const totalGst = Math.abs(totalGstRaw);

  const companyName = getStoreCompanyName();
  const companyAddress = getStoreAddress({
    storeCustomizationSetting,
    globalSetting,
  });

  const formatInvoiceNumber = (invoice, createdAt) => {
    if (!invoice) return "-";
    const invStr = String(invoice).trim();
    if (invStr.startsWith("MF/") || invStr.startsWith("FK/")) return invStr;
    const year = createdAt
      ? dayjs(createdAt).format("YYYY")
      : dayjs().format("YYYY");
    return `MF/${year}/${invStr}`;
  };


  return (
    <>
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={{ borderWidth: 1.5, borderColor: "#222", padding: 10 }}>
            <Text style={{ fontSize: 12, fontWeight: "bold", textAlign: "center", marginBottom: 8 }}>
              Invoice
            </Text>
            <View style={{ borderTopWidth: 1, borderColor: "#222", marginBottom: 8 }} />

            <View style={{ flexDirection: "row", borderWidth: 1, borderColor: "#222" }}>
              <View style={{ width: "52%", padding: 8, borderRightWidth: 1, borderColor: "#222" }}>
                <Text style={{ fontSize: 8, fontWeight: "bold", color: "#333", marginBottom: 4 }}>Sold By</Text>
                <Text style={{ fontSize: 10, fontWeight: "bold", color: "#111", marginBottom: 3 }}>
                  {companyName}
                </Text>
                <Text style={{ fontSize: 8, color: "#444", lineHeight: 1.35, marginBottom: 4 }}>
                  {companyAddress}
                </Text>
                {globalSetting?.gstin ? (
                  <Text style={{ fontSize: 8, color: "#444" }}>GSTIN: {globalSetting.gstin}</Text>
                ) : null}
                {globalSetting?.contact ? (
                  <Text style={{ fontSize: 8, color: "#444" }}>Phone: {globalSetting.contact}</Text>
                ) : null}
                {globalSetting?.email ? (
                  <Text style={{ fontSize: 8, color: "#444" }}>Email: {globalSetting.email}</Text>
                ) : null}
              </View>
              <View style={{ width: "48%", padding: 8 }}>
                <Text style={{ fontSize: 8, fontWeight: "bold", color: "#333", marginBottom: 4 }}>Invoice Details</Text>
                <Text style={{ fontSize: 8, color: "#444", marginBottom: 2 }}>
                  <Text style={{ fontWeight: "bold" }}>Invoice No: </Text>
                  {formatInvoiceNumber(data?.invoice, data?.createdAt)}
                </Text>
                <Text style={{ fontSize: 8, color: "#444", marginBottom: 2 }}>
                  <Text style={{ fontWeight: "bold" }}>Date: </Text>
                  {data?.createdAt ? dayjs(data.createdAt).format("DD MMM YYYY, hh:mm A") : "-"}
                </Text>
                <Text style={{ fontSize: 8, color: "#444", marginBottom: 2 }}>
                  <Text style={{ fontWeight: "bold" }}>Payment: </Text>
                  {data?.paymentMethod || "-"}
                </Text>
                <Text style={{ fontSize: 8, color: "#444" }}>
                  <Text style={{ fontWeight: "bold" }}>Status: </Text>
                  {data?.status || "Processing"}
                </Text>
              </View>
            </View>

            <View style={{ borderWidth: 1, borderTopWidth: 0, borderColor: "#222", padding: 8 }}>
              <Text style={{ fontSize: 8, fontWeight: "bold", color: "#333", marginBottom: 4 }}>Bill To</Text>
              <Text style={{ fontSize: 9, fontWeight: "bold", color: "#111" }}>{data?.user_info?.name || "-"}</Text>
              {data?.user_info?.email ? (
                <Text style={{ fontSize: 8, color: "#444", marginTop: 2 }}>Email: {data.user_info.email}</Text>
              ) : null}
              {data?.user_info?.contact ? (
                <Text style={{ fontSize: 8, color: "#444" }}>Phone: {data.user_info.contact}</Text>
              ) : null}
              {(data?.user_info?.address || data?.user_info?.city) ? (
                <Text style={{ fontSize: 8, color: "#444" }}>
                  Address: {[data?.user_info?.address, data?.user_info?.city, data?.user_info?.country, data?.user_info?.zipCode].filter(Boolean).join(", ")}
                </Text>
              ) : null}
            </View>

          {/* Product Table */}
          <View style={{ marginTop: 0 }}>
            <View style={styles.table}>
              <View style={styles.tableRowHeder}>
                <View style={{ width: "100%", paddingLeft: "3px", paddingRight: "3px", paddingTop:"2px" }}>
                  <Text  >
                    <Text style={[styles.header,{color:"#111"}]}>Item Details</Text>
                  </Text>
                </View>
              </View>
              <View style={styles.tableRow}>
                <View style={styles.tableColSr}>
                  <Text style={styles.tableCell}>
                    <Text style={styles.header}>Sr.</Text>
                  </Text>
                </View>
                <View style={styles.tableColProduct}>
                  <Text style={styles.tableCell}>
                    <Text style={styles.header}>product name</Text>
                  </Text>
                </View>
                {/* <View style={styles.tableColMfg}>
                  <Text style={styles.tableCell}>
                    <Text style={styles.header}>manufacturer name</Text>
                  </Text>
                </View> */}
                <View style={styles.tableColHsn}>
                  <Text style={styles.tableCell}>
                    <Text style={styles.header}>hsn</Text>
                  </Text>
                </View>
                <View style={styles.tableColQty}>
                  <Text style={styles.tableCell}>
                    <Text style={styles.header}>qty</Text>
                  </Text>
                </View>
                <View style={styles.tableColSmall}>
                  <Text style={styles.tableCell}>
                    <Text style={styles.header}>mrp</Text>
                  </Text>
                </View>
                <View style={styles.tableColSmall}>
                  <Text style={styles.tableCell}>
                    <Text style={styles.header}>discount</Text>
                  </Text>
                </View>
                <View style={styles.tableColHsn}>
                  <Text style={styles.tableCell}>
                    <Text style={styles.header}>gst %</Text>
                  </Text>
                </View>
                <View style={styles.tableColSmall}>
                  <Text style={styles.tableCell}>
                    <Text style={styles.header}>gst amt</Text>
                  </Text>
                </View>
                <View style={styles.tableColSmall}>
                  <Text style={styles.tableCell}>
                    <Text style={styles.header}>Pay. AMT</Text>
                  </Text>
                </View>
              </View>
            {data?.cart?.map((item, i) => {
              const mrp = Math.abs(Number(item.mrp) || Number(item.originalPrice) || Number(item.price) || 0);
              const quantity = item.quantity || 1;
              
              let discountPerItem = 0;
              const itemPrice = Number(item.price);
              const hasValidPrice = !isNaN(itemPrice) && itemPrice > 0;
              
              if (hasValidPrice && itemPrice < mrp) {
                discountPerItem = mrp - itemPrice;
              } else if (typeof item.discount === "number" && item.discount > 0) {
                discountPerItem = (mrp * item.discount) / 100;
              } else if (item.originalPrice && item.price && item.originalPrice > item.price) {
                discountPerItem = item.originalPrice - item.price;
              }
              
              const gstRate = parseFloat(item.taxRate || item.gstRate || item.gstPercentage || 12);
              const sellingPrice = Number(item.price) || (mrp - discountPerItem) || 0;
              const positiveSellingPrice = Math.abs(sellingPrice);
              const gstAmount = Math.abs(((positiveSellingPrice * quantity * gstRate) / 100) || 0);
              const payableAmount = (mrp - discountPerItem) * quantity;
              const finalGstAmount = Math.abs(Number(gstAmount) || 0);
              const finalPayableAmount = Math.abs(Number(payableAmount) || 0);

              return (
                <View key={i} style={styles.tableRow}>
                  <View style={styles.tableColSr}>
                    <Text style={styles.tableCellNumeric}>{i + 1}</Text>
                  </View>
                  <View style={styles.tableColProduct}>
                    <Text style={styles.tableCell}>{item.title}</Text>
                  </View>
                  {/* <View style={styles.tableColMfg}>
                    <Text style={styles.tableCell}>
                      {item.manufacturer && item.brand 
                        ? `${item.manufacturer} (${item.brand})`
                        : item.manufacturer || item.brand || "-"}
                    </Text>
                  </View> */}
                  <View style={styles.tableColHsn}>
                    <Text style={styles.tableCell}>
                      {item.hsn || "-"}
                    </Text>
                  </View>
                  <View style={styles.tableColQty}>
                    <Text style={styles.tableCellNumeric}>
                      {item.quantity}
                    </Text>
                  </View>
                  <View style={styles.tableColSmall}>
                    <Text style={styles.tableCellNumeric}>
                      {`${currency}${getNumberTwo(mrp)}`}
                    </Text>
                  </View>
                  <View style={styles.tableColSmall}>
                    <Text style={styles.tableCellNumeric}>
                      {`${currency}${getNumberTwo(Math.abs((discountPerItem || 0) * quantity))}`}
                    </Text>
                  </View>
                  <View style={styles.tableColHsn}>
                    <Text style={styles.tableCellNumeric}>
                      {gstRate}%
                    </Text>
                  </View>
                  <View style={styles.tableColSmall}>
                    <Text style={styles.tableCellNumeric}>
                      {`${currency}${getNumberTwo(Math.abs(finalGstAmount))}`}
                    </Text>
                  </View>
                  <View style={styles.tableColSmall}>
                    <Text style={styles.tableCellNumeric}>
                      {`${currency}${getNumberTwo(finalPayableAmount)}`}
                    </Text>
                  </View>
                </View>
              );
            })}
            </View>
          </View>

          {/* Bottom Section: Terms & Conditions + Price Summary */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 0, paddingHorizontal: 5 }}>
            {/* Left: Terms and Conditions */}
            <View style={{ width: "55%", paddingRight: 10 }}>
              <Text style={{ fontSize: 8, fontWeight: "bold", color: "#333", marginBottom: 4 }}>
                Terms & Conditions
              </Text>
              <Text style={{ fontSize: 8, color: "#444", lineHeight: 1.4 }}>
                Computer-generated invoice. Goods once sold are not returnable except as per store policy.
              </Text>
            </View>

            {/* Right: Price Summary */}
            <View style={{ width: "40%", borderLeft: 1, borderColor: "#e5e7eb", paddingLeft: 10 }}>
              {/* MRP Total */}
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 0 }}>
                <Text style={{ fontSize: 7, color: "#374151" }}>MRP Total</Text>
                <Text style={{ fontSize: 7, color: "#374151", fontWeight: "bold", fontFamily: "Arial" }}>
                  {currency}{getNumberTwo(Math.abs(mrpTotal))}
                </Text>
              </View>
              
              {/* Total Discount */}
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 0 }}>
                <Text style={{ fontSize: 7, color: "#374151" }}>Total Discount</Text>
                <Text style={{ fontSize: 7, color: "#444", fontWeight: "bold", fontFamily: "Arial" }}>
                  -{currency}{getNumberTwo(Math.abs(totalDiscount))}
                </Text>
              </View>
              
              {/* Coupon Applied */}
              {data?.coupon?.couponCode && (
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 0 }}>
                  <Text style={{ fontSize: 7, color: "#444" }}>
                    Coupon: <Text style={{ fontWeight: "bold" }}>{data.coupon.couponCode}</Text>
                  </Text>
                  <Text style={{ fontSize: 7, color: "#444", fontWeight: "bold", fontFamily: "Arial" }}>
                    -{currency}{getNumberTwo(Math.abs(data?.coupon?.discountAmount || data?.discount || 0))}
                  </Text>
                </View>
              )}
              
              {/* GST */}
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 0 }}>
                <Text style={{ fontSize: 7, color: "#374151" }}>GST</Text>
                <Text style={{ fontSize: 7, color: "#374151", fontWeight: "bold", fontFamily: "Arial" }}>
                  {currency}{getNumberTwo(Math.abs(totalGst))}
                </Text>
              </View>
              
              {/* Shipping Cost */}
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 0 }}>
                <Text style={{ fontSize: 7, color: "#374151" }}>Shipping Cost</Text>
                <Text style={{ fontSize: 7, color: "#444", fontWeight: "bold", fontFamily: "Arial" }}>
                  {(data?.shippingCost || 0) > 0 ? `${currency}${getNumberTwo(Math.abs(data.shippingCost))}` : "FREE"}
                </Text>
              </View>
              
              {/* Estimated Payable */}
              <View style={{ flexDirection: "row", justifyContent: "space-between", backgroundColor: "#f3f4f6", padding: 4, borderRadius: 2, borderWidth: 1, borderColor: "#222" }}>
                <Text style={{ fontSize: 8, color: "#111", fontWeight: "bold" }}>Grand Total</Text>
                <Text style={{ fontSize: 8, color: "#111", fontWeight: "bold", fontFamily: "Arial" }}>
                  {currency}{getNumberTwo(Math.abs(data.total || 0))}
                </Text>
              </View>
              <Text style={{ fontSize: 8, fontWeight: "bold", color: "#111", textAlign: "right", marginTop: 16 }}>
                For {companyName}
              </Text>
              <Text style={{ fontSize: 7, color: "#555", textAlign: "right", marginTop: 4 }}>
                Authorised Signatory
              </Text>
            </View>
          </View>
          <View style={styles.lightLine} />
          </View>
        </Page>
      </Document>
    </>
  );
};

export default InvoiceForDownload;
