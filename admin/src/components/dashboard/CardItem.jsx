import React from "react";
import { Link } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import useUtilsFunction from "@/hooks/useUtilsFunction";

const storeTones = [
  {
    gradient: "from-store-50 to-white dark:from-store-900/50 dark:to-store-900",
    ring: "ring-store-200 dark:ring-store-700/40",
    icon: "bg-store-500/10 text-store-600 dark:text-store-300",
    dot: "bg-store-400",
  },
  {
    gradient: "from-white to-store-50 dark:from-store-900 dark:to-store-900/80",
    ring: "ring-store-200 dark:ring-store-700/40",
    icon: "bg-store-600/10 text-store-700 dark:text-store-200",
    dot: "bg-store-500",
  },
  {
    gradient: "from-store-100/40 to-white dark:from-store-800/30 dark:to-store-900",
    ring: "ring-store-200 dark:ring-store-700/40",
    icon: "bg-store-500/15 text-store-500 dark:text-store-300",
    dot: "bg-store-300",
  },
];

const semanticStyles = {
  danger: {
    gradient: "from-red-50/80 to-white dark:from-red-950/20 dark:to-store-900",
    ring: "ring-red-100 dark:ring-red-900/30",
    icon: "bg-red-500/10 text-red-600 dark:text-red-400",
    dot: "bg-red-400",
  },
  success: {
    gradient: "from-emerald-50/60 to-white dark:from-emerald-950/20 dark:to-store-900",
    ring: "ring-emerald-100 dark:ring-emerald-900/30",
    icon: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    dot: "bg-emerald-400",
  },
};

const CardItem = ({
  title,
  Icon,
  quantity,
  amount,
  className,
  loading,
  pending,
  todayPending,
  olderPending,
  isAmount,
  link,
  tone = 0,
  variant,
}) => {
  const { getNumberTwo, currency } = useUtilsFunction();
  const colors =
    semanticStyles[variant] || storeTones[tone % storeTones.length];

  return (
    <div className="h-full w-full">
      {loading ? (
        <Skeleton height={132} borderRadius={16} />
      ) : (
        <Link
          to={link || "#"}
          className={`relative flex flex-col justify-between h-full admin-card bg-gradient-to-br ${colors.gradient} ring-1 ${colors.ring} hover:shadow-md transition-all duration-200 overflow-hidden p-5 group no-underline`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${colors.icon} shrink-0`}>
              <Icon className="text-[17px]" />
            </div>
            {amount ? (
              <span className="text-[11px] font-semibold text-store-600/70 dark:text-store-300/70 bg-white/80 dark:bg-store-800/60 px-2 py-1 rounded-lg border border-store-100 dark:border-store-700 leading-none">
                {currency}
                {getNumberTwo(amount)}
              </span>
            ) : null}
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${colors.dot} shrink-0`} />
              <span className="text-[11px] font-medium text-store-500/80 dark:text-store-400 uppercase tracking-wide leading-none truncate">
                {title}
              </span>
            </div>

            {pending && (
              <div className="flex gap-3 mt-1 mb-1">
                <div className="flex flex-col">
                  <span className="text-[9px] text-store-400 uppercase tracking-wider">Today</span>
                  <span className="text-xs font-bold text-store-600 dark:text-store-300">
                    {getNumberTwo(todayPending)}
                  </span>
                </div>
                <div className="flex flex-col border-l border-store-200 dark:border-store-700 pl-3">
                  <span className="text-[9px] text-store-400 uppercase tracking-wider">Older</span>
                  <span className="text-xs font-bold text-store-700 dark:text-store-200">
                    {getNumberTwo(olderPending)}
                  </span>
                </div>
              </div>
            )}

            <p className="text-[1.65rem] font-bold text-store-800 dark:text-store-50 leading-none mt-1.5 tracking-tight">
              {isAmount ? `${currency}${getNumberTwo(quantity)}` : quantity ?? 0}
            </p>
          </div>
        </Link>
      )}
    </div>
  );
};

export default CardItem;
