import React from "react";
import { FiCreditCard, FiGift, FiPhoneCall, FiTruck } from "react-icons/fi";

//internal import
import useGetSetting from "@hooks/useGetSetting";
import useUtilsFunction from "@hooks/useUtilsFunction";

const FeatureCard = () => {
  const featurePromo = [
    {
      id: 1,
      title: "Premium Fabrics",
      icon: FiTruck,
    },
    {
      id: 2,
      title: "Secure Payments",
      icon: FiCreditCard,
    },
    {
      id: 3,
      title: "WhatsApp Ordering",
      icon: FiPhoneCall,
    },
    {
      id: 4,
      title: "Since 1995",
      icon: FiGift,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-screen-2xl mx-auto px-4 py-8 bg-[#FFF7E6] border-y border-[#F5E6D3]">
      {featurePromo.map((promo) => (
        <div
          key={promo.id}
          className="flex items-center justify-center gap-3 p-4 bg-white rounded-lg shadow-sm border border-[#F5E6D3]/40"
        >
          <div className="text-[#D4AF37]">
            <promo.icon className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <span className="block font-serif text-sm font-semibold uppercase tracking-wider text-[#3B2A25]">
              {promo.title}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FeatureCard;

