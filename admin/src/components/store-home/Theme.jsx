import React, { useEffect, useMemo, useState } from "react";
import { FiSettings } from "react-icons/fi";
import { Button } from "@windmill/react-ui";
import spinnerLoadingImage from "@/assets/img/spinner.gif";

const swatches = [
  { token: "store", hex: "#93614E", label: "Manchanda (default)" },
  { token: "emerald", hex: "#10B981", label: "Emerald" },
  { token: "teal", hex: "#14B8A6", label: "Teal" },
  { token: "rose", hex: "#F43F5E", label: "Rose" },
  { token: "amber", hex: "#F59E0B", label: "Amber" },
  { token: "indigo", hex: "#6366F1", label: "Indigo" },
];

const Theme = ({ register, isSubmitting, defaultColor, setValue }) => {
  const initialToken = useMemo(() => defaultColor || "store", [defaultColor]);
  const [selected, setSelected] = useState(initialToken);
  const [customColor, setCustomColor] = useState(
    initialToken.startsWith("#") ? initialToken : "#93614E"
  );

  useEffect(() => {
    setSelected(initialToken);
    if (initialToken.startsWith("#")) setCustomColor(initialToken);
  }, [initialToken]);

  useEffect(() => {
    if (setValue) setValue("theme_color", selected);
  }, [selected, setValue]);

  useEffect(() => {
    register("theme_color");
  }, [register]);

  return (
    <div className="max-w-xl">
      <div className="sticky top-0 z-20 flex justify-end mb-4">
        {isSubmitting ? (
          <Button disabled type="button" className="h-10 px-6">
            <img src={spinnerLoadingImage} alt="Loading" width={20} height={10} />
            <span className="font-serif ml-2 font-light">Processing</span>
          </Button>
        ) : (
          <Button type="submit" className="h-10 px-6">Update</Button>
        )}
      </div>

      <div className="flex items-center gap-2 mb-6">
        <div className="bg-[#e6f2f3] p-2 rounded-lg">
          <FiSettings className="text-[#004f56] text-xl" />
        </div>
        <h2 className="text-xl font-bold text-[#004f56]">Theme Color</h2>
      </div>

      <div className="bg-[#f9fafb] rounded-2xl p-8 border border-gray-100 space-y-6">
        <p className="text-sm text-gray-500">
          Accent color for buttons, links and highlights across the store.
        </p>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
          {swatches.map(({ token, hex, label }) => {
            const isActive = selected === token;
            return (
              <button
                key={token}
                type="button"
                onClick={() => setSelected(token)}
                disabled={isSubmitting}
                className="flex flex-col items-center gap-2"
                title={label}
              >
                <span
                  className="h-10 w-10 rounded-full transition"
                  style={{
                    backgroundColor: hex,
                    boxShadow: isActive ? `0 0 0 3px white, 0 0 0 5px ${hex}` : "0 0 0 1px rgba(0,0,0,0.1)",
                  }}
                />
                <span className="text-[10px] text-gray-500 capitalize">{token}</span>
              </button>
            );
          })}
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Custom hex color</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={customColor}
              onChange={(e) => {
                setCustomColor(e.target.value);
                setSelected(e.target.value);
              }}
              className="h-10 w-14 rounded cursor-pointer border border-gray-200"
              disabled={isSubmitting}
            />
            <span className="text-sm text-gray-600 font-mono">{customColor}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Theme;
