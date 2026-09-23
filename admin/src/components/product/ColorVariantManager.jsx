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
  FiEye,
} from "react-icons/fi";
import ColorPickerInput from "@/components/common/ColorPickerInput";
import VideoUploader from "@/components/image-uploader/VideoUploader";
import {
  uploadImageFile,
  guessColorFromFilename,
  extractDominantColorFromFile,
  extractDominantColorFromUrl,
  ensureBrowserCompatibleFile,
  isHeicFile,
} from "@/utils/imageUpload";
import { resolveCloudinaryUrl } from "@/utils/cloudinaryUrl";
import { resolveHex, findClosestFabricColor } from "@/utils/fabricColors";
import { notifySuccess, notifyError } from "@/utils/toast";

const POPULAR_SUIT_COLORS = [
  { name: "Bridal Red", hex: "#C41E3A" },
  { name: "Rani Pink", hex: "#E3007E" },
  { name: "Deep Wine", hex: "#722F37" },
  { name: "Maroon", hex: "#800000" },
  { name: "Bottle Green", hex: "#004B23" },
  { name: "Mehndi Green", hex: "#7F8C42" },
  { name: "Pista Green", hex: "#93C572" },
  { name: "Mustard Yellow", hex: "#E1AD01" },
  { name: "Royal Blue", hex: "#4169E1" },
  { name: "Navy Blue", hex: "#000080" },
  { name: "Firozi Blue", hex: "#00A8CC" },
  { name: "Jet Black", hex: "#000000" },
  { name: "Off White", hex: "#FAF9F6" },
  { name: "Peach", hex: "#FFE5B4" },
  { name: "Rust Orange", hex: "#C85A17" },
  { name: "Coffee Brown", hex: "#4A2E18" },
];

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
  const [pickingColorForIndex, setPickingColorForIndex] = useState(null);

  const bulkFileInputRef = useRef(null);
  const angleFileInputRef = useRef(null);
  const replaceFileInputRef = useRef(null);

  // Trigger interactive color detection from suit photo
  const handleStartPickColor = async (index) => {
    // 1. Try native browser EyeDropper API (Chromium / Chrome / Edge)
    if (typeof window !== "undefined" && window.EyeDropper) {
      try {
        const eyeDropper = new window.EyeDropper();
        const result = await eyeDropper.open();
        if (result?.sRGBHex) {
          const hex = result.sRGBHex.toUpperCase();
          const closest = findClosestFabricColor(hex);
          const name = closest ? closest.name : "Custom Shade";
          updateColorBoth(index, name, hex);
          notifySuccess(`Detected "${name}" (${hex})!`);
          return;
        }
      } catch (err) {
        // User canceled EyeDropper or pressed Escape; toggle on-image click mode
      }
    }
    // Toggle on-image interactive click sampling mode
    setPickingColorForIndex((prev) => (prev === index ? null : index));
  };

  // Sample pixel directly from image click coordinates
  const handleImageClickToPickColor = (index, e) => {
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const displayedWidth = rect.width;
    const displayedHeight = rect.height;

    const row = rows[index];
    const imgSrc = row._localUrl || resolveCloudinaryUrl(row.images?.[0]) || row.images?.[0];
    if (!imgSrc) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth || displayedWidth;
        canvas.height = img.naturalHeight || displayedHeight;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const scaleX = canvas.width / displayedWidth;
        const scaleY = canvas.height / displayedHeight;
        const sampleX = Math.min(canvas.width - 1, Math.max(0, Math.round(clickX * scaleX)));
        const sampleY = Math.min(canvas.height - 1, Math.max(0, Math.round(clickY * scaleY)));

        // Smooth 3x3 pixel grid around clicked coordinates
        let rSum = 0, gSum = 0, bSum = 0, count = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const px = Math.min(canvas.width - 1, Math.max(0, sampleX + dx));
            const py = Math.min(canvas.height - 1, Math.max(0, sampleY + dy));
            const pixel = ctx.getImageData(px, py, 1, 1).data;
            if (pixel[3] > 80) {
              rSum += pixel[0];
              gSum += pixel[1];
              bSum += pixel[2];
              count++;
            }
          }
        }

        if (count > 0) {
          const avgR = Math.round(rSum / count);
          const avgG = Math.round(gSum / count);
          const avgB = Math.round(bSum / count);
          const toHex = (n) => Math.min(255, Math.max(0, n)).toString(16).padStart(2, "0").toUpperCase();
          const hex = `#${toHex(avgR)}${toHex(avgG)}${toHex(avgB)}`;
          const matched = findClosestFabricColor(hex);
          const pickedName = matched?.name || "Custom Shade";
          const pickedHex = matched?.hex || hex;

          updateColorBoth(index, pickedName, pickedHex);
          notifySuccess(`Detected "${pickedName}" from photo!`);
          setPickingColorForIndex(null);
        }
      } catch (err) {
        console.warn("Canvas pixel sample failed:", err);
      }
    };
    img.src = imgSrc;
  };

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

  // Bulk Upload Handler: Converts any HEIC to JPEG, creates cards with local preview, then uploads in background
  const handleBulkUploadFiles = async (filesList) => {
    const rawFiles = Array.from(filesList || []);
    const fileArray = rawFiles.filter(
      (f) =>
        (f && f.type && (f.type.startsWith("image/") || f.type === "application/octet-stream")) ||
        (f && f.name && /\.(jpe?g|png|webp|jfif|avif|gif|bmp|heic|heif)$/i.test(f.name))
    );

    if (fileArray.length === 0) {
      if (rawFiles.length > 0) {
        notifyError("Please select valid image files (JPG, PNG, WEBP, HEIC, etc.)");
      }
      return;
    }

    const anyHeic = fileArray.some((f) => isHeicFile(f));
    if (anyHeic) {
      setIsUploading(true);
      setUploadStats({ current: 0, total: fileArray.length, fileName: "Optimizing iPhone photos..." });
    }

    // Convert HEIC photos to browser-compatible JPEG (0ms for standard JPG/PNG)
    const compatibleFiles = await Promise.all(
      fileArray.map((f) => ensureBrowserCompatibleFile(f))
    );

    // 1. INSTANT LOCAL CARDS: Zero waiting, cards appear with browser-compatible preview URLs
    const initialNewRows = compatibleFiles.map((file) => {
      let localUrl = "";
      try {
        localUrl = URL.createObjectURL(file);
      } catch (e) {
        console.warn("Could not create object URL:", e);
      }
      const detected = guessColorFromFilename(file.name);
      const colorName = detected?.colorName || "Suit Color";
      const colorCode = detected?.colorCode || resolveHex("", colorName) || "#004B23";

      return {
        colorName,
        colorCode,
        images: localUrl ? [localUrl] : [],
        stock: 5,
        sku: "",
        _localId: Math.random().toString(36).substring(7),
        _localUrl: localUrl,
        _file: file,
        _isUploading: true,
      };
    });

    // Put suit cards on screen IMMEDIATELY!
    setColorVariants((prev = []) => {
      const currentList = Array.isArray(prev) ? prev : [];
      const merged = [...currentList, ...initialNewRows];
      if (typeof onStockChange === "function") {
        const sum = merged.reduce((s, r) => s + Number(r.stock || 0), 0);
        onStockChange(sum);
      }
      return merged;
    });

    // Set first photo as featured image immediately if not set yet
    const firstImg = initialNewRows[0]?.images?.[0];
    if (firstImg) {
      if (!featuredImage && typeof setFeaturedImage === "function") {
        setFeaturedImage(firstImg);
      }
      if (initialNewRows[0].colorName && typeof setDefaultColor === "function") {
        setDefaultColor({
          colorName: initialNewRows[0].colorName,
          colorCode: initialNewRows[0].colorCode,
        });
      }
      if (typeof setImageUrl === "function") {
        setImageUrl((prev = []) => {
          const list = Array.isArray(prev) ? prev : [prev].filter(Boolean);
          return Array.from(new Set([...list, ...initialNewRows.map((r) => r.images[0]).filter(Boolean)]));
        });
      }
    }

    setIsUploading(true);
    setUploadStats({ current: 0, total: compatibleFiles.length, fileName: "" });

    // 2. BACKGROUND UPLOAD & COLOR REFINEMENT
    (async () => {
      for (let i = 0; i < initialNewRows.length; i++) {
        const rowItem = initialNewRows[i];
        const file = rowItem._file;
        setUploadStats((prev) => ({
          ...prev,
          current: i + 1,
          fileName: file.name,
        }));

        // Try to refine color if it was "Suit Color"
        if (!rowItem.colorName || rowItem.colorName === "Suit Color") {
          try {
            const detectedColor = await Promise.race([
              extractDominantColorFromFile(file),
              new Promise((resolve) => setTimeout(() => resolve(null), 1200)),
            ]);
            if (detectedColor?.colorName && detectedColor.colorName !== "Suit Color") {
              setColorVariants((prev = []) =>
                prev.map((r) =>
                  r._localId === rowItem._localId
                    ? {
                        ...r,
                        colorName: detectedColor.colorName,
                        colorCode: detectedColor.colorCode || resolveHex("", detectedColor.colorName) || r.colorCode,
                      }
                    : r
                )
              );
            }
          } catch (e) {
            console.warn("Background color extraction:", e);
          }
        }

        // Upload to server/Cloudinary
        try {
          const uploadedUrl = await uploadImageFile(file, "product");
          if (uploadedUrl) {
            setColorVariants((prev = []) =>
              prev.map((r) => {
                if (r._localId === rowItem._localId) {
                  return {
                    ...r,
                    images: [
                      uploadedUrl,
                      ...(r.images || []).slice(1).filter((img) => img !== rowItem._localUrl),
                    ],
                    _isUploading: false,
                  };
                }
                return r;
              })
            );

            if (typeof setFeaturedImage === "function") {
              setFeaturedImage((prevFeatured) => {
                if (prevFeatured === rowItem._localUrl || !prevFeatured) {
                  return uploadedUrl;
                }
                return prevFeatured;
              });
            }

            if (typeof setImageUrl === "function") {
              setImageUrl((prev = []) => {
                const list = Array.isArray(prev) ? prev : [prev].filter(Boolean);
                return Array.from(new Set([...list.filter((u) => u !== rowItem._localUrl), uploadedUrl]));
              });
            }
          } else {
            // Upload returned null/failed, but keep local image so user still sees the suit photo
            setColorVariants((prev = []) =>
              prev.map((r) => (r._localId === rowItem._localId ? { ...r, _isUploading: false } : r))
            );
          }
        } catch (uploadErr) {
          console.error("Upload notice for file:", file.name, uploadErr);
          setColorVariants((prev = []) =>
            prev.map((r) => (r._localId === rowItem._localId ? { ...r, _isUploading: false } : r))
          );
        }
      }

      setIsUploading(false);
      setUploadStats({ current: 0, total: 0, fileName: "" });
      if (bulkFileInputRef.current) bulkFileInputRef.current.value = "";
      notifySuccess(`Added ${compatibleFiles.length} suit photo${compatibleFiles.length > 1 ? "s" : ""}!`);
    })();
  };

  // Add extra angle photo(s) to a specific color variant
  const handleAddAnglePhoto = async (index, filesList) => {
    const rawFiles = Array.from(filesList || []).filter(
      (f) =>
        (f && f.type && (f.type.startsWith("image/") || f.type === "application/octet-stream")) ||
        (f && f.name && /\.(jpe?g|png|webp|jfif|avif|gif|bmp|heic|heif)$/i.test(f.name))
    );
    if (rawFiles.length === 0) return;

    const files = await Promise.all(
      rawFiles.map((file) => ensureBrowserCompatibleFile(file))
    );

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
    const rawFile = filesList?.[0];
    if (!rawFile) return;

    const file = await ensureBrowserCompatibleFile(rawFile);
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
      } else {
        setColorVariants((prev) =>
          prev.map((row, i) => (i === index ? { ...row, _isUploading: false } : row))
        );
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
        accept="image/*,.jpg,.jpeg,.png,.webp,.avif,.jfif,.heic"
        className="hidden"
        onClick={(e) => {
          e.target.value = "";
        }}
        onChange={(e) => {
          handleBulkUploadFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <input
        ref={angleFileInputRef}
        type="file"
        multiple
        accept="image/*,.jpg,.jpeg,.png,.webp,.avif,.jfif,.heic"
        className="hidden"
        onClick={(e) => {
          e.target.value = "";
        }}
        onChange={(e) => {
          if (activeAngleUploadIndex !== null) {
            handleAddAnglePhoto(activeAngleUploadIndex, e.target.files);
          }
          e.target.value = "";
        }}
      />
      <input
        ref={replaceFileInputRef}
        type="file"
        accept="image/*,.jpg,.jpeg,.png,.webp,.avif,.jfif,.heic"
        className="hidden"
        onClick={(e) => {
          e.target.value = "";
        }}
        onChange={(e) => {
          if (replacePhotoIndex !== null) {
            handleReplacePhoto(replacePhotoIndex, e.target.files);
          }
          e.target.value = "";
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
        onClick={() => {
          if (bulkFileInputRef.current) bulkFileInputRef.current.value = "";
          bulkFileInputRef.current?.click();
        }}
        className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? "border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/20 scale-[1.01]"
            : "border-emerald-300/80 hover:border-emerald-500 bg-emerald-50/30 hover:bg-emerald-50/60 dark:bg-gray-800/40 dark:border-emerald-700/50"
        }`}
      >
        <div className="py-2 space-y-2">
          {rows.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold text-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                {rows.length} {rows.length === 1 ? "Suit Photo" : "Suit Photos"} Selected
              </div>
              <div className="flex items-center justify-center gap-2.5 flex-wrap max-w-xl mx-auto py-1">
                {rows.map((r, i) => {
                  const img = r.images?.[0] || r._localUrl;
                  return (
                    <div
                      key={r._localId || i}
                      className="relative w-14 h-14 rounded-xl overflow-hidden border-2 border-emerald-500 shadow-sm bg-gray-100 flex-shrink-0"
                    >
                      <img
                        src={resolveCloudinaryUrl(img) || img || r._localUrl}
                        alt={r.colorName || "Suit"}
                        onError={(e) => {
                          if (r._localUrl && e.target.src !== r._localUrl) {
                            e.target.src = r._localUrl;
                          }
                        }}
                        className="w-full h-full object-cover"
                      />
                      <span
                        className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full border-2 border-white shadow-xs"
                        style={{ backgroundColor: r.colorCode || "#004B23" }}
                        title={r.colorName}
                      />
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Click here or drag more photos to add more colors & suits
              </p>
              <div className="pt-1">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-colors">
                  <FiCamera size={14} /> + Add More Suit Photos
                </span>
              </div>
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>

        {/* Upload progress indicator */}
        {isUploading && (
          <div className="mt-4 pt-3 border-t border-emerald-200/50 text-xs text-emerald-700 dark:text-emerald-300 flex items-center justify-center gap-2">
            <FiRefreshCw size={14} className="animate-spin text-emerald-600" />
            <span>Uploading {uploadStats.current} of {uploadStats.total} images...</span>
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
                className={`p-5 sm:p-6 border-2 rounded-2xl bg-white dark:bg-gray-800 transition-all duration-200 ${
                  isMain
                    ? "border-emerald-500 ring-2 ring-emerald-500/20 shadow-md"
                    : "border-gray-200 dark:border-gray-700 shadow-xs hover:border-gray-300"
                }`}
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                  {/* Left Column: Suit Photo Preview & Main Badge */}
                  <div className="md:col-span-4 lg:col-span-3 space-y-2.5">
                    <div
                      className={`relative group w-full aspect-square max-w-[140px] mx-auto md:mx-0 rounded-2xl overflow-hidden border bg-gray-50 dark:bg-gray-900 shadow-inner flex items-center justify-center transition-all ${
                        pickingColorForIndex === index
                          ? "ring-4 ring-emerald-500 shadow-lg border-emerald-500 cursor-crosshair scale-105"
                          : "border-gray-200 dark:border-gray-700"
                      }`}
                      onClick={(e) => {
                        if (pickingColorForIndex === index) {
                          handleImageClickToPickColor(index, e);
                        }
                      }}
                      title={
                        pickingColorForIndex === index
                          ? "Click anywhere on this suit to pick its exact color"
                          : ""
                      }
                    >
                      {mainImg ? (
                        <>
                          <img
                            src={resolveCloudinaryUrl(mainImg) || mainImg || row._localUrl}
                            alt={row.colorName || "Suit Color"}
                            onError={(e) => {
                              if (row._localUrl && e.target.src !== row._localUrl) {
                                e.target.src = row._localUrl;
                              }
                            }}
                            className={`w-full h-full object-cover transition-transform duration-300 ${
                              pickingColorForIndex === index
                                ? "cursor-crosshair"
                                : "group-hover:scale-105"
                            }`}
                          />

                          {/* Picking color indicator overlay */}
                          {pickingColorForIndex === index && (
                            <div className="absolute inset-0 bg-emerald-950/60 backdrop-blur-[1px] flex flex-col items-center justify-center p-2 text-center z-20 pointer-events-none animate-in fade-in duration-150">
                              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center mb-1 shadow-md animate-pulse">
                                <FiEye size={18} />
                              </div>
                              <span className="text-[11px] font-bold text-white leading-tight drop-shadow-sm">
                                Click suit fabric!
                              </span>
                              <span className="text-[9px] text-emerald-200 mt-0.5">
                                (Samples exact spot)
                              </span>
                            </div>
                          )}

                          {/* Saving spinner */}
                          {row._isUploading && (
                            <div className="absolute top-2 right-2 bg-black/70 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 z-10">
                              <FiRefreshCw size={10} className="animate-spin" /> Saving...
                            </div>
                          )}

                          {/* Hover actions (only when not in picking mode) */}
                          {pickingColorForIndex !== index && (
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1.5 transition-opacity text-white p-2">
                              <button
                                type="button"
                                onClick={() => handleStartPickColor(index)}
                                className="px-2.5 py-1 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-xs transition-colors flex items-center gap-1"
                              >
                                <FiEye size={12} /> Pick Color
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setReplacePhotoIndex(index);
                                  replaceFileInputRef.current?.click();
                                }}
                                className="px-2.5 py-1 text-[11px] bg-white text-gray-800 rounded-lg font-semibold shadow-xs hover:bg-gray-100 transition-colors"
                              >
                                Change Photo
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemovePhotoFromVariant(index, 0)}
                                className="text-[11px] text-red-200 hover:text-red-400 underline font-medium"
                              >
                                Remove photo
                              </button>
                            </div>
                          )}
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

                  {/* Right Column: Spacious Form Fields */}
                  <div className="md:col-span-8 lg:col-span-9 space-y-4 sm:pr-8">
                    {/* Row 1: Color Name & Delete Button */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-300">
                        Color Name *
                      </label>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 min-w-0">
                          <ColorPickerInput
                            simple={true}
                            colorName={row.colorName || ""}
                            colorCode={row.colorCode || ""}
                            onChange={({ colorName, colorCode }) =>
                              updateColorBoth(index, colorName, colorCode)
                            }
                            onPickFromPhoto={() => handleStartPickColor(index)}
                            placeholder="Type or search shade (e.g. Rani Pink, Bottle Green, Wine)..."
                            required
                          />
                        </div>
                        {/* Delete Button (Directly After Color Dropdown Arrow) */}
                        <button
                          type="button"
                          onClick={() => removeRow(index)}
                          className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-red-50 hover:border-red-200 text-red-500 hover:text-red-600 dark:hover:bg-red-950/40 transition-colors shrink-0 flex items-center justify-center"
                          title="Delete this suit"
                          aria-label="Delete this suit"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Row 3: Stock Quantity & SKU (Comfortable 2-Column Grid) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                      <div>
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

                      <div>
                        <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-300 mb-1.5">
                          SKU (Optional)
                        </label>
                        <Input
                          value={row.sku || ""}
                          onChange={(e) => updateRow(index, "sku", e.target.value)}
                          placeholder="e.g. MAN-01"
                        />
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
