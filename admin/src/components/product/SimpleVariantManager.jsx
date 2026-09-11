import React from "react";
import { Button, Input } from "@windmill/react-ui";
import { FiPlus, FiTrash2 } from "react-icons/fi";

import Uploader from "@/components/image-uploader/Uploader";
import ColorPickerInput from "@/components/common/ColorPickerInput";

const emptyRow = () => ({
  color: "",
  size: "Free Size",
  stock: 0,
  image: "",
});

const SimpleVariantManager = ({ variants = [], setVariants }) => {
  const rows = variants.length ? variants : [];

  const updateRow = (index, field, value) => {
    setVariants(
      rows.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  };

  const addRow = () => {
    setVariants([...rows, emptyRow()]);
  };

  const removeRow = (index) => {
    setVariants(rows.filter((_, i) => i !== index));
  };

  const totalStock = rows.reduce((sum, row) => sum + Number(row.stock || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start gap-4">
        <div>
          <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">
            Options (optional)
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Add color, size, stock — and upload a photo for each color if needed.
          </p>
        </div>
        <Button
          type="button"
          onClick={addRow}
          className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 shrink-0"
        >
          <FiPlus /> Add option
        </Button>
      </div>

      {rows.length === 0 ? (
        <div className="text-center py-6 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl text-gray-400 text-sm">
          No options added. Most products only need the main stock field above.
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((row, index) => (
            <div
              key={index}
              className="flex flex-col sm:flex-row gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-900/30"
            >
              <div className="w-full sm:w-28 shrink-0">
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-2">
                  Color photo
                </label>
                <Uploader
                  product={false}
                  folder="product"
                  imageUrl={row.image || ""}
                  setImageUrl={(url) =>
                    updateRow(
                      index,
                      "image",
                      Array.isArray(url) ? url[0] || "" : url || ""
                    )
                  }
                  useOriginalSize
                />
              </div>

              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-500 mb-2">
                    Color
                  </label>
                  <ColorPickerInput
                    colorName={row.color || ""}
                    colorCode={row.colorCode || ""}
                    onChange={({ colorName, colorCode }) => {
                      setVariants(
                        rows.map((r, i) =>
                          i === index ? { ...r, color: colorName, colorCode: colorCode } : r
                        )
                      );
                    }}
                    placeholder="e.g. Rani Pink, Mustard"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-500 mb-2">
                    Size
                  </label>
                  <Input
                    value={row.size || ""}
                    onChange={(e) => updateRow(index, "size", e.target.value)}
                    placeholder="Free Size, M..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-500 mb-2">
                    Stock
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={row.stock ?? 0}
                    onChange={(e) => updateRow(index, "stock", Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="flex sm:items-end justify-end">
                <button
                  type="button"
                  onClick={() => removeRow(index)}
                  className="p-2 text-red-500 hover:text-red-700"
                  title="Remove option"
                >
                  <FiTrash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {rows.length > 0 && (
        <p className="text-xs text-gray-500">
          Total from options: <span className="font-semibold text-emerald-600">{totalStock}</span> units
        </p>
      )}
    </div>
  );
};

export default SimpleVariantManager;
