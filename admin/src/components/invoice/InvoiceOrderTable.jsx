import React from "react";
import { resolveLineItemPricing } from "@/utils/invoicePricing";

const getItemImage = (item) => {
  if (item?.image) return item.image;
  if (item?.img) return item.img;
  if (item?.featuredImage) return item.featuredImage;
  if (Array.isArray(item?.images) && item.images.length > 0) return item.images[0];
  return null;
};

const InvoiceOrderTable = ({ data, currency, getNumberTwo }) => {
  const isReseller = data?.orderType === "RESELLER";

  if (isReseller) {
    return (
      <tbody
        className="bg-white text-sm print:bg-white"
        style={{ fontFamily: "Arial, sans-serif" }}
      >
        {data?.cart?.map((item, i) => {
          const itemImg = getItemImage(item);
          return (
            <tr
              key={i}
              className={`${i % 2 === 0 ? "bg-white" : "bg-gray-50"} border-b border-[#ccc] print:bg-white`}
            >
              <th className="px-3 py-2 whitespace-nowrap font-normal text-left border-r border-[#ccc]">
                {i + 1}
              </th>
              <td className="product-column px-3 py-2 font-normal border-r border-[#ccc]">
                <div className="flex items-center gap-2.5">
                  {itemImg && (
                    <img
                      src={itemImg}
                      alt={item.title || "product"}
                      className="w-9 h-9 object-cover rounded border border-gray-200 shrink-0 print:w-8 print:h-8"
                    />
                  )}
                  <div>
                    <div className="font-semibold text-gray-900">{item.title}</div>
                    {item.color && (
                      <div className="text-xs text-gray-600 font-medium mt-0.5">Color: {item.color}</div>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-3 py-2 whitespace-nowrap font-normal text-center border-r border-[#ccc]">
                {item.hsn || "-"}
              </td>
              <td className="px-3 py-2 whitespace-nowrap font-bold text-center border-[#ccc]">
                {item.quantity || 1}
              </td>
            </tr>
          );
        })}
      </tbody>
    );
  }

  return (
    <tbody
      className="bg-white text-sm print:bg-white"
      style={{ fontFamily: "Arial, sans-serif" }}
    >
      {data?.cart?.map((item, i) => {
        const line = resolveLineItemPricing(item);
        const itemImg = getItemImage(item);

        return (
          <tr
            key={i}
            className={`${i % 2 === 0 ? "bg-white" : "bg-gray-50"} border-b border-[#ccc] print:bg-white`}
          >
            <th className="px-2 py-1.5 whitespace-nowrap font-normal text-left border-r border-[#ccc]">
              {i + 1}
            </th>
            <td className="product-column px-2 py-1.5 font-normal border-r border-[#ccc]">
              <div className="flex items-center gap-2">
                {itemImg && (
                  <img
                    src={itemImg}
                    alt={item.title || "product"}
                    className="w-8 h-8 object-cover rounded border border-gray-200 shrink-0 print:w-7 print:h-7"
                  />
                )}
                <div>
                  <div className="font-medium text-gray-900">{item.title}</div>
                  {item.color && (
                    <div className="text-xs text-gray-500 font-semibold mt-0.5">Color: {item.color}</div>
                  )}
                </div>
              </div>
            </td>
            <td className="px-2 py-1.5 whitespace-nowrap font-normal text-center border-r border-[#ccc]">
              {item.hsn || "-"}
            </td>
            <td className="px-2 py-1.5 whitespace-nowrap font-normal text-center border-r border-[#ccc]">
              {line.quantity}
            </td>
            <td className="px-2 py-1.5 whitespace-nowrap font-normal text-center border-r border-[#ccc]">
              {currency}
              {getNumberTwo(line.rate)}
            </td>
            <td className="px-2 py-1.5 whitespace-nowrap text-center font-normal border-r border-[#ccc]">
              {line.discountTotal > 0
                ? `${currency}${getNumberTwo(line.discountTotal)}`
                : `${currency}${getNumberTwo(0)}`}
            </td>
            <td className="px-2 py-1.5 whitespace-nowrap text-center font-normal border-r border-[#ccc]">
              {line.gstRate}%
            </td>
            <td className="px-2 py-1.5 whitespace-nowrap text-center font-normal border-r border-[#ccc]">
              {currency}
              {getNumberTwo(line.gstAmount)}
            </td>
            <td className="px-2 py-1.5 whitespace-nowrap text-right font-normal border-[#ccc]">
              {currency}
              {getNumberTwo(line.lineTotal)}
            </td>
          </tr>
        );
      })}
    </tbody>
  );
};

export default InvoiceOrderTable;
