import axios from "axios";
import requests from "@/services/httpService";

const KB = 1024;
const OPTIMIZABLE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const WEBP_QUALITIES = [0.86, 0.8, 0.72, 0.64];
const MAX_UPLOAD_ATTEMPTS = 3;

const inflight = new Map();
const completed = new Map();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const canvasToBlob = (canvas, type, quality) =>
  new Promise((resolve) => {
    try {
      canvas.toBlob((blob) => resolve(blob), type, quality);
    } catch {
      resolve(null);
    }
  });

export const sha256Hex = async (blob) => {
  if (!blob || typeof window === "undefined" || !window.crypto?.subtle) return null;
  const digest = await window.crypto.subtle.digest("SHA-256", await blob.arrayBuffer());
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

/**
 * Downscales to `maxDimension` (aspect ratio kept) and re-encodes as WebP, stepping
 * quality down until the file fits `targetBytes`. Transparency survives because WebP
 * (and the PNG fallback) keep alpha. Files that are already small, animated (GIF),
 * vector (SVG) or not decodable are returned untouched.
 */
export const optimizeImageFile = async (
  file,
  { maxDimension = 1600, targetBytes = 500 * KB } = {}
) => {
  try {
    if (!file || !OPTIMIZABLE_TYPES.includes((file.type || "").toLowerCase())) return file;
    if (typeof createImageBitmap !== "function") return file;

    const bitmap = await createImageBitmap(file);
    const { width, height } = bitmap;
    const scale = Math.min(1, maxDimension / Math.max(width, height));
    if (scale === 1 && file.size <= targetBytes) {
      bitmap.close?.();
      return file;
    }

    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close?.();
      return file;
    }
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close?.();

    let best = null;
    for (const quality of WEBP_QUALITIES) {
      // eslint-disable-next-line no-await-in-loop
      const blob = await canvasToBlob(canvas, "image/webp", quality);
      if (!blob || blob.type !== "image/webp") break;
      best = blob;
      if (blob.size <= targetBytes) break;
    }
    if (!best) {
      const fallbackType = file.type === "image/png" ? "image/png" : "image/jpeg";
      best = await canvasToBlob(canvas, fallbackType, 0.86);
    }
    if (!best || (scale === 1 && best.size >= file.size)) return file;

    const subtype = best.type.split("/")[1];
    const ext = subtype === "jpeg" ? "jpg" : subtype;
    const baseName = (file.name || "image").replace(/\.[^.]+$/, "") || "image";
    return new File([best], `${baseName}.${ext}`, { type: best.type });
  } catch (err) {
    console.warn("Image optimization skipped:", err?.message || err);
    return file;
  }
};

const postToCloudinary = async (uploadUrl, fields, file, onProgress) => {
  let lastError;
  for (let attempt = 0; attempt < MAX_UPLOAD_ATTEMPTS; attempt += 1) {
    const formData = new FormData();
    Object.entries(fields).forEach(([key, value]) => formData.append(key, String(value)));
    formData.append("file", file);
    try {
      // eslint-disable-next-line no-await-in-loop
      const res = await axios.post(uploadUrl, formData, {
        onUploadProgress: (evt) => {
          if (typeof onProgress === "function" && evt.total) {
            onProgress(Math.round((evt.loaded / evt.total) * 100));
          }
        },
      });
      return res.data;
    } catch (err) {
      lastError = err;
      const status = err?.response?.status;
      if (status && status < 500 && status !== 429) throw err;
      // eslint-disable-next-line no-await-in-loop
      await sleep(800 * 2 ** attempt);
    }
  }
  throw lastError;
};

const signedUpload = async (file, { folder, kind, hash, onProgress }) => {
  const sign = await requests.post("/media/sign", {
    kind,
    folder,
    hash,
    mime: file.type || "",
    bytes: file.size || 0,
  });
  if (!sign || sign.signingAvailable === false) return null;

  if (sign.existing && sign.secure_url) {
    return {
      secure_url: sign.secure_url,
      public_id: sign.public_id,
      width: sign.width,
      height: sign.height,
      format: sign.format,
      resource_type: sign.resource_type,
      existing: true,
    };
  }
  if (!sign.uploadUrl || !sign.fields) return null;

  const data = await postToCloudinary(sign.uploadUrl, sign.fields, file, onProgress);
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
};

/**
 * Hash-addressed, signed upload through `/api/media/sign`.
 * Identical content always maps to the same public_id, so repeated or concurrent
 * uploads of the same file reuse one Cloudinary asset.
 *
 * Resolves to the Cloudinary payload (`secure_url`, `public_id`, ...) or `null`
 * when the signed flow is not available (older backend, no Web Crypto, policy
 * rejection, ...). Callers keep their previous upload path as the fallback for `null`.
 */
export const uploadMedia = async (
  file,
  { folder = "manchanda", kind = "image", optimize = true, maxDimension = 1600, onProgress } = {}
) => {
  if (!file) return null;
  try {
    const hash = await sha256Hex(file);
    if (!hash) return null;

    const key = `${kind}:${folder}:${hash}`;
    if (completed.has(key)) return completed.get(key);
    if (inflight.has(key)) return inflight.get(key);

    const task = (async () => {
      const prepared =
        kind === "image" && optimize ? await optimizeImageFile(file, { maxDimension }) : file;
      return signedUpload(prepared, { folder, kind, hash, onProgress });
    })()
      .then((result) => {
        if (result?.secure_url) completed.set(key, result);
        return result || null;
      })
      .catch((err) => {
        console.warn("Signed upload unavailable, using legacy upload:", err?.response?.data || err?.message);
        return null;
      })
      .finally(() => inflight.delete(key));

    inflight.set(key, task);
    return task;
  } catch (err) {
    console.warn("Signed upload unavailable, using legacy upload:", err?.message || err);
    return null;
  }
};

/** Resolves once every upload started through `uploadMedia` has settled. */
export const waitForPendingUploads = () =>
  Promise.allSettled(Array.from(inflight.values())).then(() => undefined);
