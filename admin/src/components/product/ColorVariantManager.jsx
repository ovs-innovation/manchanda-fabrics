import React, { useState, useRef, useCallback } from "react";
import { Button, Input } from "@windmill/react-ui";
import {
  FiPlus,
  FiTrash2,
  FiUploadCloud,
  FiCamera,
  FiCheck,
  FiLayers,
  FiInfo,
  FiX,
  FiRefreshCw,
} from "react-icons/fi";
import ColorPickerInput from "@/components/common/ColorPickerInput";
import { uploadImageFile, guessColorFromFilename } from "@/utils/imageUpload";
import { resolveCloudinaryUrl } from "@/utils/cloudinaryUrl";

const QUICK_COLORS = [
  { name: "Rani Pink", hex: "#E3007E" },
  { name: "Bridal Red", hex: "#C41E3A" },
  { name: "Bottle Green", hex: "#004B23" },
  { name: "Mustard Yellow", hex: "#E1AD01" },
  { name: "Royal Blue", hex: "#4169E1" },
  { name: "Maroon", hex: "#800000" },
  { name: "Deep Wine", hex: "#722F37" },
  { name: "Pista Green", hex: "#93C572" },
  { name: "Rust Orange", hex: "#C85A17" },
  { name: "Peach", hex: "#FFE5B4" },
  { name: "Jet Black", hex: "#0A0A0A" },
  { name: "Pure White", hex: "#FFFFFF" },
];

const emptyColorRow = (image = null, color = null) => ({
  colorName: color?.colorName || "",
  colorCode: color?.colorCode || "",
  images: image ? [image] : [],
  stock: 5,
  sku: "",
});

const ColorVariantManager = ({
  colorVariants = [],
  setColorVariants,
  onStockChange,
  availableImages = [],
}) => {
  const rows = Array.isArray(colorVariants) ? colorVariants : [];
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStats, setUploadStats] = useState({ current: 0, total: 0, fileName: "" });
  const [bulkStockVal, setBulkStockVal] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [activeAngleUploadIndex, setActiveAngleUploadIndex] = useState(null);

  const bulkFileInputRef = useRef(null);
  const angleFileInputRef = useRef(null);

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

  const addRow = () => {
    const updated = [...rows, emptyColorRow()];
    setColorVariants(updated);
    if (typeof onStockChange === "function") {
      const sum = updated.reduce((s, r) => s + Number(r.stock || 0), 0);
      onStockChange(sum);
    }
  };

  const removeRow = (index) => {
    const updated = rows.filter((_, i) => i !== index);
    setColorVariants(updated);
    if (typeof onStockChange === "function") {
      const sum = updated.reduce((s, r) => s + Number(r.stock || 0), 0);
      onStockChange(sum);
    }
  };

  const applyStockToAll = () => {
    const num = Number(bulkStockVal);
    if (isNaN(num) || num < 0) return;
    const updated = rows.map((r) => ({ ...r, stock: num }));
    setColorVariants(updated);
    if (typeof onStockChange === "function") {
      onStockChange(updated.length * num);
    }
  };

  // Bulk Upload Handler: User drops/selects all color suit photos together
  const handleBulkUploadFiles = async (filesList) => {
    const fileArray = Array.from(filesList).filter((f) => f.type.startsWith("image/"));
    if (fileArray.length === 0) return;

    setIsUploading(true);
    setUploadStats({ current: 0, total: fileArray.length, fileName: "" });

    const newRows = [];

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      setUploadStats({
        current: i + 1,
        total: fileArray.length,
        fileName: file.name,
      });

      try {
        const uploadedUrl = await uploadImageFile(file, "product");
        if (uploadedUrl) {
          const guessed = guessColorFromFilename(file.name);
          newRows.push(emptyColorRow(uploadedUrl, guessed));
        }
      } catch (err) {
        console.error("Failed to upload image in bulk:", file.name, err);
      }
    }

    if (newRows.length > 0) {
      const merged = [...rows, ...newRows];
      setColorVariants(merged);
      if (typeof onStockChange === "function") {
        const sum = merged.reduce((s, r) => s + Number(r.stock || 0), 0);
        onStockChange(sum);
      }
    }

    setIsUploading(false);
    setUploadStats({ current: 0, total: 0, fileName: "" });
    if (bulkFileInputRef.current) {
      bulkFileInputRef.current.value = "";
    }
  };

  // Add extra angle photo to a specific color variant
  const handleAddAnglePhoto = async (index, filesList) => {
    const file = filesList?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    try {
      setIsUploading(true);
      const url = await uploadImageFile(file, "product");
      if (url) {
        const updated = rows.map((row, i) => {
          if (i !== index) return row;
          return { ...row, images: [...(row.images || []), url] };
        });
        setColorVariants(updated);
      }
    } catch (err) {
      console.error("Failed to upload angle photo:", err);
    } finally {
      setIsUploading(false);
      setActiveAngleUploadIndex(null);
      if (angleFileInputRef.current) angleFileInputRef.current.value = "";
    }
  };

  // Remove individual photo from a color variant
  const handleRemovePhotoFromVariant = (variantIndex, photoIndex) => {
    const updated = rows.map((row, i) => {
      if (i !== variantIndex) return row;
      const nextImgs = (row.images || []).filter((_, pIdx) => pIdx !== photoIndex);
      return { ...row, images: nextImgs };
    });
    setColorVariants(updated);
  };

  // Turn an already uploaded product image into a color variant card
  const handleSelectExistingImage = (imageUrl) => {
    if (!imageUrl) return;
    const exists = rows.some((r) => r.images?.includes(imageUrl));
    if (exists) return;
    const updated = [...rows, emptyColorRow(imageUrl)];
    setColorVariants(updated);
    if (typeof onStockChange === "function") {
      const sum = updated.reduce((s, r) => s + Number(r.stock || 0), 0);
      onStockChange(sum);
    }
  };

  const totalVariantStock = rows.reduce((s, r) => s + Number(r.stock || 0), 0);

  // Filter available images that haven't been assigned yet
  const unassignedExistingImages = (availableImages || []).filter(
    (img) => typeof img === "string" && img.trim() && !rows.some((r) => r.images?.includes(img))
  );

  return (
    <div className="space-y-5">
      {/* Hidden file inputs */}
      <input
        ref={bulkFileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/jpg"
        className="hidden"
        onChange={(e) => handleBulkUploadFiles(e.target.files)}
      />
      <input
        ref={angleFileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        className="hidden"
        onChange={(e) => {
          if (activeAngleUploadIndex !== null) {
            handleAddAnglePhoto(activeAngleUploadIndex, e.target.files);
          }
        }}
      />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-emerald-50/60 to-teal-50/40 dark:from-gray-800/80 dark:to-gray-800/40 p-4 rounded-2xl border border-emerald-100/70 dark:border-gray-700">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-base font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <FiLayers className="text-emerald-600" /> Color Variations & Suits
            </h3>
            {rows.length > 0 && (
              <span className="text-xs bg-emerald-600 text-white font-semibold px-2.5 py-0.5 rounded-full shadow-sm">
                {rows.length} {rows.length === 1 ? "Color" : "Colors"} · {totalVariantStock} Units
              </span>
            )}
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Bulk upload photos of all colors at once, then assign color names and stock below.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {rows.length > 1 && (
            <div className="flex items-center gap-1.5 bg-white dark:bg-gray-800 px-2.5 py-1 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm text-xs">
              <span className="text-gray-500 font-medium">Set all stock:</span>
              <input
                type="number"
                min="0"
                placeholder="5"
                value={bulkStockVal}
                onChange={(e) => setBulkStockVal(e.target.value)}
                className="w-14 px-1.5 py-0.5 text-xs rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-center"
              />
              <button
                type="button"
                onClick={applyStockToAll}
                className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium transition-colors"
              >
                Apply
              </button>
            </div>
          )}

          <Button
            type="button"
            onClick={addRow}
            className="bg-white dark:bg-gray-800 hover:bg-gray-50 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 text-xs py-2 px-3 rounded-xl flex items-center gap-1.5 shadow-sm font-semibold"
          >
            <FiPlus size={14} /> Add Empty Row
          </Button>
        </div>
      </div>

      {/* Hero: Bulk Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files) {
            handleBulkUploadFiles(e.dataTransfer.files);
          }
        }}
        onClick={() => !isUploading && bulkFileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? "border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/20 scale-[1.01]"
            : "border-emerald-300/80 hover:border-emerald-500 bg-emerald-50/30 hover:bg-emerald-50/60 dark:bg-gray-800/40 dark:border-emerald-700/50"
        }`}
      >
        {isUploading ? (
          <div className="py-4 space-y-3">
            <div className="inline-flex p-3 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 animate-spin">
              <FiRefreshCw size={24} />
            </div>
            <p className="text-sm font-bold text-gray-800 dark:text-gray-100">
              Uploading photo {uploadStats.current} of {uploadStats.total}...
            </p>
            {uploadStats.fileName && (
              <p className="text-xs text-gray-500 font-mono truncate max-w-sm mx-auto">
                {uploadStats.fileName}
              </p>
            )}
            <div className="w-64 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto overflow-hidden">
              <div
                className="h-full bg-emerald-600 transition-all duration-300"
                style={{
                  width: `${(uploadStats.current / (uploadStats.total || 1)) * 100}%`,
                }}
              />
            </div>
          </div>
        ) : (
          <div className="py-2 space-y-2">
            <div className="inline-flex p-3 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 mb-1">
              <FiUploadCloud size={28} />
            </div>
            <h4 className="text-sm font-bold text-gray-800 dark:text-gray-100">
              Drag & Drop All Color Suit Photos Here (Bulk Upload)
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              Select multiple photos at once (e.g. Red suit, Blue suit, Green suit). A color variant card will be created for each photo automatically!
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition-colors">
                <FiCamera size={14} /> Select All Color Photos at Once
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Bonus Helper: Pick from already uploaded product photos */}
      {unassignedExistingImages.length > 0 && (
        <div className="p-3 bg-amber-50/60 dark:bg-amber-950/20 rounded-xl border border-amber-200/70 dark:border-amber-800/40 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-800 dark:text-amber-300">
            <FiInfo size={14} /> Or click any already-uploaded product photo to turn it into a color variant:
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {unassignedExistingImages.map((imgUrl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectExistingImage(imgUrl)}
                className="group relative w-14 h-14 rounded-lg overflow-hidden border-2 border-amber-300 hover:border-emerald-500 shadow-sm transition-all"
                title="Click to add as color variant"
              >
                <img
                  src={resolveCloudinaryUrl(imgUrl) || imgUrl}
                  alt="Product Photo"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                  <FiPlus size={16} />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Cards List: Each suit photo has its own card to assign Color, Stock & SKU */}
      {rows.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl text-gray-400 text-sm">
          No color variants added yet. Drop your suit photos above to get started!
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Assign Color & Stock to Each Suit ({rows.length} {rows.length === 1 ? "Suit" : "Suits"}):
          </div>

          {rows.map((row, index) => {
            const mainImg = row.images?.[0] || null;
            const extraImgs = (row.images || []).slice(1);

            return (
              <div
                key={index}
                className="p-4 sm:p-5 border border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                  {/* Left Column: Suit Photo Preview & Additional Angles */}
                  <div className="md:col-span-4 lg:col-span-3 space-y-2.5">
                    <div className="relative group w-full aspect-square max-w-[150px] mx-auto md:mx-0 rounded-2xl overflow-hidden border-2 border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 shadow-inner flex items-center justify-center">
                      {mainImg ? (
                        <>
                          <img
                            src={resolveCloudinaryUrl(mainImg) || mainImg}
                            alt={row.colorName || "Suit Color"}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1.5 transition-opacity text-white p-2">
                            <button
                              type="button"
                              onClick={() => {
                                setActiveAngleUploadIndex(index);
                                angleFileInputRef.current?.click();
                              }}
                              className="px-2.5 py-1 text-[11px] bg-white/90 hover:bg-white text-gray-800 rounded-lg font-semibold shadow"
                            >
                              + Add Angle
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemovePhotoFromVariant(index, 0)}
                              className="text-[11px] text-red-200 hover:text-red-400 underline font-medium"
                            >
                              Remove photo
                            </button>
                          </div>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveAngleUploadIndex(index);
                            angleFileInputRef.current?.click();
                          }}
                          className="flex flex-col items-center justify-center text-gray-400 hover:text-emerald-600 p-4 transition-colors"
                        >
                          <FiCamera size={26} className="mb-1" />
                          <span className="text-[11px] font-semibold text-center leading-tight">
                            Click to upload suit photo
                          </span>
                        </button>
                      )}

                      {/* Small badge if assigned color */}
                      {row.colorCode && (
                        <div
                          className="absolute top-2 left-2 w-5 h-5 rounded-full border-2 border-white shadow-md"
                          style={{ backgroundColor: row.colorCode }}
                          title={row.colorName || row.colorCode}
                        />
                      )}
                    </div>

                    {/* Extra angle thumbnails */}
                    {extraImgs.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {extraImgs.map((img, extraIdx) => (
                          <div
                            key={extraIdx}
                            className="relative group w-9 h-9 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700"
                          >
                            <img
                              src={resolveCloudinaryUrl(img) || img}
                              alt="Extra angle"
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemovePhotoFromVariant(index, extraIdx + 1)}
                              className="absolute inset-0 bg-red-600/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                            >
                              <FiX size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Middle Column: Color Assignment + Quick Chips */}
                  <div className="md:col-span-8 lg:col-span-9 space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                      {/* Color Picker with Autocomplete, Eyedropper & Palette */}
                      <div className="sm:col-span-6 lg:col-span-6">
                        <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-300 mb-1.5">
                          Color Name & Swatch *
                        </label>
                        <ColorPickerInput
                          colorName={row.colorName || ""}
                          colorCode={row.colorCode || ""}
                          onChange={({ colorName, colorCode }) =>
                            updateColorBoth(index, colorName, colorCode)
                          }
                          placeholder="e.g. Rani Pink, Bottle Green"
                          required
                        />
                      </div>

                      {/* Stock Quantity */}
                      <div className="sm:col-span-3 lg:col-span-3">
                        <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-300 mb-1.5">
                          Stock (Units) *
                        </label>
                        <Input
                          required
                          type="number"
                          min="0"
                          value={row.stock ?? 0}
                          onChange={(e) =>
                            updateRow(index, "stock", Number(e.target.value))
                          }
                          className="font-semibold text-gray-800 dark:text-gray-100"
                        />
                      </div>

                      {/* SKU (Optional) */}
                      <div className="sm:col-span-3 lg:col-span-3">
                        <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-300 mb-1.5">
                          SKU (Optional)
                        </label>
                        <Input
                          value={row.sku || ""}
                          onChange={(e) => updateRow(index, "sku", e.target.value)}
                          placeholder="e.g. MAN-RED-01"
                          className="text-xs"
                        />
                      </div>
                    </div>

                    {/* Quick 1-Click Color Buttons */}
                    <div>
                      <div className="text-[11px] font-semibold text-gray-400 mb-1.5">
                        Quick 1-Click Colors:
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {QUICK_COLORS.map((qc) => {
                          const isSelected =
                            row.colorName?.toLowerCase() === qc.name.toLowerCase();
                          return (
                            <button
                              key={qc.name}
                              type="button"
                              onClick={() => updateColorBoth(index, qc.name, qc.hex)}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                                isSelected
                                  ? "border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 shadow-sm scale-105 font-bold"
                                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 bg-gray-50 dark:bg-gray-900/50 text-gray-600 dark:text-gray-300 hover:bg-gray-100"
                              }`}
                            >
                              <span
                                className="w-2.5 h-2.5 rounded-full border border-black/10 shrink-0"
                                style={{ backgroundColor: qc.hex }}
                              />
                              <span>{qc.name}</span>
                              {isSelected && <FiCheck size={12} className="text-emerald-600" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Card Footer: Remove Button */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700/60">
                      <div className="text-[11px] text-gray-400">
                        {row.images?.length || 0} photo{row.images?.length === 1 ? "" : "s"} attached to this color
                      </div>
                      <button
                        type="button"
                        onClick={() => removeRow(index)}
                        className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-semibold transition-colors py-1 px-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30"
                        title="Remove this color variant"
                      >
                        <FiTrash2 size={13} /> Remove Suit
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ColorVariantManager;
