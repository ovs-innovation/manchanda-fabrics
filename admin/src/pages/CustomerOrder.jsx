import React, { useEffect, useMemo, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import {
  Table,
  TableHeader,
  TableCell,
  TableFooter,
  TableContainer,
  Pagination,
} from "@windmill/react-ui";
import { useTranslation } from "react-i18next";
import { IoBagHandle } from "react-icons/io5";
import { FiArrowLeft } from "react-icons/fi";

import OrderServices from "@/services/OrderServices";
import PageTitle from "@/components/Typography/PageTitle";
import Loading from "@/components/preloader/Loading";
import CustomerOrderTable from "@/components/customer/CustomerOrderTable";
import { notifyError } from "@/utils/toast";

const RESULTS_PER_PAGE = 20;

const CustomerOrder = () => {
  const { id } = useParams();
  const history = useHistory();
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    OrderServices.getOrderCustomer(id)
      .then((res) => {
        if (cancelled) return;
        setOrders(Array.isArray(res) ? res : []);
      })
      .catch((err) => {
        if (cancelled) return;
        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load customer orders";
        setError(message);
        setOrders([]);
        notifyError(message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const dataTable = useMemo(() => {
    const start = (currentPage - 1) * RESULTS_PER_PAGE;
    return orders.slice(start, start + RESULTS_PER_PAGE);
  }, [orders, currentPage]);

  return (
    <>
      <div className="flex items-center gap-2 mb-4 mt-2">
        <button
          type="button"
          onClick={() => {
            if (window.history.length > 1) {
              history.goBack();
            } else {
              history.push("/customers");
            }
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:text-store-600 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-xs text-xs font-bold uppercase tracking-wider transition-all cursor-pointer active:scale-95"
        >
          <FiArrowLeft className="w-4 h-4 mr-0.5" />
          <span>{t("Back") || "Back"}</span>
        </button>
      </div>

      <PageTitle>{t("CustomerOrderList")}</PageTitle>

      {loading && <Loading loading={loading} />}

      {!loading && error && (
        <div className="w-full bg-red-50 border border-red-100 rounded-xl p-6 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="w-full bg-white rounded-md dark:bg-gray-800">
          <div className="p-8 text-center">
            <span className="flex justify-center my-30 text-red-500 font-semibold text-6xl">
              <IoBagHandle />
            </span>
            <h2 className="font-medium text-base mt-4 text-gray-600">
              {t("CustomerOrderEmpty")}
            </h2>
          </div>
        </div>
      )}

      {!loading && !error && orders.length > 0 && (
        <TableContainer className="mb-8">
          <Table>
            <TableHeader>
              <tr>
                <TableCell> {t("CustomerOrderId")} </TableCell>
                <TableCell>{t("CustomerOrderTime")}</TableCell>
                <TableCell>{t("CustomerShippingAddress")}</TableCell>
                <TableCell>{t("Phone")} </TableCell>
                <TableCell>{t("CustomerOrderMethod")} </TableCell>
                <TableCell>{t("Amount")}</TableCell>
                <TableCell className="text-center">
                  {t("CustomerOrderStatus")}
                </TableCell>
                <TableCell className="text-center">
                  {t("CustomerOrderAction")}
                </TableCell>
              </tr>
            </TableHeader>
            <CustomerOrderTable orders={dataTable} />
          </Table>
          <TableFooter>
            <Pagination
              totalResults={orders.length}
              resultsPerPage={RESULTS_PER_PAGE}
              onChange={setCurrentPage}
              label="Table navigation"
            />
          </TableFooter>
        </TableContainer>
      )}
    </>
  );
};

export default CustomerOrder;
