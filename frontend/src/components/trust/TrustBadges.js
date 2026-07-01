import React from "react";
import { IoShieldCheckmarkOutline, IoCardOutline, IoSyncOutline, IoHeadsetOutline } from "react-icons/io5";

const TrustBadges = () => {
  const items = [
    {
      id: 1,
      icon: <IoShieldCheckmarkOutline className="text-3xl text-[#93614E]" />,
      title: "100% Quality Checked",
      desc: "Every weave authenticated before shipment"
    },
    {
      id: 2,
      icon: <IoCardOutline className="text-3xl text-[#93614E]" />,
      title: "Secure Payments",
      desc: "SSL encrypted transaction environment"
    },
    {
      id: 3,
      icon: <IoSyncOutline className="text-3xl text-[#93614E]" />,
      title: "Easy Exchanges",
      desc: "Hassle-free size replacement policy"
    },
    {
      id: 4,
      icon: <IoHeadsetOutline className="text-3xl text-[#93614E]" />,
      title: "Customer Support",
      desc: "Fast assistance via Instagram and WhatsApp"
    }
  ];

  return (
    <div className="bg-white border-y border-[#D5BBB4]/60 py-12 md:py-16">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {items.map((item) => (
            <div key={item.id} className="flex flex-col items-center text-center space-y-3 p-5 bg-[#F5ECE8] rounded-xl border border-[#D5BBB4]/60 shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:border-[#93614E]/40 transition-colors duration-300">
              <div className="p-3 bg-[#2B211E] border border-[#D5BBB4]/60 rounded-full">
                {item.icon}
              </div>
              <h3 className="text-sm font-black uppercase tracking-wider text-[#2B211E]">
                {item.title}
              </h3>
              <p className="text-xs text-[#2B211E]/60 font-semibold max-w-[200px]">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrustBadges;
