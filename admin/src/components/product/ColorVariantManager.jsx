import React, { useState, useRef } from "react";
import { Input } from "@windmill/react-ui";
import {
  FiTrash2,
  FiUploadCloud,
  FiCamera,
  FiLayers,
  FiX,
  FiRefreshCw,
  FiStar,
  FiFilm,
} from "react-icons/fi";
import ColorPickerInput from "@/components/common/ColorPickerInput";
import VideoUploader from "@/components/image-uploader/VideoUploader";
import {
  uploadImageFile,
  guessColorFromFilename,
  extractDominantColorFromFile,
  extractDominantColorFromUrl,
} from "@/utils/imageUpload";
import { resolveCloudinaryUrl } from "@/utils/cloudinaryUrl";
import { resolveHex } from "@/utils/fabricColors";
import { notifySuccess } from "@/utils/toast";

const ColorVariantManager = ({
  colorVariants = [],
  setColorVariants,
  featuredImage = "",
  setFeaturedImage,
  defaultColorName = "",
  setDefaultColor,
  onStockChange,
  video = "",
  setVideo,
  imageUrl = [],
  setImageUrl,
}) => {
  const rows = Array.isArray(colorVariants) ? colorVariants : [];
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStats, setUploadStats] = useState({ current: 0, total: 0, fileName: "" });
  const [isDragging, setIsDragging] = useState(false);
  const [activeAngleUploadIndex, setActiveAngleUploadIndex] = useState(null);
  const [replacePhotoIndex, setReplacePhotoIndex] = useState(null);

  const bulkFileInputRef = useRef(null);
  const angleFileInputRef = useRef(null);
  const replaceFileInputRef = useRef(null);

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
    const hex = colorCode || resolveHex("", colorName) || "#004B23";
    const updated = rows.map((row, i) => {
      if (i !== index) return row;
      return { ...row, colorName, colorCode: hex };
    });
    setColorVariants(updated);

    // If this row is the main suit, sync default color as well
    const row = rows[index];
    const isMain =
      (featuredImage && row.images?.[0] === featuredImage) ||
      (!featuredImage && index === 0);

    if (isMain && typeof setDefaultColor === "function") {
      setDefaultColor({ colorName, colorCode: hex });
    }
  };

  // Set a specific suit as the Main Photo and Default Color
  const handleSetMainSuit = (index) => {
    const targetRow = rows[index];
    if (!targetRow) return;

    const mainImg = targetRow.images?.[0];
    if (mainImg && typeof setFeaturedImage === "function") {
      setFeaturedImage(mainImg);
    }

    if (typeof setDefaultColor === "function" && targetRow.colorName) {
      setDefaultColor({
        colorName: targetRow.colorName,
        colorCode: targetRow.colorCode || resolveHex("", targetRow.colorName) || "#004B23",
      });
    }

    notifySuccess(`Set "${targetRow.colorName || "Suit"}" as Main Photo & Default Color!`);
  };

  const removeRow = (index) => {
    const removedRow = rows[index];
    const updated = rows.filter((_, i) => i !== index);
    setColorVariants(updated);

    // If all rows removed, clear featuredImage and defaultColor
    if (updated.length === 0) {
      if (typeof setFeaturedImage === "function") setFeaturedImage("");
      if (typeof setDefaultColor === "function") setDefaultColor({ colorName: "", colorCode: "" });
    } else if (removedRow?.images?.[0] === featuredImage || !featuredImage) {
      const nextMain = updated.find((r) => r.images?.[0]) || updated[0];
      if (nextMain?.images?.[0] && typeof setFeaturedImage === "function") {
        setFeaturedImage(nextMain.images[0]);
      } else if (typeof setFeaturedImage === "function") {
        setFeaturedImage("");
      }
      if (typeof setDefaultColor === "function" && nextMain?.colorName) {
        setDefaultColor({
          colorName: nextMain.colorName,
          colorCode: nextMain.colorCode || "",
        });
      }
    }

    if (typeof onStockChange === "function") {
      const sum = updated.reduce((s, r) => s + Number(r.stock || 0), 0);
      onStockChange(sum);
    }
  };

  // Bulk Upload Handler: Auto-detects color immediately and uploads in background
  const handleBulkUploadFiles = async (filesList) => {
    const fileArray = Array.from(filesList || []).filter(
      (f) => f.type.startsWith("image/") || /\.(jpe?g|png|webp|jfif|avif|gif)$/i.test(f.name)
    );
    if (fileArray.length === 0) return;

    // 1. INSTANT LOCAL CARDS: Read local previews and detect dominant colors right away!
    // 1. INSTANT LOCAL CARDS: Read local previews and detect dominant colors right away!
    const initialNewRows = await Promise.all(
      fileArray.map(async (file) => {
        const localUrl = URL.createObjectURL(file);
        let detected = guessColorFromFilename(file.name);
        if (!detected?.colorName) {
          try {
            detected = await extractDominantColorFromFile(file);
          } catch (e) {
            console.warn("Color detection notice:", e);
          }
        }

        const colorName = detected?.colorName || "Suit Color";
        const colorCode = detected?.colorCode || resolveHex("", colorName) || "#C41E3A";

        return {
          colorName,
          colorCode,
          images: [localUrl],
          stock: 5,
          sku: "",
          _localId: Math.random().toString(36).substring(7),
          _localUrl: localUrl,
          _file: file,
          _isUploading: true,
        };
      })
    );

    // Immediately put suit cards on screen!
    const mergedWithLocal = [...rows, ...initialNewRows];
    setColorVariants(mergedWithLocal);

    // If no featured image yet, set first photo as main photo immediately
    if (!featuredImage && initialNewRows[0]?.images?.[0]) {
      setFeaturedImage(initialNewRows[0].images[0]);
      if (initialNewRows[0].colorName && typeof setDefaultColor === "function") {
        setDefaultColor({
          colorName: initialNewRows[0].colorName,
          colorCode: initialNewRows[0].colorCode,
        });
      }
    }

    if (typeof onStockChange === "function") {
      const sum = mergedWithLocal.reduce((s, r) => s + Number(r.stock || 0), 0);
      onStockChange(sum);
    }

    setIsUploading(true);
    setUploadStats({ current: 0, total: fileArray.length, fileName: "" });

    // 2. BACKGROUND UPLOAD TO CLOUDINARY
    await Promise.all(
      initialNewRows.map(async (rowItem) => {
        const file = rowItem._file;
        setUploadStats((prev) => ({
          ...prev,
          current: prev.current + 1,
          fileName: file.name,
        }));

        try {
          const uploadedUrl = await uploadImageFile(file, "product");

          if (uploadedUrl) {
            let remoteColor = null;
            if (!rowItem.colorName || rowItem.colorName === "Suit Color") {
              try {
                remoteColor = await extractDominantColorFromUrl(uploadedUrl);
              } catch (e) {
                console.warn("Remote color extraction notice:", e);
              }
            }

            setColorVariants((prev) =>
              prev.map((r) => {
                if (r._localId === rowItem._localId) {
                  const updatedName =
                    r.colorName && r.colorName !== "Suit Color"
                      ? r.colorName
                      : remoteColor?.colorName || r.colorName || "Suit Color";
                  const updatedCode =
                    r.colorCode && r.colorCode !== "#C41E3A"
                      ? r.colorCode
                      : remoteColor?.colorCode || resolveHex("", updatedName) || "#C41E3A";

                  return {
                    ...r,
                    images: [
                      uploadedUrl,
                      ...(r.images || []).slice(1).filter((img) => img !== rowItem._localUrl),
                    ],
                    colorName: updatedName,
                    colorCode: updatedCode,
                    _isUploading: false,
                  };
                }
                return r;
              })
            );

            setFeaturedImage((prevFeatured) => {
              if (prevFeatured === rowItem._localUrl || !prevFeatured) {
                return uploadedUrl;
              }
              return prevFeatured;
            });
          } else {
            setColorVariants((prev) =>
              prev.map((r) => (r._localId === rowItem._localId ? { ...r, _isUploading: false } : r))
            );
          }
        } catch (err) {
          console.error("Upload notice for file:", file.name, err);
          setColorVariants((prev) =>
            prev.map((r) => (r._localId === rowItem._localId ? { ...r, _isUploading: false } : r))
          );
        }
      })
    );

    setIsUploading(false);
    setUploadStats({ current: 0, total: 0, fileName: "" });
    if (bulkFileInputRef.current) bulkFileInputRef.current.value = "";
    notifySuccess(`Added ${fileArray.length} suit photo${fileArray.length > 1 ? "s" : ""}!`);
  };

  // Add extra angle photo(s) to a specific color variant
  const handleAddAnglePhoto = async (index, filesList) => {
    const files = Array.from(filesList || []).filter(
      (f) => f && f.type && f.type.startsWith("image/")
    );
    if (files.length === 0) return;

    // Create local preview URLs for instant UI responsiveness
    const localEntries = files.map((file) => ({
      file,
      localUrl: URL.createObjectURL(file),
    }));

    // Optimistically append local URLs to variant images
    setColorVariants((prev) =>
      prev.map((row, i) => {
        if (i !== index) return row;
        return {
          ...row,
          images: [...(row.images || []), ...localEntries.map((e) => e.localUrl)],
        };
      })
    );

    try {
      setIsUploading(true);
      // Upload all angle photos
      const uploadResults = await Promise.all(
        localEntries.map(async ({ file, localUrl }) => {
          const url = await uploadImageFile(file, "product");
          return { localUrl, url };
        })
      );

      setColorVariants((prev) =>
        prev.map((row, i) => {
          if (i !== index) return row;
          let currentImgs = [...(row.images || [])];
          uploadResults.forEach(({ localUrl, url }) => {
            if (url) {
              currentImgs = currentImgs.map((img) => (img === localUrl ? url : img));
            } else {
              currentImgs = currentImgs.filter((img) => img !== localUrl);
            }
          });
          return { ...row, images: currentImgs };
        })
      );
      notifySuccess(`Added ${files.length} angle photo${files.length > 1 ? "s" : ""}!`);
    } catch (err) {
      console.error("Failed to upload angle photos:", err);
    } finally {
      setIsUploading(false);
      setActiveAngleUploadIndex(null);
      if (angleFileInputRef.current) angleFileInputRef.current.value = "";
    }
  };

  // Replace primary photo of a specific color variant
  const handleReplacePhoto = async (index, filesList) => {
    const file = filesList?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    const localUrl = URL.createObjectURL(file);
    setColorVariants((prev) =>
      prev.map((row, i) => {
        if (i !== index) return row;
        const restImgs = (row.images || []).slice(1);
        return { ...row, images: [localUrl, ...restImgs], _localUrl: localUrl, _file: file, _isUploading: true };
      })
    );

    try {
      setIsUploading(true);
      const url = await uploadImageFile(file, "product");
      if (url) {
        setColorVariants((prev) =>
          prev.map((row, i) => {
            if (i !== index) return row;
            const restImgs = (row.images || []).slice(1).filter((img) => img !== localUrl);
            return { ...row, images: [url, ...restImgs], _isUploading: false };
          })
        );
        const targetRow = rows[index];
        const isMain =
          (featuredImage && targetRow?.images?.[0] === featuredImage) ||
          (!featuredImage && index === 0);
        if (isMain && typeof setFeaturedImage === "function") {
          setFeaturedImage(url);
        }
        notifySuccess("Suit photo updated!");
      }
    } catch (err) {
      console.error("Failed to replace suit photo:", err);
      setColorVariants((prev) =>
        prev.map((row, i) => (i === index ? { ...row, _isUploading: false } : row))
      );
    } finally {
      setIsUploading(false);
      setReplacePhotoIndex(null);
      if (replaceFileInputRef.current) replaceFileInputRef.current.value = "";
    }
  };

  // Remove individual photo from a color variant
  const handleRemovePhotoFromVariant = (variantIndex, photoIndex) => {
    const targetRow = rows[variantIndex];
    const removedPhoto = targetRow?.images?.[photoIndex];
    const updated = rows.map((row, i) => {
      if (i !== variantIndex) return row;
      const nextImgs = (row.images || []).filter((_, pIdx) => pIdx !== photoIndex);
      return { ...row, images: nextImgs };
    });
    setColorVariants(updated);

    const allRemaining = updated.flatMap((r) => r.images || []).filter(Boolean);
    if (allRemaining.length === 0) {
      if (typeof setFeaturedImage === "function") setFeaturedImage("");
    } else if (removedPhoto === featuredImage) {
      if (typeof setFeaturedImage === "function") setFeaturedImage(allRemaining[0]);
    }
  };

  const totalVariantStock = rows.reduce((s, r) => s + Number(r.stock || 0), 0);

  return (
    <div className="space-y-6">
      {/* Hidden file inputs */}
      <input
        ref={bulkFileInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={(e) => handleBulkUploadFiles(e.target.files)}
      />
      <input
        ref={angleFileInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (activeAngleUploadIndex !== null) {
            handleAddAnglePhoto(activeAngleUploadIndex, e.target.files);
          }
        }}
      />
      <input
        ref={replaceFileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (replacePhotoIndex !== null) {
            handleReplacePhoto(replacePhotoIndex, e.target.files);
          }
        }}
      />

      {/* Clean Minimal Section Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <h3 className="text-base font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <FiLayers className="text-emerald-600" /> Suit Photos & Colors
          </h3>
          {rows.length > 0 && (
            <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800 font-semibold px-2.5 py-0.5 rounded-full">
              {rows.length} {rows.length === 1 ? "Suit" : "Suits"} Added · {totalVariantStock} Total Units
            </span>
          )}
        </div>
      </div>

      {/* SINGLE UNIFIED DRAG & DROP BULK UPLOAD ZONE */}
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
        onClick={() => bulkFileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-7 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? "border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/20 scale-[1.01]"
            : "border-emerald-300/80 hover:border-emerald-500 bg-emerald-50/30 hover:bg-emerald-50/60 dark:bg-gray-800/40 dark:border-emerald-700/50"
        }`}
      >
        <div className="py-2 space-y-2">
          <div className="inline-flex p-3 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 mb-1">
            <FiUploadCloud size={30} />
          </div>
          <h4 className="text-sm font-bold text-gray-800 dark:text-gray-100">
            Click or Drag & Drop All Suit Photos at Once
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
            Select all suit photos together (e.g. Green suit, Red suit, Yellow suit). Cards appear below automatically!
          </p>
          <div className="pt-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-colors">
              <FiCamera size={14} /> Select All Suit Photos
            </span>
          </div>
        </div>

        {/* Upload progress indicator */}
        {isUploading && (
          <div className="mt-4 pt-3 border-t border-emerald-200/50 text-xs text-emerald-700 dark:text-emerald-300 flex items-center justify-center gap-2">
            <FiRefreshCw size={14} className="animate-spin text-emerald-600" />
            <span>Securing {uploadStats.current} of {uploadStats.total} images to cloud...</span>
          </div>
        )}
      </div>

      {/* SUIT CARDS LIST (APPEARS DIRECTLY BELOW UPLOAD BOX) */}
      {rows.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
            <span>Uploaded Suits ({rows.length} {rows.length === 1 ? "Suit" : "Suits"}):</span>
            <span className="text-[11px] font-normal lowercase text-gray-400">
              Click "Set as Main" on whichever suit is your primary storefront photo
            </span>
          </div>

          {rows.map((row, index) => {
            const mainImg = row.images?.[0] || null;
            const extraImgs = (row.images || []).slice(1);

            // Determine if this card is currently the Main Photo / Default Color
            const isMain =
              (featuredImage && mainImg && (mainImg === featuredImage || row._localUrl === featuredImage)) ||
              (!featuredImage && index === 0);

            return (
              <div
                key={row._localId || index}
                className={`p-4 sm:p-5 border-2 rounded-2xl bg-white dark:bg-gray-800 transition-all duration-200 ${
                  isMain
                    ? "border-emerald-500 ring-2 ring-emerald-500/20 shadow-md"
                    : "border-gray-200 dark:border-gray-700 shadow-xs hover:border-gray-300"
                }`}
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                  {/* Left Column: Suit Photo Preview & Main Badge */}
                  <div className="md:col-span-4 lg:col-span-3 space-y-2">
                    <div className="relative group w-full aspect-square max-w-[140px] mx-auto md:mx-0 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 shadow-inner flex items-center justify-center">
                      {mainImg ? (
                        <>
                          <img
                            src={resolveCloudinaryUrl(mainImg) || mainImg}
                            alt={row.colorName || "Suit Color"}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />

                          {/* Saving spinner */}
                          {row._isUploading && (
                            <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                              <FiRefreshCw size={10} className="animate-spin" /> Saving...
                            </div>
                          )}

                          {/* Hover actions */}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1.5 transition-opacity text-white p-2">
                            <button
                              type="button"
                              onClick={() => {
                                setReplacePhotoIndex(index);
                                replaceFileInputRef.current?.click();
                              }}
                              className="px-2.5 py-1 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-xs transition-colors"
                            >
                              Change Photo
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveAngleUploadIndex(index);
                                angleFileInputRef.current?.click();
                              }}
                              className="px-2.5 py-1 text-[11px] bg-white text-gray-800 rounded-lg font-semibold shadow-xs hover:bg-gray-100 transition-colors"
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
                          className="flex flex-col items-center justify-center text-gray-400 hover:text-emerald-600 p-4 transition-colors text-center"
                        >
                          <FiCamera size={26} className="mb-1" />
                          <span className="text-[11px] font-semibold leading-tight">
                            Upload suit photo
                          </span>
                        </button>
                      )}
                    </div>

                    {/* Main Photo Status & Toggle Button */}
                    <div className="max-w-[140px] mx-auto md:mx-0">
                      {isMain ? (
                        <div className="w-full text-center py-1.5 bg-emerald-600 text-white rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 shadow-xs">
                          <FiStar className="fill-current text-amber-300" size={12} /> Main Suit Photo
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSetMainSuit(index)}
                          className="w-full text-center py-1.5 border border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 rounded-xl text-[11px] font-semibold transition-colors flex items-center justify-center gap-1"
                        >
                          <FiStar size={12} /> Set as Main Suit
                        </button>
                      )}
                    </div>

                    {/* Extra Angles Section */}
                    <div className="pt-1 max-w-[160px] mx-auto md:mx-0">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveAngleUploadIndex(index);
                          angleFileInputRef.current?.click();
                        }}
                        className="w-full py-1.5 px-2 text-[11px] font-medium border border-dashed border-gray-300 dark:border-gray-600 hover:border-emerald-500 text-gray-600 dark:text-gray-300 hover:text-emerald-600 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                      >
                        <FiCamera size={13} className="text-emerald-600" /> + Add Angle Photos
                      </button>

                      {extraImgs.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap mt-2">
                          {extraImgs.map((img, extraIdx) => (
                            <div
                              key={extraIdx}
                              className="relative group w-9 h-9 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-xs"
                              title="Extra Angle Photo"
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
                                title="Remove this angle"
                              >
                                <FiX size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Clean Color Name + Stock + SKU + Delete */}
                  <div className="md:col-span-8 lg:col-span-9 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                      {/* Clean Color Input */}
                      <div className="sm:col-span-5">
                        <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-300 mb-1.5">
                          Color Name *
                        </label>
                        <ColorPickerInput
                          simple={true}
                          colorName={row.colorName || ""}
                          colorCode={row.colorCode || ""}
                          onChange={({ colorName, colorCode }) =>
                            updateColorBoth(index, colorName, colorCode)
                          }
                          placeholder="e.g. Bottle Green, Rani Pink, Wine"
                          required
                        />
                      </div>

                      {/* Stock Quantity */}
                      <div className="sm:col-span-3">
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
                          className="font-bold text-gray-800 dark:text-gray-100 text-sm"
                        />
                      </div>

                      {/* SKU (Optional) */}
                      <div className="sm:col-span-3">
                        <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-300 mb-1.5">
                          SKU (Optional)
                        </label>
                        <Input
                          value={row.sku || ""}
                          onChange={(e) => updateRow(index, "sku", e.target.value)}
                          placeholder="e.g. MAN-GRN-01"
                          className="text-xs"
                        />
                      </div>

                      {/* Delete Button */}
                      <div className="sm:col-span-1 flex justify-end pb-1">
                        <button
                          type="button"
                          onClick={() => removeRow(index)}
                          className="p-2.5 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors"
                          title="Remove this suit"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PRODUCT VIDEO SECTION (Compact & Clean) */}
      <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <FiFilm className="text-emerald-600" size={18} />
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200">
            Product Video (Reels / Details Page) - Optional
          </h4>
        </div>
        <VideoUploader
          value={video}
          onChange={setVideo}
          folder="product-videos"
          title="Upload product video"
        />
        <p className="text-xs text-gray-400">
          Upload MP4 video for reels and storefront product view.
        </p>
      </div>
    </div>
  );
};

export default ColorVariantManager;
