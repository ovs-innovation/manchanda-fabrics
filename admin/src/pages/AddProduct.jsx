import React, { useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import { Button, Input, Textarea, Select } from "@windmill/react-ui";
import { FiChevronLeft, FiSave } from "react-icons/fi";

import useProductSubmit from "@/hooks/useProductSubmit";
import ParentCategory from "@/components/category/ParentCategory";
import Error from "@/components/form/others/Error";
import ProductPlacementFlags from "@/components/product/ProductPlacementFlags";
import ColorVariantManager from "@/components/product/ColorVariantManager";
import ProductPreviewCard from "@/components/product/ProductPreviewCard";
import Loading from "@/components/preloader/Loading";

const AddProduct = () => {
  const history = useHistory();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const {
    tag,
    setTag,
    register,
    onSubmit,
    errors,
    imageUrl,
    setImageUrl,
    featuredImage,
    setFeaturedImage,
    badge,
    setBadge,
    video,
    setVideo,
    handleSubmit,
    isSubmitting,
    selectedCategory,
    setSelectedCategory,
    setDefaultCategory,
    defaultCategory,
    watch,
    slug,
    handleProductSlug,
    resData,
    setValue,
    colorVariants,
    setColorVariants,
  } = useProductSubmit(id);

  useEffect(() => {
    register("gender", { value: "Women" });
    register("defaultColorName");
    register("defaultColorCode");
    register("slug");
  }, [register]);

  const watchTitle = watch("title");
  const watchOriginalPrice = watch("originalPrice");
  const watchPrice = watch("price");

  if (isEdit && !resData?._id) {
    return <Loading loading />;
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Header */}
        <div className="flex justify-between items-center mb-8 bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={() => history.push("/products")}
              className="p-2.5 border border-gray-100 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 flex items-center justify-center text-gray-600 transition-colors"
            >
              <FiChevronLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                {isEdit ? "Edit Product" : "Add Product"}
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Fast & simple product management for Manchanda Fabrics.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-6">
              {/* 1. Basic Details (Simplified: Name, Fabric, Occasion, Description) */}
              <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm space-y-5">
                <div className="border-b pb-3 flex items-center justify-between">
                  <h2 className="text-base font-bold text-gray-800 dark:text-white">
                    Basic Details
                  </h2>
                  <span className="text-xs text-gray-400">Essential product info</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-500 mb-2">
                    Product Name *
                  </label>
                  <Input
                    {...register("title", { required: "Product name is required" })}
                    placeholder="e.g. Floral Organza Suit Set"
                    onBlur={(e) => handleProductSlug(e.target.value)}
                  />
                  <Error errorName={errors.title} />
                  {/* Subtle auto-generated slug */}
                  <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-gray-400">
                    <span>Slug:</span>
                    <input
                      {...register("slug")}
                      value={slug || watch("slug") || ""}
                      onChange={(e) => setValue("slug", e.target.value)}
                      placeholder="auto-generated-slug"
                      className="bg-transparent border-b border-gray-200 dark:border-gray-700 text-gray-500 text-[11px] font-mono focus:outline-none focus:border-emerald-500 max-w-sm px-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-500 mb-2">
                      Fabric
                    </label>
                    <Input {...register("fabricType")} placeholder="Organza, Cotton, Silk, Chanderi..." />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-500 mb-2">
                      Occasion
                    </label>
                    <Input {...register("occasion")} placeholder="Festive, Wedding, Party, Daily..." />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-500 mb-2">
                    Description *
                  </label>
                  <Textarea
                    {...register("description", { required: "Description is required" })}
                    rows="3"
                    placeholder="Write about fabric, embroidery work, suit set pieces included..."
                  />
                  <Error errorName={errors.description} />
                </div>

                {/* Category & Badge */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-500 mb-2">
                      Category *
                    </label>
                    <ParentCategory
                      lang="en"
                      selectedCategory={selectedCategory}
                      setSelectedCategory={setSelectedCategory}
                      setDefaultCategory={setDefaultCategory}
                      defaultCategory={defaultCategory}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-500 mb-2">
                      Badge
                    </label>
                    <Select value={badge} onChange={(e) => setBadge(e.target.value)}>
                      <option value="">No badge</option>
                      <option value="New">New</option>
                      <option value="Trending">Trending</option>
                      <option value="Best Seller">Best Seller</option>
                    </Select>
                  </div>
                </div>

                {/* Homepage Placement */}
                <ProductPlacementFlags tag={tag} setTag={setTag} />
              </section>

              {/* 3. Unified Suit Photos & Color Variants (Upload all suits at once, auto-detect colors) */}
              <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
                <ColorVariantManager
                  colorVariants={colorVariants}
                  setColorVariants={setColorVariants}
                  featuredImage={featuredImage}
                  setFeaturedImage={setFeaturedImage}
                  defaultColorName={watch("defaultColorName")}
                  setDefaultColor={({ colorName, colorCode }) => {
                    setValue("defaultColorName", colorName, { shouldValidate: true });
                    setValue("defaultColorCode", colorCode, { shouldValidate: true });
                  }}
                  onStockChange={(total) => setValue("stock", total, { shouldValidate: true })}
                  video={video}
                  setVideo={setVideo}
                  imageUrl={imageUrl}
                  setImageUrl={setImageUrl}
                  availableImages={[featuredImage, ...(Array.isArray(imageUrl) ? imageUrl : [imageUrl])].filter(Boolean)}
                />
              </section>

              {/* 4. Pricing & Stock */}
              <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm space-y-5">
                <h2 className="text-base font-bold text-gray-800 dark:text-white border-b pb-3">
                  Price & Stock
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-500 mb-2">
                      MRP (₹) *
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      {...register("originalPrice", { required: "MRP is required" })}
                    />
                    <Error errorName={errors.originalPrice} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-500 mb-2">
                      Selling Price (₹) *
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      {...register("price", { required: "Selling price is required" })}
                    />
                    <Error errorName={errors.price} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-500 mb-2">
                      Total Stock *
                    </label>
                    <Input
                      type="number"
                      min="0"
                      {...register("stock", {
                        required: colorVariants?.length ? false : "Stock is required",
                      })}
                    />
                    <Error errorName={errors.stock} />
                    {colorVariants?.length > 0 && (
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                        Total across {colorVariants.length} color{colorVariants.length > 1 ? "s" : ""}: {colorVariants.reduce((sum, cv) => sum + Number(cv.stock || 0), 0)} units
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-500 mb-2">
                      SKU
                    </label>
                    <Input {...register("sku")} placeholder="e.g. MAN-ORG-001" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-500 mb-2">
                      Status
                    </label>
                    <Select {...register("status")}>
                      <option value="Published">Published (Live)</option>
                      <option value="Draft">Draft</option>
                      <option value="Hidden">Hidden</option>
                      <option value="Out Of Stock">Out Of Stock</option>
                    </Select>
                  </div>
                </div>
              </section>

              {/* Submit Button */}
              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-3 rounded-xl flex items-center gap-2 font-bold shadow-md hover:shadow-lg transition-all"
                >
                  <FiSave />
                  {isEdit ? "Update Product" : "Save Product"}
                </Button>
              </div>
            </div>

            {/* Right Sticky Preview Card */}
            <div className="lg:col-span-1 lg:sticky lg:top-8">
              <ProductPreviewCard
                title={watchTitle}
                brandName="Manchanda Fabrics"
                originalPrice={watchOriginalPrice}
                discount={Number(watchOriginalPrice || 0) - Number(watchPrice || watchOriginalPrice || 0)}
                discountType="flat"
                badge={badge}
                featuredImage={
                  colorVariants?.length > 0
                    ? (featuredImage || colorVariants.find((cv) => cv.images?.length > 0)?.images?.[0] || "")
                    : ""
                }
                hoverImage={
                  colorVariants?.length > 0
                    ? (colorVariants.find((cv) => cv.images?.length > 1)?.images?.[1] || featuredImage || "")
                    : ""
                }
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
