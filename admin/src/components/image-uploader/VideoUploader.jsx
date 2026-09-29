import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import {
  FiUploadCloud,
  FiXCircle,
  FiCheck,
  FiAlertCircle,
  FiFilm,
  FiLink,
  FiPlay,
} from "react-icons/fi";
import { FaYoutube } from "react-icons/fa";
import requests from "@/services/httpService";

export const isYoutubeUrl = (url = "") => {
  if (!url || typeof url !== "string") return false;
  const lowered = url.toLowerCase().trim();
  return lowered.includes("youtube.com") || lowered.includes("youtu.be");
};

export const getYoutubeVideoId = (url = "") => {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  const match = trimmed.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([^&\n?#]+)/i
  );
  return match?.[1] || null;
};

export const getYoutubeEmbedUrl = (url = "") => {
  const videoId = getYoutubeVideoId(url);
  if (!videoId) return null;
  return `https://www.youtube.com/embed/${videoId}`;
};

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const getVideoUploadUrl = () => {
  if (import.meta.env.VITE_APP_CLOUDINARY_VIDEO_URL) {
    return import.meta.env.VITE_APP_CLOUDINARY_VIDEO_URL;
  }
  if (import.meta.env.VITE_APP_CLOUDINARY_URL) {
    return import.meta.env.VITE_APP_CLOUDINARY_URL.replace(
      "/image/upload",
      "/video/upload"
    );
  }
  return "";
};

const uploadViaBackend = async (file, folder, publicId) => {
  const dataUrl = await fileToDataUrl(file);
  const res = await requests.post("/customer/cloudinary-upload", {
    file: dataUrl,
    folder,
    publicId: publicId ? `${folder}/${publicId}` : undefined,
    resourceType: "video",
  });
  return { secure_url: res.url, public_id: res.publicId };
};

const uploadViaCloudinary = async (file, folder, publicId) => {
  const uploadUrl = getVideoUploadUrl();
  if (!uploadUrl) {
    throw new Error("Cloudinary URL is not configured");
  }

  // 1. Get signature from backend
  const signRes = await requests.post("/customer/cloudinary-sign", {
    publicId,
    folder,
  });

  if (!signRes || !signRes.signature) {
    throw new Error("Failed to generate upload signature on server");
  }

  // 2. Build FormData with the signed parameters
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", signRes.apiKey);
  formData.append("timestamp", signRes.timestamp);
  formData.append("signature", signRes.signature);
  if (publicId) formData.append("public_id", publicId);
  if (folder) formData.append("folder", folder);
  formData.append("return_delete_token", "true");

  const res = await axios.post(uploadUrl, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.secure_url;
};

const VideoUploader = ({
  value = "",
  onChange,
  folder = "product-videos",
  title = "Upload product video",
  hint = "MP4, MOV or WEBM",
  maxSizeMB = 100,
}) => {
  const [activeTab, setActiveTab] = useState(() =>
    isYoutubeUrl(value) ? "link" : "file"
  );
  const [linkInput, setLinkInput] = useState(() => (isYoutubeUrl(value) ? value : ""));
  const [linkError, setLinkError] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: "", type: "success" });

  const maxSize = maxSizeMB * 1024 * 1024;

  const showAlert = (msg, type = "success") => {
    setAlert({ show: true, message: msg, type });
    setTimeout(() => setAlert({ show: false, message: "", type: "success" }), 3500);
  };

  useEffect(() => {
    if (isYoutubeUrl(value)) {
      setActiveTab("link");
      setLinkInput(value);
    } else if (value) {
      setActiveTab("file");
    }
  }, [value]);

  const uploadFile = async (file) => {
    const safeFolder = folder || "product-videos";
    const name = file.name.replaceAll(/\s/g, "");
    const basePublicId = name?.substring(0, name.lastIndexOf(".")) || "video";
    const public_id = `${basePublicId}_${Date.now()}`.replace(/[^a-zA-Z0-9-_]/g, "-");

    if (getVideoUploadUrl() && import.meta.env.VITE_APP_CLOUDINARY_UPLOAD_PRESET) {
      try {
        return await uploadViaCloudinary(file, safeFolder, public_id);
      } catch (err) {
        if (file.size > maxSize) {
          throw err;
        }
      }
    }

    if (file.size > maxSize) {
      throw new Error(
        `Video is too large for upload. Use a file under ${maxSizeMB}MB.`
      );
    }

    const payload = await uploadViaBackend(file, safeFolder, public_id);
    return payload.secure_url;
  };

  const { getRootProps, getInputProps, fileRejections, isDragActive } = useDropzone({
    accept: {
      "video/mp4": [".mp4"],
      "video/webm": [".webm"],
      "video/quicktime": [".mov"],
    },
    multiple: false,
    maxSize,
    disabled: loading,
    onDrop: async (accepted) => {
      const file = accepted[0];
      if (!file) return;

      setLoading(true);
      try {
        const url = await uploadFile(file);
        onChange(url);
        showAlert("Video uploaded successfully!");
      } catch (err) {
        showAlert(
          err?.response?.data?.message || err?.message || "Upload failed",
          "error"
        );
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    if (fileRejections?.length) {
      showAlert(fileRejections[0]?.errors?.[0]?.message || "Invalid video file", "error");
    }
  }, [fileRejections]);

  const dropzoneClass = useMemo(
    () =>
      `border-2 border-dashed rounded-xl cursor-pointer px-6 py-8 text-center transition-colors ${
        isDragActive
          ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
          : "border-gray-300 dark:border-gray-600 hover:border-emerald-400"
      } ${loading ? "opacity-60 pointer-events-none" : ""}`,
    [isDragActive, loading]
  );

  const handleApplyLink = () => {
    const trimmed = (linkInput || "").trim();
    if (!trimmed) {
      setLinkError("Please enter a video or YouTube URL");
      return;
    }

    if (isYoutubeUrl(trimmed)) {
      const vidId = getYoutubeVideoId(trimmed);
      if (!vidId) {
        setLinkError("Could not extract a valid YouTube video ID from this link.");
        return;
      }
      setLinkError("");
      onChange(trimmed);
      showAlert("YouTube video attached successfully!");
      return;
    }

    // Direct video link (e.g. .mp4 / .webm / .mov / Cloudinary)
    const lowered = trimmed.toLowerCase();
    if (
      lowered.includes(".mp4") ||
      lowered.includes(".mov") ||
      lowered.includes(".webm") ||
      lowered.includes("/video/upload")
    ) {
      setLinkError("");
      onChange(trimmed);
      showAlert("Video URL attached successfully!");
      return;
    }

    // Generic URL fallback
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      setLinkError("");
      onChange(trimmed);
      showAlert("Video URL attached!");
      return;
    }

    setLinkError("Please enter a valid URL (starting with https://)");
  };

  const handleRemoveVideo = () => {
    onChange("");
    setLinkInput("");
    setLinkError("");
  };

  const isCurrentYoutube = isYoutubeUrl(value);
  const currentYoutubeEmbed = isCurrentYoutube ? getYoutubeEmbedUrl(value) : null;

  return (
    <div className="w-full space-y-4">
      {/* 1. CURRENT ATTACHED VIDEO PREVIEW */}
      {value ? (
        <div className="relative border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden bg-black shadow-md">
          {isCurrentYoutube && currentYoutubeEmbed ? (
            <div className="relative w-full aspect-video max-h-72 bg-black flex items-center justify-center">
              <iframe
                src={`${currentYoutubeEmbed}?rel=0`}
                title="YouTube Video Preview"
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="relative w-full max-h-64 bg-black flex items-center justify-center p-2">
              <video
                src={value}
                controls
                className="w-full max-h-60 object-contain mx-auto"
              />
            </div>
          )}

          {/* Badges Overlay */}
          <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none">
            {isCurrentYoutube ? (
              <span className="flex items-center gap-1.5 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                <FaYoutube className="text-sm" /> YouTube Video
              </span>
            ) : (
              <span className="flex items-center gap-1.5 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                <FiFilm className="text-sm" /> MP4 Video File
              </span>
            )}
          </div>

          {/* Remove / Replace Button */}
          <button
            type="button"
            className="absolute top-3 right-3 bg-white/95 hover:bg-white text-red-600 hover:text-red-700 p-1.5 rounded-full shadow-lg transition-transform hover:scale-110 cursor-pointer"
            onClick={handleRemoveVideo}
            title="Remove Video"
            aria-label="Remove video"
          >
            <FiXCircle size={22} />
          </button>
        </div>
      ) : null}

      {/* 2. MODE SELECTOR (UPLOAD FILE vs YOUTUBE LINK) */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 dark:border-gray-700/60 pb-2">
        <div className="inline-flex p-1 bg-gray-100 dark:bg-gray-700/70 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab("file")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "file"
                ? "bg-white dark:bg-gray-800 text-emerald-700 dark:text-emerald-400 shadow-xs"
                : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
            }`}
          >
            <FiUploadCloud size={14} />
            <span>Upload File (MP4)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("link")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "link"
                ? "bg-white dark:bg-gray-800 text-red-600 shadow-xs"
                : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
            }`}
          >
            <FaYoutube size={14} className="text-red-600" />
            <span>Paste YouTube Link</span>
          </button>
        </div>

        {value && (
          <span className="text-xs text-gray-400 font-medium">
            Video is currently attached
          </span>
        )}
      </div>

      {/* 3. TAB A: FILE DROPZONE */}
      {activeTab === "file" && (
        <div>
          <div {...getRootProps()} className={dropzoneClass}>
            <input {...getInputProps()} />
            <FiUploadCloud className="text-4xl text-emerald-600 mx-auto" />
            <p className="text-sm mt-3 font-semibold text-gray-800 dark:text-gray-100">
              {loading ? "Uploading video..." : title}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {hint} — max {maxSizeMB}MB. Click or drag & drop.
            </p>
          </div>

          {loading && (
            <p className="text-sm text-emerald-600 flex items-center gap-2 mt-2 font-medium">
              <FiFilm className="animate-pulse" /> Please wait, uploading to Cloudinary...
            </p>
          )}
        </div>
      )}

      {/* 4. TAB B: YOUTUBE / VIDEO LINK INPUT */}
      {activeTab === "link" && (
        <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/40 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
              <FaYoutube className="text-red-600 text-base" />
              <span>Paste YouTube Video or Shorts URL</span>
            </label>
            <span className="text-[11px] text-gray-400">
              watch?v=..., youtu.be, or shorts
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <input
                type="url"
                value={linkInput}
                onChange={(e) => {
                  setLinkInput(e.target.value);
                  setLinkError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleApplyLink();
                  }
                }}
                placeholder="https://www.youtube.com/watch?v=... or https://youtube.com/shorts/..."
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
              />
            </div>
            <button
              type="button"
              onClick={handleApplyLink}
              className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-lg text-xs sm:text-sm font-bold shadow-xs transition-all active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <FiCheck className="text-base" />
              <span>Attach Video</span>
            </button>
          </div>

          {linkError && (
            <p className="text-xs text-red-500 font-semibold flex items-center gap-1.5">
              <FiAlertCircle className="shrink-0" />
              <span>{linkError}</span>
            </p>
          )}

          <div className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed space-y-1">
            <p>
              💡 <strong>How it works:</strong> Simply copy the link of any YouTube video or YouTube Short and paste it here. It will immediately stream on the customer storefront product page without taking up your server storage.
            </p>
          </div>
        </div>
      )}

      {/* Toast Alert Banner */}
      {alert.show &&
        createPortal(
          <div
            className={`fixed top-12 left-1/2 -translate-x-1/2 z-[9999] px-6 py-4 rounded-2xl shadow-lg flex items-center gap-3 text-white ${
              alert.type === "success" ? "bg-teal-600" : "bg-red-600"
            }`}
          >
            {alert.type === "success" ? <FiCheck /> : <FiAlertCircle />}
            <span className="text-sm font-medium">{alert.message}</span>
          </div>,
          document.body
        )}
    </div>
  );
};

export default VideoUploader;
