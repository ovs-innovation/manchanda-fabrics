import React from 'react';

const Card = ({ title, Icon, quantity, className }) => {
  // Map incoming classes to a clean color palette for dark mode
  const colorMap = {
    'red': { bg: 'bg-red-950/30 border-red-900/30', text: 'text-red-400' },
    'orange': { bg: 'bg-orange-950/30 border-orange-900/30', text: 'text-orange-400' },
    'indigo': { bg: 'bg-indigo-950/30 border-indigo-900/30', text: 'text-indigo-400' },
    'store': { bg: 'bg-yellow-950/30 border-yellow-900/30', text: 'text-[#9C6A5A]' },
  };

  const colorMatch = className?.match(/text-(\w+)-/);
  const colorKey = colorMatch ? colorMatch[1] : 'store';
  const colors = colorMap[colorKey] || { bg: 'bg-neutral-900 border-[#E6D1CB]/60', text: 'text-[#3B2A25]/70' };

  return (
    <div className="flex h-full group">
      <div className="flex items-center w-full bg-white p-5 rounded-2xl border border-[#E6D1CB]/60 shadow-lg transition-all duration-300 hover:border-[#9C6A5A]/30">
        <div className={`flex-shrink-0 flex items-center justify-center h-14 w-14 rounded-2xl border ${colors.bg} ${colors.text}`}>
          <Icon className="text-2xl" />
        </div>
        <div className="ml-5">
          <p className="text-[11px] font-bold text-[#3B2A25]/60 uppercase tracking-wider mb-0.5">
            {title}
          </p>
          <h3 className="text-2xl font-black text-[#3B2A25] tracking-tight">
            {quantity || 0}
          </h3>
        </div>
      </div>
    </div>
  );
};

export default Card;
