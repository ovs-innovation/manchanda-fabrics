import React from "react";
import { Button, Input } from "@windmill/react-ui";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import Uploader from "@/components/image-uploader/Uploader";

const emptyColorRow = () => ({
  colorName: "",
  colorCode: "",
  images: [],
  stock: 0,
  sku: "",
});

const ColorVariantManager = ({ colorVariants = [], setColorVariants }) => {
  const rows = Array.isArray(colorVariants) ? colorVariants : [];

  const updateRow = (index, field, value) => {
    setColorVariants(
      rows.map((row, i) => {
        if (i !== index) return row;
        const updated = { ...row, [field]: value };
        // Keep colorCode in sync with colorName so frontend swatches work
        if (field === "colorName") {
          updated.colorCode = value;
        }
        return updated;
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
    setColorVariants(rows.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start gap-4">
        <div>
          <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">
            Color Variants
          </h3>
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
                {/* Color Name + live preview swatch */}
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-500 mb-2">
                    Color Name *
                  </label>
                  <div className="flex items-center gap-2">
                    {/* Live color swatch derived from the typed name */}
                    <div
                      title={row.colorName || "Color preview"}
                      style={{
                        backgroundColor: row.colorName || "transparent",
                        border: "2px solid rgba(128,128,128,0.3)",
                      }}
                      className="w-10 h-10 rounded-lg shrink-0 transition-colors duration-300"
                    />
                    <Input
                      required
                      value={row.colorName || ""}
                      onChange={(e) =>
                        updateRow(index, "colorName", e.target.value)
                      }
                      placeholder="e.g. Red, Sky Blue"
                    />
                  </div>
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
