import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import { FiUploadCloud, FiXCircle, FiCheck, FiAlertCircle, FiFilm } from "react-icons/fi";
import requests from "@/services/httpService";

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
  const uploadPreset = import.meta.env.VITE_APP_CLOUDINARY_UPLOAD_PRESET;
  const uploadUrl = getVideoUploadUrl();
  if (!uploadPreset || !uploadUrl) {
    throw new Error("Cloudinary is not configured in admin .env");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", folder);
  formData.append("public_id", publicId);

  const res = await axios.post(uploadUrl, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.secure_url;
};

const VideoUploader = ({
  value = "",
  onChange,
  folder = "product-videos",
  title = "Upload video",
  hint = "MP4, MOV or WEBM",
  maxSizeMB = 100,
}) => {
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: "", type: "success" });

  const maxSize = maxSizeMB * 1024 * 1024;

  const showAlert = (msg, type = "success") => {
    setAlert({ show: true, message: msg, type });
    setTimeout(() => setAlert({ show: false, message: "", type: "success" }), 3500);
  };

  const uploadFile = async (file) => {
    const safeFolder = folder || "product-videos";
    const name = file.name.replaceAll(/\s/g, "");
    const basePublicId = name?.substring(0, name.lastIndexOf(".")) || "video";
    const public_id = `${basePublicId}_${Date.now()}`.replace(/[^a-zA-Z0-9-_]/g, "-");

    if (getVideoUploadUrl() && import.meta.env.VITE_APP_CLOUDINARY_UPLOAD_PRESET) {
      try {
        return await uploadViaCloudinary(file, safeFolder, public_id);
      } catch (err) {
        if (file.size > 45 * 1024 * 1024) {
          throw err;
        }
      }
    }

    if (file.size > 45 * 1024 * 1024) {
      throw new Error(
        `Video is too large for server upload. Use a file under ${maxSizeMB}MB or configure Cloudinary in admin .env`
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

  return (
    <div className="w-full space-y-3">
      {value ? (
        <div className="relative border rounded-xl overflow-hidden bg-black">
          <video src={value} controls className="w-full max-h-64 object-contain" />
          <button
            type="button"
            className="absolute top-2 right-2 bg-white/90 rounded-full p-1 text-red-500 shadow"
            onClick={() => onChange("")}
            aria-label="Remove video"
          >
            <FiXCircle size={20} />
          </button>
        </div>
      ) : null}

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
        <p className="text-sm text-emerald-600 flex items-center gap-2">
          <FiFilm className="animate-pulse" /> Please wait, uploading...
        </p>
      )}

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
