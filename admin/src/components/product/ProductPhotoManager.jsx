import React, { useState, useRef } from "react";
import {
  FiUploadCloud,
  FiStar,
  FiTrash2,
  FiCheck,
  FiLayers,
  FiRefreshCw,
  FiCamera,
  FiPlus,
} from "react-icons/fi";
import { resolveCloudinaryUrl } from "@/utils/cloudinaryUrl";
import {
  uploadImageFile,
  extractDominantColorFromFile,
  extractDominantColorFromUrl,
} from "@/utils/imageUpload";
import VideoUploader from "@/components/image-uploader/VideoUploader";

const ProductPhotoManager = ({
  featuredImage = "",
  setFeaturedImage,
  imageUrl = [],
  setImageUrl,
  colorVariants = [],
  setColorVariants,
  video = "",
  setVideo,
  defaultColorName = "",
  setDefaultColor,
  onStockChange,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0, fileName: "" });
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Normalize image list
  const currentImages = [
    featuredImage,
    ...(Array.isArray(imageUrl) ? imageUrl : [imageUrl]),
  ].filter((url, idx, self) => Boolean(url) && self.indexOf(url) === idx);

  // Map image URLs to their associated color variant
  const getImageVariant = (url) => {
    return (colorVariants || []).find(
      (cv) => Array.isArray(cv.images) && cv.images.includes(url)
    );
  };

  // Upload handler for all product photos in bulk
  const handleBulkUpload = async (filesList) => {
    const fileArray = Array.from(filesList || []).filter(
      (f) =>
        (f && f.type && (f.type.startsWith("image/") || f.type === "application/octet-stream")) ||
        (f && f.name && /\.(jpe?g|png|webp|jfif|avif|gif|bmp|heic|heif)$/i.test(f.name))
    );
    if (fileArray.length === 0) return;

    setIsUploading(true);
    setUploadProgress({ current: 0, total: fileArray.length, fileName: "" });

    const newUploaded = [];

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      setUploadProgress({
        current: i + 1,
        total: fileArray.length,
        fileName: file.name,
      });

      try {
        // Extract color and upload image
        const [detectedColor, uploadedUrl] = await Promise.all([
          extractDominantColorFromFile(file),
          uploadImageFile(file, "product"),
        ]);

        if (uploadedUrl) {
          newUploaded.push({
            url: uploadedUrl,
            color: detectedColor || { colorName: "", colorCode: "" },
          });
        }
      } catch (err) {
        console.error("Failed to upload product photo:", file.name, err);
      }
    }

    if (newUploaded.length > 0) {
      let nextFeatured = featuredImage;
      const nextGallery = Array.isArray(imageUrl) ? [...imageUrl] : [];
      let newVariants = [...(colorVariants || [])];

      newUploaded.forEach((item, index) => {
        // 1. If no featured image exists yet, the first uploaded image becomes main
        if (!nextFeatured && index === 0) {
          nextFeatured = item.url;
          if (
            typeof setDefaultColor === "function" &&
            item.color?.colorName &&
            !defaultColorName
          ) {
            setDefaultColor(item.color);
          }
        } else if (!nextGallery.includes(item.url) && item.url !== nextFeatured) {
          nextGallery.push(item.url);
        }

        // 2. Automatically create color variant for each photo with auto-detected color
        const alreadyInVariant = newVariants.some(
          (cv) => Array.isArray(cv.images) && cv.images.includes(item.url)
        );

        if (!alreadyInVariant) {
          newVariants.push({
            colorName: item.color?.colorName || "",
            colorCode: item.color?.colorCode || "",
            images: [item.url],
            stock: 5,
            sku: "",
          });
        }
      });

      setFeaturedImage(nextFeatured);
      setImageUrl(nextGallery);
      setColorVariants(newVariants);

      if (typeof onStockChange === "function") {
        const totalStock = newVariants.reduce((s, r) => s + Number(r.stock || 0), 0);
        onStockChange(totalStock);
      }
    }

    setIsUploading(false);
    setUploadProgress({ current: 0, total: 0, fileName: "" });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Select which image is the Main Product Image
  const handleSetMain = (targetUrl) => {
    if (!targetUrl || targetUrl === featuredImage) return;

    const oldFeatured = featuredImage;
    setFeaturedImage(targetUrl);

    // Reorganize imageUrl gallery
    const remaining = currentImages.filter((img) => img !== targetUrl);
    setImageUrl(remaining);

    // If target photo has an associated variant with a color, sync defaultColor
    const variant = getImageVariant(targetUrl);
    if (variant?.colorName && typeof setDefaultColor === "function") {
      setDefaultColor({
        colorName: variant.colorName,
        colorCode: variant.colorCode || "",
      });
    }
  };

  // Remove photo
  const handleRemoveImage = (targetUrl) => {
    if (!targetUrl) return;

    if (targetUrl === featuredImage) {
      const remaining = (Array.isArray(imageUrl) ? imageUrl : []).filter(
        (img) => img !== targetUrl
      );
      if (remaining.length > 0) {
        setFeaturedImage(remaining[0]);
        setImageUrl(remaining.slice(1));
      } else {
        setFeaturedImage("");
        setImageUrl([]);
      }
    } else {
      const remaining = (Array.isArray(imageUrl) ? imageUrl : []).filter(
        (img) => img !== targetUrl
      );
      setImageUrl(remaining);
    }

    // Also remove from color variants
    const updatedVariants = (colorVariants || [])
      .map((cv) => {
        if (!Array.isArray(cv.images)) return cv;
        return { ...cv, images: cv.images.filter((img) => img !== targetUrl) };
      })
      .filter((cv) => (cv.images && cv.images.length > 0) || cv.colorName);

    setColorVariants(updatedVariants);

    if (typeof onStockChange === "function") {
      const totalStock = updatedVariants.reduce((s, r) => s + Number(r.stock || 0), 0);
      onStockChange(totalStock);
    }
  };

  // Toggle or add photo to color variants
  const handleToggleVariantForImage = async (imgUrl) => {
    const existing = getImageVariant(imgUrl);
    if (existing) {
      // Remove variant
      const updated = colorVariants.filter((cv) => cv !== existing);
      setColorVariants(updated);
      if (typeof onStockChange === "function") {
        onStockChange(updated.reduce((s, r) => s + Number(r.stock || 0), 0));
      }
    } else {
      // Auto-detect color and create variant
      const detected = await extractDominantColorFromUrl(imgUrl);
      const newVar = {
        colorName: detected?.colorName || "",
        colorCode: detected?.colorCode || "",
        images: [imgUrl],
        stock: 5,
        sku: "",
      };
      const updated = [...colorVariants, newVar];
      setColorVariants(updated);
      if (typeof onStockChange === "function") {
        onStockChange(updated.reduce((s, r) => s + Number(r.stock || 0), 0));
      }
    }
  };

  return (
    <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
        <div>
          <h2 className="text-base font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <FiCamera className="text-emerald-600" /> Product Photos & Video
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Upload all product photos at once. Click any photo to set it as the Main Photo or Color Variant.
          </p>
        </div>

        {currentImages.length > 0 && (
          <span className="text-xs bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 font-semibold px-3 py-1 rounded-full border border-emerald-200/60 dark:border-emerald-800 shrink-0">
            {currentImages.length} Photo{currentImages.length > 1 ? "s" : ""} Uploaded
          </span>
        )}
      </div>

      {/* Hidden bulk input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/jpg"
        className="hidden"
        onChange={(e) => handleBulkUpload(e.target.files)}
      />

      {/* Drag & Drop Bulk Upload Zone */}
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
            handleBulkUpload(e.dataTransfer.files);
          }
        }}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-7 text-center cursor-pointer transition-all duration-200 ${
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
              Uploading & detecting colors: {uploadProgress.current} of {uploadProgress.total}...
            </p>
            {uploadProgress.fileName && (
              <p className="text-xs text-gray-500 font-mono truncate max-w-sm mx-auto">
                {uploadProgress.fileName}
              </p>
            )}
            <div className="w-64 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto overflow-hidden">
              <div
                className="h-full bg-emerald-600 transition-all duration-300"
                style={{
                  width: `${(uploadProgress.current / (uploadProgress.total || 1)) * 100}%`,
                }}
              />
            </div>
          </div>
        ) : (
          <div className="py-2 space-y-2">
            <div className="inline-flex p-3 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 mb-1">
              <FiUploadCloud size={30} />
            </div>
            <h4 className="text-sm font-bold text-gray-800 dark:text-gray-100">
              Click or Drag & Drop to Upload All Product Images at Once
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
              Upload all color photos and angles together. The system automatically detects the colors, creates color variants, and lets you choose the Main Photo.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition-colors">
                <FiPlus size={14} /> Select All Product Photos
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Uploaded Photos Grid with Main Photo and Color Variant Selectors */}
      {currentImages.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
            <span>Uploaded Images ({currentImages.length})</span>
            <span className="text-[11px] font-normal text-gray-400 lowercase">
              Click "Set as Main" to choose the primary catalog photo
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
            {currentImages.map((url, idx) => {
              const isMain = url === featuredImage;
              const variant = getImageVariant(url);
              const colorName = variant?.colorName || "";
              const colorCode = variant?.colorCode || "";

              return (
                <div
                  key={`${url}-${idx}`}
                  className={`group relative rounded-2xl overflow-hidden border-2 transition-all duration-200 bg-white dark:bg-gray-800 flex flex-col ${
                    isMain
                      ? "border-emerald-600 shadow-md ring-2 ring-emerald-500/30"
                      : "border-gray-200 dark:border-gray-700 hover:border-emerald-400 shadow-sm hover:shadow"
                  }`}
                >
                  {/* Photo Preview Container */}
                  <div className="relative aspect-square w-full bg-gray-50 dark:bg-gray-900 overflow-hidden">
                    <img
                      src={resolveCloudinaryUrl(url) || url}
                      alt={`Product photo ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Main Photo Badge (Top Left) */}
                    {isMain ? (
                      <div className="absolute top-2 left-2 z-10 bg-emerald-600 text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 shadow-md">
                        <FiStar size={11} className="fill-current text-amber-300" /> Main Photo
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSetMain(url)}
                        className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 hover:bg-emerald-600 text-white text-[10px] font-semibold px-2 py-1 rounded-lg flex items-center gap-1 shadow-md"
                        title="Click to set this image as Main Product Image"
                      >
                        <FiStar size={11} /> Set as Main
                      </button>
                    )}

                    {/* Delete button (Top Right) */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage(url);
                      }}
                      className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-red-600/90 hover:bg-red-600 text-white shadow-md"
                      title="Remove this photo"
                    >
                      <FiTrash2 size={12} />
                    </button>
                  </div>

                  {/* Card Bottom: Color Variant Indicator & Actions */}
                  <div className="p-2.5 bg-gray-50/70 dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-700 space-y-1.5">
                    {/* Auto-detected color display */}
                    <div className="flex items-center justify-between gap-1 text-xs">
                      {colorName ? (
                        <div className="flex items-center gap-1.5 truncate">
                          {colorCode && (
                            <span
                              className="w-3 h-3 rounded-full border border-black/10 shrink-0 shadow-xs"
                              style={{ backgroundColor: colorCode }}
                            />
                          )}
                          <span className="font-semibold text-gray-800 dark:text-gray-100 truncate text-[11px]">
                            {colorName}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-gray-400 truncate">
                          Photo #{idx + 1}
                        </span>
                      )}

                      {variant && (
                        <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-200/50 dark:border-emerald-800 shrink-0">
                          Variant
                        </span>
                      )}
                    </div>

                    {/* Quick Button: Set Main if not main */}
                    {!isMain && (
                      <button
                        type="button"
                        onClick={() => handleSetMain(url)}
                        className="w-full text-center py-1 text-[11px] font-medium text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 bg-emerald-50/60 hover:bg-emerald-100 dark:bg-emerald-950/30 rounded-lg transition-colors border border-emerald-200/60 dark:border-emerald-800/50"
                      >
                        ★ Set as Main Photo
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Product Video Section */}
      <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
        <label className="block text-xs font-semibold uppercase text-gray-500 mb-2">
          Product Video (Reels / Details Page)
        </label>
        <VideoUploader
          value={video}
          onChange={setVideo}
          folder="product-videos"
          title="Upload product video"
        />
        <p className="text-xs text-gray-400 mt-2">
          Upload MP4 video for reels and product view. No external link required.
        </p>
      </div>
    </section>
  );
};

export default ProductPhotoManager;
