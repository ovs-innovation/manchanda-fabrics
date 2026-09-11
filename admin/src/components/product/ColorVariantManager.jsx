import React from "react";
import { Button, Input } from "@windmill/react-ui";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import Uploader from "@/components/image-uploader/Uploader";
import ColorPickerInput from "@/components/common/ColorPickerInput";

const emptyColorRow = () => ({
  colorName: "",
  colorCode: "",
  images: [],
  stock: 0,
  sku: "",
});

const ColorVariantManager = ({ colorVariants = [], setColorVariants, onStockChange }) => {
  const rows = Array.isArray(colorVariants) ? colorVariants : [];

  const updateRow = (index, field, value) => {
    const updated = rows.map((row, i) => {
      if (i !== index) return row;
      return { ...row, [field]: value };
    });
    setColorVariants(updated);
    if (field === "stock" && typeof onStockChange === "function") {
      const sum = updated.reduce((s, r) => s + Number(r.stock || 0), 0);
      onStockChange(sum);
    }
  };

  const updateColorBoth = (index, colorName, colorCode) => {
    setColorVariants(
      rows.map((row, i) => {
        if (i !== index) return row;
        return { ...row, colorName, colorCode };
      })
    );
  };

  const handleImagesChange = (index, value) => {
    setColorVariants((prev) => {
      const list = [...prev];
      let nextImages = [];
      if (typeof value === "function") {
        nextImages = value(list[index]?.images || []);
      } else {
        nextImages = Array.isArray(value) ? value : [value];
      }
      list[index] = {
        ...list[index],
        images: nextImages.filter(Boolean),
      };
      return list;
    });
  };

  const addRow = () => {
    setColorVariants([...rows, emptyColorRow()]);
  };

  const removeRow = (index) => {
    const updated = rows.filter((_, i) => i !== index);
    setColorVariants(updated);
    if (typeof onStockChange === "function") {
      const sum = updated.reduce((s, r) => s + Number(r.stock || 0), 0);
      onStockChange(sum);
    }
  };

  const totalVariantStock = rows.reduce((s, r) => s + Number(r.stock || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">
              Color Variants
            </h3>
            {rows.length > 0 && (
              <span className="text-xs bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-semibold px-2.5 py-0.5 rounded-full">
                Total Stock: {totalVariantStock} units
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Add colors with separate image collections, stock, and SKU.
          </p>
        </div>
        <Button
          type="button"
          onClick={addRow}
          className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 shrink-0"
        >
          <FiPlus /> Add Another Color
        </Button>
      </div>

      {rows.length === 0 ? (
        <div className="text-center py-6 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl text-gray-400 text-sm">
          No color variants added.
        </div>
      ) : (
        <div className="space-y-4">
          {rows.map((row, index) => (
            <div
              key={index}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-900/30 space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Color Name + Color Picker + Eyedropper + Preset Shades */}
                <div className="sm:col-span-1">
                  <label className="block text-xs font-semibold uppercase text-gray-500 mb-2">
                    Color *
                  </label>
                  <ColorPickerInput
                    colorName={row.colorName || ""}
                    colorCode={row.colorCode || ""}
                    onChange={({ colorName, colorCode }) =>
                      updateColorBoth(index, colorName, colorCode)
                    }
                    placeholder="e.g. Rani Pink, Mustard"
                    required
                  />
                </div>

                {/* Stock */}
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-500 mb-2">
                    Stock *
                  </label>
                  <Input
                    required
                    type="number"
                    min="0"
                    value={row.stock ?? 0}
                    onChange={(e) =>
                      updateRow(index, "stock", Number(e.target.value))
                    }
                  />
                </div>

                {/* SKU */}
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-500 mb-2">
                    SKU (Optional)
                  </label>
                  <Input
                    value={row.sku || ""}
                    onChange={(e) => updateRow(index, "sku", e.target.value)}
                    placeholder="e.g. SLV-RED-01"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-2">
                  Color Variant Images (Upload separate photos for this color)
                </label>
                <Uploader
                  product
                  folder="product"
                  imageUrl={row.images || []}
                  setImageUrl={(value) => handleImagesChange(index, value)}
                  useOriginalSize
                />
              </div>

              <div className="flex justify-end border-t pt-3 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => removeRow(index)}
                  className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 font-semibold"
                  title="Remove Color"
                >
                  <FiTrash2 size={16} /> Remove Color
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ColorVariantManager;
