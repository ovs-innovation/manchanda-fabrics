import React from "react";
import { resolveLineItemPricing } from "@/utils/invoicePricing";

const InvoiceOrderTable = ({ data, currency, getNumberTwo }) => {
  return (
    <tbody
      className="bg-white text-sm print:bg-white"
      style={{ fontFamily: "Arial, sans-serif" }}
    >
      {data?.cart?.map((item, i) => {
        const line = resolveLineItemPricing(item);

        return (
          <tr
            key={i}
            className={`${i % 2 === 0 ? "bg-white" : "bg-gray-50"} border-b border-[#ccc] print:bg-white`}
          >
            <th className="px-2 py-1.5 whitespace-nowrap font-normal text-left border-r border-[#ccc]">
              {i + 1}
            </th>
            <td className="product-column px-2 py-1.5 font-normal border-r border-[#ccc]">
              {item.title}
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
