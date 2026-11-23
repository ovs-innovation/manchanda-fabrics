import React, { useState, useEffect, useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import dayjs from "dayjs";
import exportFromJSON from "export-from-json";
import {
  FiTrendingUp,
  FiCalendar,
  FiDollarSign,
  FiPercent,
  FiDownload,
  FiFilter,
  FiInfo,
  FiRefreshCw,
  FiSearch,
  FiShoppingBag,
  FiCheckCircle,
} from "react-icons/fi";
import OrderServices from "@/services/OrderServices";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const NetSalesProfitSection = ({ fallbackOrders = [] }) => {
  const currentYear = new Date().getFullYear();
  const currentMonthIdx = new Date().getMonth();

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [profitMargin, setProfitMargin] = useState(30); // 30% default margin for fabrics
  const [activeTab, setActiveTab] = useState("monthly"); // "monthly" | "daily"
  const [selectedMonthFilter, setSelectedMonthFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);

  // Fetch from backend API
  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await OrderServices.getSalesProfitReport({
        year: selectedYear,
        margin: profitMargin,
      });
      if (res && res.summary) {
        setReportData(res);
      } else {
        throw new Error("No data returned");
      }
    } catch (err) {
      console.warn("Using local fallback computation for Sales & Profit:", err.message);
      // Client-side fallback computation using fallbackOrders
      const marginDecimal = profitMargin / 100;
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const monthly = monthNames.map((name, idx) => ({
        month: name,
        monthIndex: idx,
        year: selectedYear,
        orderCount: 0,
        completedOrders: 0,
        cancelledOrders: 0,
        grossSales: 0,
        discounts: 0,
        netSales: 0,
        estimatedProfit: 0,
      }));

      const dailyMap = {};
      let totalGross = 0;
      let totalNet = 0;
      let totalDisc = 0;
      let totalOrd = 0;
      let totalComp = 0;
      let totalCanc = 0;

      const ordersList = Array.isArray(fallbackOrders) ? fallbackOrders : [];
      ordersList.forEach((order) => {
        const d = dayjs(order.updatedAt || order.createdAt);
        if (d.year() !== selectedYear) return;

        const mIdx = d.month();
        const dateStr = d.format("YYYY-MM-DD");
        const isCancelled = /cancel|refund|fail/i.test(String(order.status || ""));
        const gross = Number(order.total) || 0;
        const subTotal = Number(order.subTotal) || 0;
        const discount = Number(order.discount) || 0;

        totalOrd += 1;
        monthly[mIdx].orderCount += 1;

        if (!dailyMap[dateStr]) {
          dailyMap[dateStr] = {
            date: dateStr,
            day: d.format("ddd"),
            formattedDate: d.format("D MMM YYYY"),
            monthIndex: mIdx,
            orderCount: 0,
            completedOrders: 0,
            cancelledOrders: 0,
            grossSales: 0,
            discounts: 0,
            netSales: 0,
            estimatedProfit: 0,
          };
        }
        dailyMap[dateStr].orderCount += 1;
        dailyMap[dateStr].grossSales += gross;
        monthly[mIdx].grossSales += gross;
        totalGross += gross;

        if (isCancelled) {
          totalCanc += 1;
          monthly[mIdx].cancelledOrders += 1;
          dailyMap[dateStr].cancelledOrders += 1;
        } else {
          totalComp += 1;
          monthly[mIdx].completedOrders += 1;
          dailyMap[dateStr].completedOrders += 1;

          const net = Math.max(0, subTotal > 0 ? (subTotal - discount) : (gross - discount));
          const profit = net * marginDecimal;

          totalNet += net;
          totalDisc += discount;

          monthly[mIdx].discounts += discount;
          monthly[mIdx].netSales += net;
          monthly[mIdx].estimatedProfit += profit;

          dailyMap[dateStr].discounts += discount;
          dailyMap[dateStr].netSales += net;
          dailyMap[dateStr].estimatedProfit += profit;
        }
      });

      const daily = Object.values(dailyMap).sort((a, b) => new Date(b.date) - new Date(a.date));

      setReportData({
        summary: {
          grossSales: Math.round(totalGross * 100) / 100,
          netSales: Math.round(totalNet * 100) / 100,
          totalProfit: Math.round(totalNet * marginDecimal * 100) / 100,
          profitMarginPercent: profitMargin,
          totalDiscount: Math.round(totalDisc * 100) / 100,
          totalOrders: totalOrd,
          completedOrders: totalComp,
          cancelledOrders: totalCanc,
          averageOrderValue: totalComp > 0 ? Math.round((totalNet / totalComp) * 100) / 100 : 0,
          year: selectedYear,
        },
        monthlyReport: monthly,
        dailyReport: daily,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [selectedYear, profitMargin]);

  // Chart configuration for Monthly Visual Comparison
  const chartConfig = useMemo(() => {
    const months = reportData?.monthlyReport?.map((m) => m.month) || [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    const grossData = reportData?.monthlyReport?.map((m) => m.grossSales) || [];
    const netData = reportData?.monthlyReport?.map((m) => m.netSales) || [];
    const profitData = reportData?.monthlyReport?.map((m) => m.estimatedProfit) || [];

    return {
      labels: months,
      datasets: [
        {
          label: "Gross Sales (₹)",
          data: grossData,
          backgroundColor: "rgba(59, 130, 246, 0.75)",
          borderRadius: 6,
          barPercentage: 0.65,
        },
        {
          label: "Net Sales (₹)",
          data: netData,
          backgroundColor: "rgba(16, 185, 129, 0.85)",
          borderRadius: 6,
          barPercentage: 0.65,
        },
        {
          label: `Net Profit (~${profitMargin}%)`,
          data: profitData,
          backgroundColor: "rgba(234, 179, 8, 0.9)",
          borderRadius: 6,
          barPercentage: 0.65,
        },
      ],
    };
  }, [reportData, profitMargin]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          boxHeight: 8,
          font: { size: 12, weight: "600" },
          padding: 16,
        },
      },
      tooltip: {
        backgroundColor: "#0f172a",
        padding: 12,
        titleFont: { size: 13, weight: "bold" },
        bodyFont: { size: 12 },
        cornerRadius: 10,
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || "";
            const val = context.parsed.y || 0;
            return ` ${label}: ₹${val.toLocaleString("en-IN")}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11, weight: "500" }, color: "#64748b" },
      },
      y: {
        grid: { color: "rgba(226, 232, 240, 0.6)" },
        ticks: {
          font: { size: 11 },
          color: "#64748b",
          callback: (value) => `₹${value.toLocaleString("en-IN")}`,
        },
        border: { display: false },
      },
    },
  };

  // Filter daily reports by selected month and search query
  const filteredDailyReport = useMemo(() => {
    let list = reportData?.dailyReport || [];
    if (selectedMonthFilter !== "all") {
      const targetIdx = parseInt(selectedMonthFilter, 10);
      list = list.filter((d) => d.monthIndex === targetIdx);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (d) =>
          d.date.includes(q) ||
          d.formattedDate.toLowerCase().includes(q) ||
          d.day.toLowerCase().includes(q)
      );
    }
    return list;
  }, [reportData, selectedMonthFilter, searchQuery]);

  // Export to Excel / CSV
  const handleExportCSV = () => {
    if (activeTab === "monthly") {
      const exportList = (reportData?.monthlyReport || []).map((m) => ({
        Month: m.month,
        Year: m.year,
        "Total Orders": m.orderCount,
        "Fulfilled Orders": m.completedOrders,
        "Cancelled Orders": m.cancelledOrders,
        "Gross Sales (INR)": m.grossSales,
        "Discounts (INR)": m.discounts,
        "Net Sales (INR)": m.netSales,
        "Estimated Profit (INR)": m.estimatedProfit,
        "Margin %": `${profitMargin}%`,
      }));
      exportFromJSON({
        data: exportList,
        fileName: `Manchanda-Monthly-Sales-Profit-${selectedYear}`,
        exportType: exportFromJSON.types.csv,
      });
    } else {
      const exportList = filteredDailyReport.map((d) => ({
        Date: d.date,
        Day: d.day,
        "Total Orders": d.orderCount,
        "Fulfilled Orders": d.completedOrders,
        "Cancelled Orders": d.cancelledOrders,
        "Gross Sales (INR)": d.grossSales,
        "Discounts (INR)": d.discounts,
        "Net Sales (INR)": d.netSales,
        "Estimated Profit (INR)": d.estimatedProfit,
        "Margin %": `${profitMargin}%`,
      }));
      exportFromJSON({
        data: exportList,
        fileName: `Manchanda-Daywise-Sales-Profit-${selectedYear}`,
        exportType: exportFromJSON.types.csv,
      });
    }
  };

  const summary = reportData?.summary || {
    grossSales: 0,
    netSales: 0,
    totalProfit: 0,
    profitMarginPercent: profitMargin,
    totalDiscount: 0,
    totalOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    averageOrderValue: 0,
  };

  return (
    <section className="bg-white dark:bg-gray-800 rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-gray-100 dark:border-gray-700/80 p-5 sm:p-7 space-y-6 transition-all duration-300">
      {/* 1. Header with Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-700 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <FiTrendingUp className="w-5 h-5" />
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Net Sales & Profit Analytics
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Realized revenue, gross margin and comprehensive monthly & day-wise performance breakdown
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Year selector */}
          <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-700/60 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-600 text-xs sm:text-sm">
            <FiCalendar className="text-gray-400" />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-transparent font-semibold text-gray-800 dark:text-gray-200 focus:outline-none cursor-pointer"
            >
              {[currentYear, currentYear - 1, currentYear - 2].map((y) => (
                <option key={y} value={y} className="dark:bg-gray-800">
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Profit Margin Selector */}
          <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs sm:text-sm">
            <FiPercent className="text-emerald-600 dark:text-emerald-400" />
            <span className="text-gray-600 dark:text-gray-300 font-medium text-xs">Margin:</span>
            <select
              value={profitMargin}
              onChange={(e) => setProfitMargin(Number(e.target.value))}
              className="bg-transparent font-bold text-emerald-700 dark:text-emerald-300 focus:outline-none cursor-pointer"
            >
              <option value={20} className="dark:bg-gray-800">20%</option>
              <option value={25} className="dark:bg-gray-800">25%</option>
              <option value={30} className="dark:bg-gray-800">30% (Standard Fabric)</option>
              <option value={35} className="dark:bg-gray-800">35%</option>
              <option value={40} className="dark:bg-gray-800">40%</option>
              <option value={50} className="dark:bg-gray-800">50%</option>
            </select>
          </div>

          {/* Export Button */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-white text-white dark:text-gray-900 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer"
          >
            <FiDownload size={13} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 2. Top Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Sales */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 dark:border-emerald-500/30 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
              Net Sales
            </span>
            <span className="p-1.5 rounded-lg bg-emerald-500 text-white shadow-xs">
              <FiDollarSign size={14} />
            </span>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
              ₹{Number(summary.netSales || 0).toLocaleString("en-IN")}
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
              <FiCheckCircle className="text-emerald-500" size={11} /> Realized sales after discounts
            </p>
          </div>
        </div>

        {/* Estimated Profit */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 dark:border-amber-500/30 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-300">
              Estimated Net Profit
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-300/40">
              {profitMargin}% margin
            </span>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400">
              ₹{Number(summary.totalProfit || 0).toLocaleString("en-IN")}
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
              Estimated gross margin on net sales
            </p>
          </div>
        </div>

        {/* Gross Sales */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border border-blue-500/20 dark:border-blue-500/30 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-800 dark:text-blue-300">
              Gross Sales
            </span>
            <span className="p-1.5 rounded-lg bg-blue-500 text-white shadow-xs">
              <FiShoppingBag size={14} />
            </span>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
              ₹{Number(summary.grossSales || 0).toLocaleString("en-IN")}
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
              Total volume across {summary.totalOrders || 0} orders
            </p>
          </div>
        </div>

        {/* Average Order Value (AOV) & Discounts */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent border border-purple-500/20 dark:border-purple-500/30 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-800 dark:text-purple-300">
              Avg Order Value (AOV)
            </span>
            <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-950/60 px-2 py-0.5 rounded-md">
              {summary.completedOrders || 0} fulfilled
            </span>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
              ₹{Number(summary.averageOrderValue || 0).toLocaleString("en-IN")}
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
              Discounts Given: ₹{Number(summary.totalDiscount || 0).toLocaleString("en-IN")}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Monthly Visual Bar Chart Comparison */}
      <div className="p-5 rounded-2xl bg-gray-50/70 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-700/60">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wider">
              {selectedYear} Monthly Sales vs. Net Profit Comparison
            </h4>
            <p className="text-xs text-gray-400">
              Compare Gross Volume, Net Sales & Realized Profit month by month
            </p>
          </div>
        </div>
        <div className="h-64 sm:h-72 w-full">
          <Bar data={chartConfig} options={chartOptions} />
        </div>
      </div>

      {/* 4. Tab Navigation: Monthly Breakdown vs Day-wise Breakdown */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 dark:border-gray-700 pb-3">
          <div className="inline-flex p-1 bg-gray-100 dark:bg-gray-700/70 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab("monthly")}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                activeTab === "monthly"
                  ? "bg-white dark:bg-gray-800 text-emerald-700 dark:text-emerald-300 shadow-xs"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Monthly Breakdown (12 Months)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("daily")}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                activeTab === "daily"
                  ? "bg-white dark:bg-gray-800 text-emerald-700 dark:text-emerald-300 shadow-xs"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Day-Wise Breakdown
            </button>
          </div>

          {/* Controls for Day-wise filter */}
          {activeTab === "daily" && (
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-900/60 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs">
                <FiFilter className="text-gray-400" />
                <select
                  value={selectedMonthFilter}
                  onChange={(e) => setSelectedMonthFilter(e.target.value)}
                  className="bg-transparent font-medium text-gray-700 dark:text-gray-200 focus:outline-none cursor-pointer"
                >
                  <option value="all">All Months</option>
                  <option value="0">January</option>
                  <option value="1">February</option>
                  <option value="2">March</option>
                  <option value="3">April</option>
                  <option value="4">May</option>
                  <option value="5">June</option>
                  <option value="6">July</option>
                  <option value="7">August</option>
                  <option value="8">September</option>
                  <option value="9">October</option>
                  <option value="10">November</option>
                  <option value="11">December</option>
                </select>
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Search date..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <FiSearch className="absolute left-2.5 top-2.5 text-gray-400" size={13} />
              </div>
            </div>
          )}
        </div>

        {/* Tab 1: Monthly Breakdown Table */}
        {activeTab === "monthly" && (
          <div className="overflow-x-auto rounded-2xl border border-gray-100 dark:border-gray-700">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-600 dark:text-gray-300 font-bold uppercase text-[11px] border-b border-gray-100 dark:border-gray-700">
                <tr>
                  <th className="py-3 px-4">Month</th>
                  <th className="py-3 px-4 text-center">Total Orders</th>
                  <th className="py-3 px-4 text-center">Fulfilled</th>
                  <th className="py-3 px-4 text-center">Cancelled</th>
                  <th className="py-3 px-4 text-right">Gross Sales</th>
                  <th className="py-3 px-4 text-right">Discounts</th>
                  <th className="py-3 px-4 text-right font-extrabold text-emerald-700 dark:text-emerald-400">
                    Net Sales
                  </th>
                  <th className="py-3 px-4 text-right font-extrabold text-amber-600 dark:text-amber-400">
                    Est. Profit ({profitMargin}%)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-gray-800 dark:text-gray-200">
                {(reportData?.monthlyReport || []).map((m, idx) => {
                  const isCurrent = idx === currentMonthIdx && selectedYear === currentYear;
                  return (
                    <tr
                      key={m.month}
                      className={`hover:bg-gray-50/80 dark:hover:bg-gray-700/40 transition-colors ${
                        isCurrent
                          ? "bg-emerald-50/30 dark:bg-emerald-950/20 font-medium"
                          : ""
                      }`}
                    >
                      <td className="py-3 px-4 font-bold flex items-center gap-2">
                        {m.month} {m.year}
                        {isCurrent && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                            Current
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">{m.orderCount}</td>
                      <td className="py-3 px-4 text-center text-emerald-600 font-semibold">
                        {m.completedOrders}
                      </td>
                      <td className="py-3 px-4 text-center text-red-500">
                        {m.cancelledOrders}
                      </td>
                      <td className="py-3 px-4 text-right font-medium">
                        ₹{m.grossSales.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-500">
                        ₹{m.discounts.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                        ₹{m.netSales.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-amber-600 dark:text-amber-400">
                        ₹{m.estimatedProfit.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-gray-50 dark:bg-gray-900 font-bold border-t-2 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white">
                <tr>
                  <td className="py-3.5 px-4 uppercase text-xs">Total ({selectedYear})</td>
                  <td className="py-3.5 px-4 text-center">{summary.totalOrders}</td>
                  <td className="py-3.5 px-4 text-center text-emerald-600">
                    {summary.completedOrders}
                  </td>
                  <td className="py-3.5 px-4 text-center text-red-500">
                    {summary.cancelledOrders}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    ₹{Number(summary.grossSales || 0).toLocaleString("en-IN")}
                  </td>
                  <td className="py-3.5 px-4 text-right text-gray-500">
                    ₹{Number(summary.totalDiscount || 0).toLocaleString("en-IN")}
                  </td>
                  <td className="py-3.5 px-4 text-right text-emerald-600 dark:text-emerald-400">
                    ₹{Number(summary.netSales || 0).toLocaleString("en-IN")}
                  </td>
                  <td className="py-3.5 px-4 text-right text-amber-600 dark:text-amber-400">
                    ₹{Number(summary.totalProfit || 0).toLocaleString("en-IN")}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* Tab 2: Day-Wise Breakdown Table */}
        {activeTab === "daily" && (
          <div className="overflow-x-auto rounded-2xl border border-gray-100 dark:border-gray-700">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-600 dark:text-gray-300 font-bold uppercase text-[11px] border-b border-gray-100 dark:border-gray-700">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Day</th>
                  <th className="py-3 px-4 text-center">Orders</th>
                  <th className="py-3 px-4 text-center">Fulfilled</th>
                  <th className="py-3 px-4 text-center">Cancelled</th>
                  <th className="py-3 px-4 text-right">Gross Sales</th>
                  <th className="py-3 px-4 text-right">Discounts</th>
                  <th className="py-3 px-4 text-right font-extrabold text-emerald-700 dark:text-emerald-400">
                    Net Sales
                  </th>
                  <th className="py-3 px-4 text-right font-extrabold text-amber-600 dark:text-amber-400">
                    Est. Profit ({profitMargin}%)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-gray-800 dark:text-gray-200">
                {filteredDailyReport.length > 0 ? (
                  filteredDailyReport.map((d) => (
                    <tr
                      key={d.date}
                      className="hover:bg-gray-50/80 dark:hover:bg-gray-700/40 transition-colors"
                    >
                      <td className="py-3 px-4 font-bold">{d.formattedDate}</td>
                      <td className="py-3 px-4 text-gray-500 font-medium">{d.day}</td>
                      <td className="py-3 px-4 text-center">{d.orderCount}</td>
                      <td className="py-3 px-4 text-center text-emerald-600 font-semibold">
                        {d.completedOrders}
                      </td>
                      <td className="py-3 px-4 text-center text-red-500">
                        {d.cancelledOrders}
                      </td>
                      <td className="py-3 px-4 text-right font-medium">
                        ₹{d.grossSales.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-500">
                        ₹{d.discounts.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                        ₹{d.netSales.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-amber-600 dark:text-amber-400">
                        ₹{d.estimatedProfit.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-gray-400 text-xs">
                      No orders found for the selected month/query.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};

export default NetSalesProfitSection;
