import React from "react";

import {
  HOMEPAGE_PLACEMENTS,
  sanitizeHomepagePlacementTags,
} from "@/lib/homepage-placements";

const ProductPlacementFlags = ({ tag = [], setTag }) => {
  const activeTags = sanitizeHomepagePlacementTags(tag);

  const toggle = (flagId) => {
    setTag((prev) => {
      const current = sanitizeHomepagePlacementTags(prev);
      return current.includes(flagId)
        ? current.filter((t) => t !== flagId)
        : [...current, flagId];
    });
  };

  return (
    <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
      <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-1">
        Homepage Placement
      </h3>
      <p className="text-xs text-gray-500 mb-4">
        Show this product in homepage sections. You can also pick products from Website Content → Home Products.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {HOMEPAGE_PLACEMENTS.map(({ id, label, description }) => {
          const active = activeTags.includes(id);
          return (
            <button
              key={id}
              type="button"
              onClick={() => toggle(id)}
              className={`flex items-start gap-3 px-4 py-3 rounded-xl border text-left transition-colors ${
                active
                  ? "bg-emerald-50 border-emerald-300 text-gray-900 dark:bg-emerald-900/20 dark:border-emerald-700 dark:text-white"
                  : "bg-gray-50 dark:bg-gray-900/40 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-emerald-200"
              }`}
            >
              <span
                className={`mt-0.5 w-4 h-4 rounded border flex-shrink-0 ${
                  active ? "bg-emerald-600 border-emerald-600" : "border-gray-300 dark:border-gray-600"
                }`}
              />
              <span>
                <span className="block text-sm font-semibold">{label}</span>
                <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {description}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ProductPlacementFlags;
