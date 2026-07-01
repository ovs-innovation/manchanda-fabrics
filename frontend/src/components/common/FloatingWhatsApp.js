import React, { useState, useEffect } from "react";
import { FaWhatsapp } from "react-icons/fa";
import useGetSetting from "@hooks/useGetSetting";

const FloatingWhatsApp = () => {
  const { storeCustomizationSetting } = useGetSetting();
  const [isVisible, setIsVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const whatsappNumber = storeCustomizationSetting?.footer?.social_whatsapp || "09240250346";

  useEffect(() => {
    // Delay showing the widget to make it feel natural
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 lg:bottom-8 right-3 sm:right-8 z-[45] flex items-end justify-end flex-col group">
      {/* Tooltip */}
      <div 
        className={`bg-white text-[#3B2A25] px-4 py-3 rounded-2xl shadow-xl border border-[#E6D1CB] mb-4 mr-2 transition-all duration-500 transform origin-bottom-right max-w-[200px]
          ${showTooltip ? 'scale-100 opacity-100' : 'scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100'}`}
      >
        <div className="relative">
          <p className="text-sm font-semibold leading-snug text-[#3B2A25]">
            Need styling help? 🌸<br/>
            <span className="text-[#3B2A25]/75 font-normal text-xs">Chat with Manchanda Fabrics!</span>
          </p>
          {/* Arrow pointing down right */}
          <div className="absolute -bottom-5 right-2 w-3 h-3 bg-white border-b border-r border-[#E6D1CB] transform rotate-45"></div>
        </div>
      </div>

      {/* Button */}
      <a
        href={`https://wa.me/${whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent("Hello Manchanda Fabrics, I would like to inquire about...")}`}
        target="_blank"
        rel="noopener noreferrer"
        className="relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-[#25D366] text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 hover:bg-[#128C7E] lg:animate-bounce-slow"
        aria-label="Chat on WhatsApp"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {/* Pulse rings */}
        <span className="absolute inline-flex w-full h-full rounded-full bg-[#25D366] opacity-20 animate-ping hidden sm:inline-flex" />
        <span className="absolute inline-flex w-full h-full rounded-full bg-[#25D366] opacity-10 hidden sm:inline-flex" style={{ animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite', animationDelay: '0.5s' }} />
        
        <FaWhatsapp className="w-6 h-6 sm:w-8 sm:h-8 relative z-10" />
      </a>

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes bounce-slow {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          .animate-bounce-slow {
            animation: bounce-slow 3s ease-in-out infinite;
          }
        `
      }} />
    </div>
  );
};

export default FloatingWhatsApp;
