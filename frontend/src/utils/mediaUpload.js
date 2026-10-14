import axios from "axios";
import requests from "@services/httpServices";

const OPTIMIZABLE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const canvasToBlob = (canvas, type, quality) =>
  new Promise((resolve) => {
    try {
      canvas.toBlob((blob) => resolve(blob), type, quality);
    } catch {
      resolve(null);
    }
  });

const sha256Hex = async (blob) => {
  if (!blob || typeof window === "undefined" || !window.crypto?.subtle) return null;
  const digest = await window.crypto.subtle.digest("SHA-256", await blob.arrayBuffer());
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

/** Downscales (aspect ratio kept) and re-encodes to WebP; returns the original on any problem. */
const optimizeImageFile = async (file, { maxDimension = 800, targetBytes = 200 * 1024 } = {}) => {
  try {
    if (!file || !OPTIMIZABLE_TYPES.includes((file.type || "").toLowerCase())) return file;
    if (typeof createImageBitmap !== "function") return file;
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size <= targetBytes) {
      bitmap.close?.();
      return file;
    }
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close?.();
      return file;
    }
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close?.();

    let best = null;
    for (const quality of [0.85, 0.75, 0.65]) {
      // eslint-disable-next-line no-await-in-loop
      const blob = await canvasToBlob(canvas, "image/webp", quality);
      if (!blob || blob.type !== "image/webp") break;
      best = blob;
      if (blob.size <= targetBytes) break;
    }
    if (!best || (scale === 1 && best.size >= file.size)) return file;
    const baseName = (file.name || "image").replace(/\.[^.]+$/, "") || "image";
    return new File([best], `${baseName}.webp`, { type: "image/webp" });
  } catch {
    return file;
  }
};

/**
 * Signed, hash-addressed customer image upload via `/api/media/sign`.
 * Resolves to the Cloudinary payload, or `null` when the signed flow is unavailable
 * (caller then uses its previous upload path).
 */
export const uploadCustomerImage = async (file, { onProgress } = {}) => {
  try {
    if (!file) return null;
    const hash = await sha256Hex(file);
    if (!hash) return null;
    const prepared = await optimizeImageFile(file);

    const sign = await requests.post("/media/sign", {
      kind: "image",
      hash,
      mime: prepared.type || "",
      bytes: prepared.size || 0,
    });
    if (!sign || sign.signingAvailable === false) return null;
    if (sign.existing && sign.secure_url) return { ...sign, existing: true };
    if (!sign.uploadUrl || !sign.fields) return null;

    const formData = new FormData();
    Object.entries(sign.fields).forEach(([key, value]) => formData.append(key, String(value)));
    formData.append("file", prepared);
    const res = await axios.post(sign.uploadUrl, formData, {
      onUploadProgress: (evt) => {
        if (typeof onProgress === "function" && evt.total) {
          onProgress(Math.round((evt.loaded / evt.total) * 100));
        }
      },
    });
    const data = res.data;
    if (!data?.secure_url) return null;

    requests
      .post("/media/register", {
        public_id: data.public_id,
        version: data.version,
        signature: data.signature,
        resource_type: data.resource_type,
        secure_url: data.secure_url,
        width: data.width,
        height: data.height,
        format: data.format,
        bytes: data.bytes,
        created_at: data.created_at,
      })
      .catch(() => {});

    return data;
  } catch (err) {
    console.warn("Signed upload unavailable, using legacy upload:", err?.response?.data || err?.message);
    return null;
  }
};
