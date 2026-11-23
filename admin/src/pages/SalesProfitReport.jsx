import React from "react";
import PageTitle from "@/components/Typography/PageTitle";
import NetSalesProfitSection from "@/components/dashboard/NetSalesProfitSection";
import AnimatedContent from "@/components/common/AnimatedContent";

const SalesProfitReport = () => {
  return (
    <>
      <PageTitle>Sales & Profit Reports</PageTitle>
      <AnimatedContent>
        <div className="mt-4 mb-10">
          <NetSalesProfitSection />
        </div>
      </AnimatedContent>
    </>
  );
};

export default SalesProfitReport;
