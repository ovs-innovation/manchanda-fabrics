import React, { useEffect, useState } from "react";
import { Button, Input, Select, Table, TableHeader, TableCell, TableContainer, TableBody, TableRow } from "@windmill/react-ui";
import { FiPlus, FiTrash2, FiVideo, FiEdit, FiX, FiCheck } from "react-icons/fi";

import ReelServices from "@/services/ReelServices";
import ProductServices from "@/services/ProductServices";
import VideoUploader from "@/components/image-uploader/VideoUploader";
import Uploader from "@/components/image-uploader/Uploader";
import { notifySuccess, notifyError } from "@/utils/toast";
import TableLoading from "@/components/preloader/TableLoading";
import AnimatedContent from "@/components/common/AnimatedContent";

const formatText = (value, fallback = "N/A") => {
  if (!value) return fallback;
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    if (value.en) return value.en;
    const firstValue = Object.values(value)[0];
    return typeof firstValue === "string" ? firstValue : fallback;
  }
  return String(value);
};

const Reels = () => {
  const [reels, setReels] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form & Edit State
  const [editId, setEditId] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [title, setTitle] = useState("");

  const fetchReels = async () => {
    try {
      setLoading(true);
      const res = await ReelServices.getAllReels();
      setReels(res || []);
    } catch (err) {
      console.error(err);
      notifyError("Failed to fetch reels");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await ProductServices.getAllProducts({ page: 1, limit: 500 });
      setProducts(res?.products || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchReels();
    fetchProducts();
  }, []);

  const handleResetForm = () => {
    setEditId(null);
    setVideoUrl("");
    setThumbnailUrl("");
    setSelectedProductId("");
    setTitle("");
  };

  const handleEditReel = (reel) => {
    setEditId(reel._id);
    setVideoUrl(reel.video || "");
    setThumbnailUrl(reel.thumbnail || "");
    setSelectedProductId(reel.product?._id || reel.product || "");
    setTitle(reel.title || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmitReel = async (e) => {
    e.preventDefault();
    if (!videoUrl) {
      return notifyError("Please upload a video first!");
    }

    try {
      setSaving(true);
      const payload = {
        video: videoUrl,
        product: selectedProductId || null,
        title,
        thumbnail: thumbnailUrl || "",
        status: "published",
      };

      if (editId) {
        await ReelServices.updateReel(editId, payload);
        notifySuccess("Video Reel updated successfully!");
      } else {
        await ReelServices.createReel(payload);
        notifySuccess("Video Reel created successfully!");
      }
      
      handleResetForm();
      fetchReels();
    } catch (err) {
      notifyError(err?.response?.data?.message || "Failed to save reel");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteReel = async (id) => {
    if (!window.confirm("Are you sure you want to delete this reel?")) return;
    try {
      await ReelServices.deleteReel(id);
      notifySuccess("Reel deleted successfully!");
      if (editId === id) handleResetForm();
      fetchReels();
    } catch (err) {
      notifyError(err?.response?.data?.message || "Failed to delete reel");
    }
  };

  return (
    <AnimatedContent>
      <div className="bg-[#f0f2f5] dark:bg-gray-900 min-h-screen pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          
          {/* Page Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center shadow-md">
              <FiVideo className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800 dark:text-gray-200 leading-tight">Video Reels Manager</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Upload and manage videos played on the Shop Latest Collection carousel</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* Left: Create/Edit Reel Form */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <h2 className="text-base font-bold text-gray-800 dark:text-white mb-4 border-b pb-2">
                {editId ? "Edit Video Reel" : "Add New Reel"}
              </h2>
              
              <form onSubmit={handleSubmitReel} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-500 mb-2">
                    Video Upload *
                  </label>
                  <VideoUploader
                    value={videoUrl}
                    onChange={setVideoUrl}
                    folder="homepage-reels"
                    title="Upload reel video"
                    hint="MP4, MOV, WEBM up to 100MB"
                    maxSizeMB={100}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-500 mb-2">
                    Custom Thumbnail / Cover Image (Optional)
                  </label>
                  <Uploader
                    imageUrl={thumbnailUrl ? [thumbnailUrl] : []}
                    setImageUrl={(url) => setThumbnailUrl(Array.isArray(url) ? url[0] : url || "")}
                    folder="homepage-reels"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    Choose a premium photo to display before the video plays or when loading.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-500 mb-2">
                    Caption / Title
                  </label>
                  <Input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Elegant Silk Saree Look"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-500 mb-2">
                    Associate with Product (Optional)
                  </label>
                  <Select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="">-- No linked product --</option>
                    {products.map((p) => (
                      <option key={p._id} value={p._id}>
                        {formatText(p.title)} ({p.sku || "No SKU"})
                      </option>
                    ))}
                  </Select>
                  <p className="text-[10px] text-gray-400 mt-1">
                    Linking a product allows users to click the card and purchase it.
                  </p>
                </div>

                <div className="flex gap-2">
                  {editId && (
                    <Button
                      type="button"
                      layout="outline"
                      onClick={handleResetForm}
                      className="w-1/2 flex items-center justify-center gap-1 border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold"
                    >
                      <FiX />
                      Cancel
                    </Button>
                  )}
                  <Button
                    type="submit"
                    disabled={saving || !videoUrl}
                    className={`flex-1 font-semibold flex items-center justify-center gap-2 ${editId ? "bg-teal-600 hover:bg-teal-700" : "bg-emerald-600 hover:bg-emerald-700"} text-white`}
                  >
                    {!editId && <FiPlus />}
                    {editId ? (saving ? "Updating..." : "Update Reel") : (saving ? "Saving..." : "Save Reel")}
                  </Button>
                </div>
              </form>
            </div>

            {/* Right: Reels List */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-gray-800 dark:text-white">Active Reels</h2>
                  <span className="bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-xs font-bold px-2 py-0.5 rounded">
                    {reels.length}
                  </span>
                </div>
              </div>

              {loading ? (
                <TableLoading row={4} col={4} />
              ) : reels.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <FiVideo className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-sm font-medium">No video reels uploaded yet.</p>
                  <p className="text-xs mt-1">Upload a video in the left panel to get started.</p>
                </div>
              ) : (
                <TableContainer className="rounded-none border-none">
                  <Table className="w-full text-sm">
                    <TableHeader>
                      <tr className="bg-gray-50/80 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                        <TableCell className="font-bold text-gray-600 dark:text-gray-400 text-[11px] uppercase tracking-wide">Video Preview</TableCell>
                        <TableCell className="font-bold text-gray-600 dark:text-gray-400 text-[11px] uppercase tracking-wide">Thumbnail / Title</TableCell>
                        <TableCell className="font-bold text-gray-600 dark:text-gray-400 text-[11px] uppercase tracking-wide">Linked Product</TableCell>
                        <TableCell className="font-bold text-gray-600 dark:text-gray-400 text-[11px] uppercase tracking-wide text-center">Action</TableCell>
                      </tr>
                    </TableHeader>
                    <TableBody>
                      {reels.map((reel) => (
                        <TableRow key={reel._id} className={`border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50/30 transition-all ${editId === reel._id ? "bg-teal-50/30 dark:bg-teal-900/10" : ""}`}>
                          
                          {/* Video Preview */}
                          <TableCell className="w-44 py-3">
                            <div className="w-28 aspect-[9/16] rounded-xl overflow-hidden bg-black shadow-sm relative">
                              <video
                                src={reel.video}
                                muted
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/30 flex items-center justify-center pointer-events-none">
                                <span className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center shadow">
                                  <span className="ml-0.5 border-l-6 border-y-3.5 border-l-emerald-600 border-y-transparent" />
                                </span>
                              </div>
                            </div>
                          </TableCell>

                          {/* Thumbnail / Title */}
                          <TableCell className="min-w-[180px]">
                            <div className="flex gap-2.5 items-start">
                              {(() => {
                                const displayImage = reel.thumbnail || (reel.product ? (Array.isArray(reel.product.image) ? reel.product.image[0] : reel.product.image) : null);
                                return displayImage ? (
                                  <div className="w-10 h-12 rounded-lg overflow-hidden border border-gray-100 bg-gray-50 shrink-0">
                                    <img src={displayImage} alt="thumb" className="w-full h-full object-cover" />
                                  </div>
                                ) : (
                                  <div className="w-10 h-12 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center shrink-0 text-gray-400 text-[9px] uppercase">
                                    No img
                                  </div>
                                );
                              })()}
                              <div>
                                <p className="font-bold text-gray-800 dark:text-gray-200 text-xs line-clamp-2">
                                  {reel.title || <span className="text-gray-400 font-normal italic">No caption</span>}
                                </p>
                                <span className="text-[10px] text-gray-400 mt-1 block">ID: #{reel._id?.substring(18, 24)}</span>
                              </div>
                            </div>
                          </TableCell>

                          {/* Linked Product */}
                          <TableCell className="max-w-[200px]">
                            {reel.product ? (
                              <div>
                                <p className="font-bold text-gray-700 dark:text-gray-300 truncate text-xs max-w-[180px]">
                                  {formatText(reel.product.title)}
                                </p>
                                <span className="text-[10px] text-gray-400">SKU: {reel.product.sku || "—"}</span>
                              </div>
                            ) : (
                              <span className="text-gray-400 text-xs">General Pool Video</span>
                            )}
                          </TableCell>

                          {/* Actions */}
                          <TableCell className="text-center w-28">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => handleEditReel(reel)}
                                className="p-2 text-teal-600 hover:text-teal-800 hover:bg-teal-50 rounded-lg transition-colors"
                                title="Edit reel"
                              >
                                <FiEdit size={15} />
                              </button>
                              <button
                                onClick={() => handleDeleteReel(reel._id)}
                                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete reel"
                              >
                                <FiTrash2 size={15} />
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </div>

          </div>

        </div>
      </div>
    </AnimatedContent>
  );
};

export default Reels;
